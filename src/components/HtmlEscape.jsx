import { useState } from 'react';

export default function HtmlEscape() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('escape');

  const escapeHtml = (str) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return str.replace(/[&<>"']/g, char => map[char]);
  };

  const unescapeHtml = (str) => {
    const map = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'"
    };
    let result = str;
    Object.keys(map).forEach(key => {
      result = result.replace(new RegExp(key, 'g'), map[key]);
    });
    return result;
  };

  const handleConvert = () => {
    if (mode === 'escape') {
      setOutput(escapeHtml(input));
    } else {
      setOutput(unescapeHtml(input));
    }
  };

  const swapMode = () => {
    setMode(mode === 'escape' ? 'unescape' : 'escape');
    setInput(output);
    setOutput('');
  };

  const copyResult = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="html-escape">
      <style>{`
        .html-escape {
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
        .mode-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }
        .mode-tab {
          flex: 1;
          padding: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          color: #64748b;
          transition: all 0.2s;
          text-align: center;
        }
        .mode-tab.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }
        .mode-tab:hover:not(.active) {
          border-color: #3b82f6;
          color: #3b82f6;
        }
        .converter-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
        }
        .input-group {
          margin-bottom: 20px;
        }
        .input-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 10px;
        }
        .text-area {
          width: 100%;
          min-height: 150px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.9rem;
          resize: vertical;
          transition: border-color 0.2s;
        }
        .text-area:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .action-row {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
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
        .btn-outline {
          background: white;
          border: 1px solid #e2e8f0;
          color: #64748b;
        }
        .btn-outline:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          box-shadow: none;
        }
        .result-group {
          position: relative;
        }
        .result-area {
          width: 100%;
          min-height: 150px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.9rem;
          background: #f8fafc;
          resize: vertical;
        }
        .copy-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 6px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.75rem;
          color: #64748b;
          transition: all 0.2s;
        }
        .copy-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .cheat-sheet {
          margin-top: 24px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
        }
        .cheat-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
        }
        .cheat-table {
          width: 100%;
          font-size: 0.85rem;
        }
        .cheat-table th, .cheat-table td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        .cheat-table th {
          color: #64748b;
          font-weight: 500;
        }
        .cheat-table td {
          font-family: monospace;
          color: #1e293b;
        }
        .cheat-table tr:last-child td {
          border-bottom: none;
        }
      `}</style>

      <div className="header">
        <h1>HTML 转义</h1>
        <p>HTML 实体编码与解码，防止 XSS 攻击</p>
      </div>

      <div className="mode-tabs">
        <div
          className={`mode-tab ${mode === 'escape' ? 'active' : ''}`}
          onClick={() => setMode('escape')}
        >
          编码 (Escape)
        </div>
        <div
          className={`mode-tab ${mode === 'unescape' ? 'active' : ''}`}
          onClick={() => setMode('unescape')}
        >
          解码 (Unescape)
        </div>
      </div>

      <div className="converter-section">
        <div className="input-group">
          <label className="input-label">
            {mode === 'escape' ? '输入原文' : '输入 HTML 实体'}
          </label>
          <textarea
            className="text-area"
            placeholder={mode === 'escape' ? '输入要转义的 HTML...' : '输入 HTML 实体（如 &lt;div&gt;）...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="action-row">
          <button className="btn" onClick={handleConvert}>
            转换
          </button>
          <button className="btn btn-outline" onClick={swapMode}>
            交换
          </button>
          <button className="btn btn-outline" onClick={() => { setInput(''); setOutput(''); }}>
            清空
          </button>
        </div>

        <div className="result-group">
          <label className="input-label">
            {mode === 'escape' ? '转义结果' : '解码结果'}
          </label>
          <textarea
            className="result-area"
            value={output}
            readOnly
            placeholder="结果将显示在这里..."
          />
          {output && (
            <button className="copy-btn" onClick={copyResult}>
              复制
            </button>
          )}
        </div>

        <div className="cheat-sheet">
          <div className="cheat-title">HTML 实体对照表</div>
          <table className="cheat-table">
            <thead>
              <tr>
                <th>字符</th>
                <th>实体名称</th>
                <th>实体编号</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>&lt;</td><td>&amp;lt;</td><td>&amp;#60;</td></tr>
              <tr><td>&gt;</td><td>&amp;gt;</td><td>&amp;#62;</td></tr>
              <tr><td>&amp;</td><td>&amp;amp;</td><td>&amp;#38;</td></tr>
              <tr><td>"</td><td>&amp;quot;</td><td>&amp;#34;</td></tr>
              <tr><td>'</td><td>&amp;#39;</td><td>&amp;#39;</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
