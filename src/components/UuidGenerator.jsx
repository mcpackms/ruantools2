import { useState } from 'react';

export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [version, setVersion] = useState('v4');
  const [uuids, setUuids] = useState([]);
  const [copied, setCopied] = useState(null);

  const generateUuid = () => {
    if (version === 'v4') {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    } else {
      return 'xxxxxxxx-xxxx-1xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  };

  const generate = () => {
    const newUuids = Array.from({ length: count }, () => generateUuid());
    setUuids(newUuids);
    setCopied(null);
  };

  const copyOne = (uuid, index) => {
    navigator.clipboard.writeText(uuid);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="uuid-generator">
      <style>{`
        .uuid-generator {
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
        .options-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .option-row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          align-items: center;
        }
        .option-group {
          flex: 1;
          min-width: 200px;
        }
        .option-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
        }
        .select-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
        }
        .select-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .count-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
        }
        .count-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .result-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
        }
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .result-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }
        .uuid-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 400px;
          overflow-y: auto;
        }
        .uuid-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: #f8fafc;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.9rem;
          color: #1e293b;
        }
        .uuid-text {
          flex: 1;
          word-break: break-all;
        }
        .copy-btn {
          padding: 6px 10px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.75rem;
          color: #64748b;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .copy-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .copy-btn.copied {
          background: #dcfce7;
          border-color: #86efac;
          color: #15803d;
        }
        .version-info {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 8px;
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: 6px;
        }
      `}</style>

      <div className="header">
        <h1>UUID 生成器</h1>
        <p>批量生成 UUID，支持 UUID v1 和 v4</p>
      </div>

      <div className="options-section">
        <div className="option-row">
          <div className="option-group">
            <label className="option-label">UUID 版本</label>
            <select className="select-input" value={version} onChange={(e) => setVersion(e.target.value)}>
              <option value="v4">UUID v4 (随机)</option>
              <option value="v1">UUID v1 (时间戳)</option>
            </select>
          </div>
          <div className="option-group">
            <label className="option-label">生成数量</label>
            <input
              type="number"
              className="count-input"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              min="1"
              max="100"
            />
          </div>
          <button className="btn" onClick={generate}>
            生成 UUID
          </button>
        </div>
        <div className="version-info">
          {version === 'v4' ? 'UUID v4：基于随机数生成，理论上几乎不可能重复' : 'UUID v1：基于时间戳和MAC地址生成，同一机器短期内可能重复'}
        </div>
      </div>

      {uuids.length > 0 && (
        <div className="result-section">
          <div className="result-header">
            <span className="result-title">生成结果</span>
            <button className={`copy-btn ${copied === 'all' ? 'copied' : ''}`} onClick={copyAll}>
              {copied === 'all' ? '已复制' : '复制全部'}
            </button>
          </div>
          <div className="uuid-list">
            {uuids.map((uuid, index) => (
              <div key={index} className="uuid-item">
                <span className="uuid-text">{uuid}</span>
                <button
                  className={`copy-btn ${copied === index ? 'copied' : ''}`}
                  onClick={() => copyOne(uuid, index)}
                >
                  {copied === index ? '已复制' : '复制'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
