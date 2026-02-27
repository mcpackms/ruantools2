import { useState } from 'react';

export default function JwtDecoder() {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState('');

  const decodeJwt = (jwt) => {
    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) {
        throw new Error('无效的 JWT 格式');
      }

      const decodeBase64Url = (str) => {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const padding = '='.repeat((4 - base64.length % 4) % 4);
        return atob(base64 + padding);
      };

      const header = JSON.parse(decodeBase64Url(parts[0]));
      const payload = JSON.parse(decodeBase64Url(parts[1]));

      setDecoded({ header, payload });
      setError('');
    } catch (err) {
      setError(err.message);
      setDecoded(null);
    }
  };

  const formatJson = (obj) => JSON.stringify(obj, null, 2);

  return (
    <div className="jwt-decoder">
      <style>{`
        .jwt-decoder {
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
        .token-input {
          width: 100%;
          min-height: 100px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.85rem;
          resize: vertical;
          transition: border-color 0.2s;
        }
        .token-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .btn {
          margin-top: 12px;
          padding: 10px 20px;
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
        .error-msg {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }
        .result-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .result-section {
            grid-template-columns: 1fr;
          }
        }
        .result-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
        }
        .result-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .result-title .badge {
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 500;
        }
        .badge-header {
          background: #dbeafe;
          color: #1d4ed8;
        }
        .badge-payload {
          background: #dcfce7;
          color: #15803d;
        }
        .json-output {
          background: #f8fafc;
          border-radius: 8px;
          padding: 12px;
          font-family: monospace;
          font-size: 0.8rem;
          white-space: pre-wrap;
          word-break: break-all;
          max-height: 300px;
          overflow-y: auto;
        }
        .hint {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 8px;
        }
      `}</style>

      <div className="header">
        <h1>JWT 解码器</h1>
        <p>在线解码 JWT Token，无需验证签名</p>
      </div>

      <div className="input-section">
        <label className="input-label">输入 JWT Token</label>
        <textarea
          className="token-input"
          placeholder="粘贴 JWT Token 到此处..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button className="btn" onClick={() => decodeJwt(token.trim())}>
          解码 Token
        </button>
        <p className="hint">⚠️ 注意：此工具仅解码，不验证签名可靠性</p>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {decoded && (
        <div className="result-section">
          <div className="result-card">
            <div className="result-title">
              Header
              <span className="badge badge-header">JWT Header</span>
            </div>
            <pre className="json-output">{formatJson(decoded.header)}</pre>
          </div>
          <div className="result-card">
            <div className="result-title">
              Payload
              <span className="badge badge-payload">JWT Payload</span>
            </div>
            <pre className="json-output">{formatJson(decoded.payload)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
