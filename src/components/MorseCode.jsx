import { useState } from 'react';

export default function MorseCode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('toMorse');

  const morseCodeMap = {
    'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.',
    'g': '--.', 'h': '....', 'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..',
    'm': '--', 'n': '-.', 'o': '---', 'p': '.--.', 'q': '--.-', 'r': '.-.',
    's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
    'y': '-.--', 'z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '/': '-..-.',
    '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.',
    '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
    '\'': '.----.', '@': '.--.-.', ' ': '/'
  };

  const reverseMap = Object.fromEntries(
    Object.entries(morseCodeMap).map(([k, v]) => [v, k])
  );

  const toMorse = (text) => {
    return text.toLowerCase().split('').map(char => morseCodeMap[char] || char).join(' ');
  };

  const fromMorse = (code) => {
    return code.split(' ').map(word => reverseMap[word] || word).join('');
  };

  const handleConvert = () => {
    if (mode === 'toMorse') {
      setOutput(toMorse(input));
    } else {
      setOutput(fromMorse(input));
    }
  };

  const swapMode = () => {
    setMode(mode === 'toMorse' ? 'toText' : 'toMorse');
    setInput(output);
    setOutput('');
  };

  const copyResult = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="morse-code">
      <style>{`
        .morse-code {
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
        .converter-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
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
        .input-group {
          margin-bottom: 20px;
        }
        .input-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
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
          transition: all 0.2s;
        }
        .copy-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .cheat-sheet {
          margin-top: 20px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
        }
        .cheat-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
        }
        .cheat-content {
          font-family: monospace;
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.8;
        }
      `}</style>

      <div className="header">
        <h1>摩斯电码转换</h1>
        <p>文本与摩斯电码相互转换</p>
      </div>

      <div className="converter-section">
        <div className="mode-tabs">
          <div
            className={`mode-tab ${mode === 'toMorse' ? 'active' : ''}`}
            onClick={() => setMode('toMorse')}
          >
            文字 → 摩斯
          </div>
          <div
            className={`mode-tab ${mode === 'toText' ? 'active' : ''}`}
            onClick={() => setMode('toText')}
          >
            摩斯 → 文字
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">
            {mode === 'toMorse' ? '输入文字' : '输入摩斯电码'}
          </label>
          <textarea
            className="text-area"
            placeholder={mode === 'toMorse' ? '输入要转换的文字...' : '输入摩斯电码（如 .- -... -.-.）...'}
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
            {mode === 'toMorse' ? '摩斯电码' : '转换结果'}
          </label>
          <textarea
            className="result-area"
            value={output}
            readOnly
            placeholder="转换结果将显示在这里..."
          />
          {output && (
            <button className="copy-btn" onClick={copyResult}>
              复制
            </button>
          )}
        </div>

        <div className="cheat-sheet">
          <div className="cheat-title">摩斯电码对照表</div>
          <div className="cheat-content">
            A .-      B -...    C -.-.    D -..     E .      F ..-.
            G --.     H ....    I ..      J .---    K -.-     L .-..
            M --      N -.      O ---     P .--.    Q --.-    R .-.
            S ...     T -       U ..-     V ...-    W .--     X -..-
            Y -.--    Z --..
            0 -----   1 .----   2 ..---   3 ...--   4 ....-   5 .....
            6 -....   7 --...   8 ---..   9 ----.
          </div>
        </div>
      </div>
    </div>
  );
}
