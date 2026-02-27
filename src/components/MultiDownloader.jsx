import { useState, useRef, useEffect } from 'react';

export default function MultiDownloader() {
  const [url, setUrl] = useState('');
  const [threads, setThreads] = useState(4);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [downloadInfo, setDownloadInfo] = useState(null);
  const [history, setHistory] = useState([]);
  
  const abortRef = useRef(false);
  const startTimeRef = useRef(0);
  const downloadedRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem('downloadHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveHistory = (item) => {
    const newHistory = [item, ...history.filter(h => h.url !== item.url)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('downloadHistory', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('downloadHistory');
  };

  const fetchFileInfo = async () => {
    if (!url.trim()) {
      setError('请输入下载链接');
      return;
    }

    setError('');
    setStatus('正在获取文件信息...');
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentLength = parseInt(response.headers.get('content-length') || '0');
      const contentType = response.headers.get('content-type') || 'unknown';
      const filename = response.headers.get('content-disposition')?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)?.[1]?.replace(/['"]/g, '') 
        || url.split('/').pop() || 'download';

      const supportsRange = response.headers.get('accept-ranges') === 'bytes';
      
      setDownloadInfo({
        filename,
        size: contentLength,
        sizeFormatted: formatSize(contentLength),
        contentType,
        supportsRange,
        url
      });
      
      setStatus(supportsRange ? '服务器支持断点续传' : '服务器不支持断点续传，将从头下载');
    } catch (err) {
      setError(`获取文件信息失败: ${err.message}`);
      setStatus('');
    }
  };

  const startDownload = async () => {
    if (!downloadInfo) {
      await fetchFileInfo();
      if (error || !downloadInfo) return;
    }

    setDownloading(true);
    setProgress(0);
    setSpeed(0);
    downloadedRef.current = 0;
    startTimeRef.current = Date.now();
    abortRef.current = false;

    const { size, supportsRange, url: downloadUrl, filename } = downloadInfo;
    
    try {
      if (supportsRange && size > 1024 * 1024) {
        await multiThreadDownload(downloadUrl, size, filename);
      } else {
        await simpleDownload(downloadUrl, filename);
      }
    } catch (err) {
      if (!abortRef.current) {
        setError(`下载失败: ${err.message}`);
      }
    } finally {
      setDownloading(false);
      setStatus('');
    }
  };

  const multiThreadDownload = async (downloadUrl, totalSize, filename) => {
    setStatus(`正在使用 ${threads} 个线程下载...`);
    
    const chunkSize = Math.ceil(totalSize / threads);
    const chunks = [];
    
    for (let i = 0; i < threads; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, totalSize) - 1;
      if (start < totalSize) {
        chunks.push({ start, end, index: i });
      }
    }

    const chunkData = await Promise.all(
      chunks.map(async ({ start, end, index }) => {
        if (abortRef.current) return null;
        
        const response = await fetch(downloadUrl, {
          headers: { Range: `bytes=${start}-${end}` }
        });
        
        if (!response.ok) {
          throw new Error(`线程 ${index + 1} 下载失败`);
        }
        
        const blob = await response.blob();
        downloadedRef.current += blob.size;
        
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        if (elapsed > 0 && totalSize > 0) {
          setSpeed(Math.round(downloadedRef.current / elapsed));
          setProgress(Math.min(100, Math.round((downloadedRef.current / totalSize) * 100)));
        }
        
        return { index, data: blob };
      })
    );

    if (abortRef.current) return;

    setStatus('正在合并文件...');
    
    const sortedChunks = chunkData.filter(Boolean).sort((a, b) => a.index - b.index);
    const mergedBlob = new Blob(sortedChunks.map(c => c.data));
    
    downloadBlob(mergedBlob, filename);
    setProgress(100);
    setStatus('下载完成！');
    
    saveHistory({ url: downloadUrl, filename, size: totalSize, time: Date.now() });
  };

  const simpleDownload = async (downloadUrl, filename) => {
    setStatus('正在下载...');
    
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const chunks = [];
    let receivedLength = 0;

    while (true) {
      if (abortRef.current) {
        reader.cancel();
        throw new Error('下载已取消');
      }

      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      if (elapsed > 0 && downloadInfo.size > 0) {
        setSpeed(Math.round(receivedLength / elapsed));
        setProgress(Math.min(100, Math.round((receivedLength / downloadInfo.size) * 100)));
      }
    }

    if (abortRef.current) return;

    const blob = new Blob(chunks);
    downloadBlob(blob, filename);
    setProgress(100);
    setStatus('下载完成！');
    
    saveHistory({ url: downloadUrl, filename, size: downloadInfo.size, time: Date.now() });
  };

  const downloadBlob = (blob, filename) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const cancelDownload = () => {
    abortRef.current = true;
    setDownloading(false);
    setStatus('正在取消...');
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="multi-downloader">
      <style>{`
        .multi-downloader {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }
        .header p {
          color: #64748b;
          font-size: 0.9rem;
        }
        .warning {
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 10px;
          padding: 14px 18px;
          margin-bottom: 20px;
          font-size: 0.85rem;
          color: #92400e;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .warning-icon {
          font-size: 1.1rem;
        }
        .input-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 20px;
        }
        .input-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 10px;
        }
        .url-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }
        .url-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .options-row {
          display: flex;
          gap: 16px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .option-group {
          flex: 1;
          min-width: 150px;
        }
        .option-label {
          display: block;
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 8px;
        }
        .option-select, .option-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
        }
        .btn-group {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        .btn {
          padding: 14px 28px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .btn-primary {
          background: linear-gradient(135deg, #eab308, #ca8a04);
          color: white;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(234, 179, 8, 0.35);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-outline {
          background: white;
          border: 1px solid #e2e8f0;
          color: #64748b;
        }
        .btn-outline:hover {
          border-color: #eab308;
          color: #eab308;
        }
        .btn-danger {
          background: #fee2e2;
          color: #dc2626;
        }
        .btn-danger:hover {
          background: #fecaca;
        }
        .error-msg {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 14px 18px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }
        .status-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 20px;
        }
        .status-text {
          font-size: 0.95rem;
          color: #1e293b;
          margin-bottom: 16px;
          text-align: center;
        }
        .progress-bar {
          height: 24px;
          background: #f1f5f9;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #eab308, #facc15);
          border-radius: 12px;
          transition: width 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
          min-width: 50px;
        }
        .stats-row {
          display: flex;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
        }
        .stat-item {
          text-align: center;
        }
        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #eab308;
        }
        .stat-label {
          font-size: 0.8rem;
          color: #64748b;
        }
        .info-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .info-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 16px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }
        .info-item {
          background: #f8fafc;
          padding: 14px;
          border-radius: 10px;
        }
        .info-label {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 4px;
        }
        .info-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
          word-break: break-all;
        }
        .history-section {
          margin-top: 30px;
        }
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .history-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0;
        }
        .clear-history-btn {
          padding: 6px 14px;
          background: transparent;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.8rem;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        .clear-history-btn:hover {
          background: #fee2e2;
          border-color: #fecaca;
          color: #dc2626;
        }
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .history-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .history-info {
          flex: 1;
          min-width: 0;
        }
        .history-name {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .history-size {
          font-size: 0.8rem;
          color: #64748b;
        }
        .history-btn {
          padding: 6px 14px;
          background: #f1f5f9;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          color: #64748b;
          cursor: pointer;
        }
        .history-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }
      `}</style>

      <div className="header">
        <h1>多线程下载器</h1>
        <p>使用多线程并行下载文件，支持断点续传</p>
      </div>

      <div className="warning">
        <span className="warning-icon">⚠️</span>
        <span>
          由于浏览器安全限制，部分服务器可能无法支持多线程下载。
          如果下载失败，请尝试减少线程数或使用单线程下载。
          本工具不会上传任何数据，所有下载均在浏览器本地完成。
        </span>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="input-section">
        <label className="input-label">下载链接</label>
        <input
          type="text"
          className="url-input"
          placeholder="输入文件的下载链接..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={downloading}
        />
        
        <div className="options-row">
          <div className="option-group">
            <span className="option-label">线程数量</span>
            <select 
              className="option-select" 
              value={threads} 
              onChange={(e) => setThreads(parseInt(e.target.value))}
              disabled={downloading}
            >
              <option value="1">1 线程</option>
              <option value="2">2 线程</option>
              <option value="4">4 线程</option>
              <option value="8">8 线程</option>
              <option value="16">16 线程</option>
            </select>
          </div>
        </div>

        <div className="btn-group">
          {!downloading ? (
            <button className="btn btn-primary" onClick={startDownload}>
              开始下载
            </button>
          ) : (
            <button className="btn btn-danger" onClick={cancelDownload}>
              取消下载
            </button>
          )}
          <button 
            className="btn btn-outline" 
            onClick={() => { setUrl(''); setDownloadInfo(null); setError(''); setProgress(0); }}
            disabled={downloading}
          >
            清空
          </button>
        </div>
      </div>

      {downloadInfo && (
        <div className="info-card">
          <div className="info-title">文件信息</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">文件名</div>
              <div className="info-value">{downloadInfo.filename}</div>
            </div>
            <div className="info-item">
              <div className="info-label">文件大小</div>
              <div className="info-value">{downloadInfo.sizeFormatted}</div>
            </div>
            <div className="info-item">
              <div className="info-label">文件类型</div>
              <div className="info-value">{downloadInfo.contentType}</div>
            </div>
            <div className="info-item">
              <div className="info-label">断点续传</div>
              <div className="info-value">{downloadInfo.supportsRange ? '✓ 支持' : '✗ 不支持'}</div>
            </div>
          </div>
        </div>
      )}

      {downloading && (
        <div className="status-card">
          <div className="status-text">{status}</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}>
              {progress}%
            </div>
          </div>
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-value">{formatSize(speed)}/s</div>
              <div className="stat-label">下载速度</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{progress}%</div>
              <div className="stat-label">已完成</div>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="history-section">
          <div className="history-header">
            <div className="history-title">下载历史</div>
            <button className="clear-history-btn" onClick={clearHistory}>
              清除历史
            </button>
          </div>
          <div className="history-list">
            {history.map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-info">
                  <div className="history-name">{item.filename}</div>
                  <div className="history-size">{formatSize(item.size)}</div>
                </div>
                <button 
                  className="history-btn"
                  onClick={() => setUrl(item.url)}
                >
                  重新下载
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
