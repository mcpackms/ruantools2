import { useState } from 'react';

export default function UnicodeConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('toUnicode');

  const toUnicode = (str) => {
    return str.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code > 127) {
        return '\\u' + code.toString(16).padStart(4, '0');
      }
      return char;
    }).join('');
  };

  const fromUnicode = (str) => {
    try {
      return str.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
    } catch {
      return '转换失败，请检查输入格式';
    }
  };

  const handleConvert = () => {
    if (mode === 'toUnicode') {
      setOutput(toUnicode(input));
    } else {
      setOutput(fromUnicode(input));
    }
  };

  const swapMode = () => {
    setMode(mode === 'toUnicode' ? 'fromUnicode' : 'toUnicode');
    setInput(output);
    setOutput('');
  };

  const copyResult = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="unicode-converter">
      <style>{`
        .unicode-converter {
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
          min-height: 120px;
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
          min-height: 120px;
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
        }
        .copy-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .examples {
          margin-top: 24px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
        }
        .examples-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
        }
        .example-item {
          display: flex;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.85rem;
        }
        .example-item:last-child {
          border-bottom: none;
        }
        .example-label {
          color: #64748b;
          min-width: 60px;
        }
        .example-value {
          font-family: monospace;
          color: #1e293b;
        }
      `}</style>

      <div className="header">
        <h1>Unicode 转换</h1>
        <p>文本与 Unicode 编码相互转换</p>
      </div>

      <div className="mode-tabs">
        <div
          className={`mode-tab ${mode === 'toUnicode' ? 'active' : ''}`}
          onClick={() => setMode('toUnicode')}
        >
          文字 → Unicode
        </div>
        <div
          className={`mode-tab ${mode === 'fromUnicode' ? 'active' : ''}`}
          onClick={() => setMode('fromUnicode')}
        >
          Unicode → 文字
        </div>
      </div>

      <div className="converter-section">
        <div className="input-group">
          <label className="input-label">
            {mode === 'toUnicode' ? '输入文字' : '输入 Unicode（如 \\u4e2d\\u6587）'}
          </label>
          <textarea
            className="text-area"
            placeholder={mode === 'toUnicode' ? '输入要转换的文字...' : '输入 Unicode 编码...'}
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
          <label className="input-label">转换结果</label>
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

        <div className="examples">
          <div className="examples-title">示例</div>
          <div className="example-item">
            <span className="example-label">中文</span>
            <span className="example-value">中文 → \u4e2d\u6587</span>
          </div>
          <div className="example-item">
            <span className="example-label">Emoji</span>
            <span className="example-value">😀 → \ud83d\ude00</span>
          </div>
          <div className="example-item">
            <span className="example-label">日文</span>
            <span className="example-value">日本 → \u65e5\u672c</span>
          </div>
        </div>
      </div>
    </div>
  );
}
