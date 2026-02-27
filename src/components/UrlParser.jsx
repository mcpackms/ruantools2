import { useState, useEffect } from 'react';

export default function UrlParser() {
  const [url, setUrl] = useState('https://example.com/path?name=test&age=25&active=true');
  const [parsed, setParsed] = useState({
    protocol: '',
    host: '',
    port: '',
    path: '',
    params: {},
    hash: ''
  });

  useEffect(() => {
    parseUrl(url);
  }, []);

  const parseUrl = (urlStr) => {
    try {
      const urlObj = new URL(urlStr);
      const params = {};
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      setParsed({
        protocol: urlObj.protocol.replace(':', ''),
        host: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        params: params,
        hash: urlObj.hash.replace('#', ''),
        username: urlObj.username,
        password: urlObj.password
      });
    } catch (e) {
      setParsed({
        protocol: '',
        host: '',
        port: '',
        path: '',
        params: {},
        hash: ''
      });
    }
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    parseUrl(newUrl);
  };

  const updateParam = (key, value) => {
    const newUrl = new URL(url);
    if (value) {
      newUrl.searchParams.set(key, value);
    } else {
      newUrl.searchParams.delete(key);
    }
    const newUrlStr = newUrl.toString();
    setUrl(newUrlStr);
    parseUrl(newUrlStr);
  };

  const addParam = () => {
    const newUrl = new URL(url);
    newUrl.searchParams.append('key', 'value');
    setUrl(newUrl.toString());
    parseUrl(newUrl.toString());
  };

  const removeParam = (key) => {
    const newUrl = new URL(url);
    newUrl.searchParams.delete(key);
    setUrl(newUrl.toString());
    parseUrl(newUrl.toString());
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="url-parser">
      <style>{`
        .url-parser {
          max-width: 900px;
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
        .input-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
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
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }
        .url-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .copy-btn {
          margin-top: 12px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.85rem;
          color: #64748b;
          cursor: pointer;
        }
        .copy-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .info-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px;
        }
        .info-label {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 6px;
        }
        .info-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          font-family: monospace;
        }
        .params-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
        }
        .params-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .params-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }
        .add-btn {
          padding: 8px 16px;
          background: #3b82f6;
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }
        .params-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .param-item {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .param-key {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.9rem;
        }
        .param-value {
          flex: 2;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.9rem;
        }
        .param-key:focus, .param-value:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .delete-btn {
          padding: 8px 12px;
          background: #fee2e2;
          border: none;
          border-radius: 6px;
          color: #dc2626;
          cursor: pointer;
        }
        .delete-btn:hover {
          background: #fecaca;
        }
        .empty-msg {
          text-align: center;
          color: #94a3b8;
          padding: 20px;
          font-size: 0.9rem;
        }
      `}</style>

      <div className="header">
        <h1>URL 参数解析</h1>
        <p>解析 URL 查询参数，可视化编辑</p>
      </div>

      <div className="input-section">
        <label className="input-label">完整 URL</label>
        <input
          type="text"
          className="url-input"
          value={url}
          onChange={handleUrlChange}
          placeholder="输入 URL..."
        />
        <button className="copy-btn" onClick={copyUrl}>
          复制 URL
        </button>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <div className="info-label">协议</div>
          <div className="info-value">{parsed.protocol || '-'}</div>
        </div>
        <div className="info-card">
          <div className="info-label">主机</div>
          <div className="info-value">{parsed.host || '-'}</div>
        </div>
        <div className="info-card">
          <div className="info-label">端口</div>
          <div className="info-value">{parsed.port || '-'}</div>
        </div>
        <div className="info-card">
          <div className="info-label">路径</div>
          <div className="info-value">{parsed.path || '-'}</div>
        </div>
        <div className="info-card">
          <div className="info-label">锚点</div>
          <div className="info-value">{parsed.hash || '-'}</div>
        </div>
        <div className="info-card">
          <div className="info-label">参数数量</div>
          <div className="info-value">{Object.keys(parsed.params).length}</div>
        </div>
      </div>

      <div className="params-section">
        <div className="params-header">
          <span className="params-title">查询参数</span>
          <button className="add-btn" onClick={addParam}>
            + 添加参数
          </button>
        </div>

        {Object.keys(parsed.params).length > 0 ? (
          <div className="params-list">
            {Object.entries(parsed.params).map(([key, value]) => (
              <div key={key} className="param-item">
                <input
                  type="text"
                  className="param-key"
                  value={key}
                  onChange={(e) => updateParam(e.target.value, value)}
                  placeholder="参数名"
                />
                <input
                  type="text"
                  className="param-value"
                  value={value}
                  onChange={(e) => updateParam(key, e.target.value)}
                  placeholder="参数值"
                />
                <button className="delete-btn" onClick={() => removeParam(key)}>
                  删除
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-msg">暂无查询参数</div>
        )}
      </div>
    </div>
  );
}
