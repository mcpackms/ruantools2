import { useState } from 'react';

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
  'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AS', 'ORDER', 'BY',
  'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES', 'UPDATE',
  'SET', 'DELETE', 'CREATE', 'TABLE', 'INDEX', 'DROP', 'ALTER', 'ADD',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'NULL', 'DEFAULT', 'UNIQUE',
  'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'CASE', 'WHEN', 'THEN',
  'ELSE', 'END', 'UNION', 'ALL', 'EXISTS', 'IS', 'ASC', 'DESC'
];

const highlightSql = (sql) => {
  let result = sql;
  SQL_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
    result = result.replace(regex, '<span class="keyword">$1</span>');
  });
  return result;
};

export default function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [uppercase, setUppercase] = useState(true);

  const formatSql = (sql) => {
    if (!sql.trim()) return '';
    
    let formatted = sql;
    
    if (uppercase) {
      SQL_KEYWORDS.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
        formatted = formatted.replace(regex, keyword);
      });
    }
    
    formatted = formatted
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/\s*=\s*/g, ' = ')
      .replace(/\s*<\s*/g, ' < ')
      .replace(/\s*>\s*/g, ' > ')
      .replace(/\s*<=\s*/g, ' <= ')
      .replace(/\s*>=\s*/g, ' >= ')
      .replace(/\s*!=\s*/g, ' != ')
      .replace(/\s*<>\s*/g, ' <> ')
      .trim();
    
    const keywordsToNewline = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'ON', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE'];
    
    keywordsToNewline.forEach(kw => {
      const regex = new RegExp(`\\s+(${kw.replace(' ', '\\s+')})\\s+`, 'gi');
      formatted = formatted.replace(regex, `\n$1 `);
    });
    
    formatted = formatted.replace(/\n\s*\n/g, '\n');
    
    return formatted.trim();
  };

  const handleFormat = () => {
    setOutput(formatSql(input));
  };

  const copyResult = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="sql-formatter">
      <style>{`
        .sql-formatter {
          max-width: 1000px;
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
        .options-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #1e293b;
          cursor: pointer;
        }
        .checkbox-label input {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        .btn {
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
        .editor-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .editor-grid {
            grid-template-columns: 1fr;
          }
        }
        .editor-panel {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }
        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .editor-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
        }
        .editor-content {
          min-height: 400px;
        }
        .sql-input {
          width: 100%;
          min-height: 400px;
          padding: 16px;
          border: none;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.85rem;
          line-height: 1.6;
          resize: vertical;
          background: #1e293b;
          color: #e2e8f0;
        }
        .sql-input:focus {
          outline: none;
        }
        .sql-output {
          width: 100%;
          min-height: 400px;
          padding: 16px;
          border: none;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.85rem;
          line-height: 1.6;
          resize: vertical;
          background: #f8fafc;
          color: #1e293b;
          white-space: pre-wrap;
        }
        .sql-output:focus {
          outline: none;
        }
        :global(.keyword) {
          color: #8b5cf6;
          font-weight: 600;
        }
        .hint {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 16px;
          text-align: center;
        }
      `}</style>

      <div className="header">
        <h1>SQL 格式化</h1>
        <p>在线格式化 SQL 语句，关键字高亮显示</p>
      </div>

      <div className="options-bar">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
          />
          关键字大写
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn" onClick={handleFormat}>
            格式化
          </button>
          <button className="btn btn-outline" onClick={() => { setInput(''); setOutput(''); }}>
            清空
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="editor-panel">
          <div className="editor-header">
            <span className="editor-title">输入 SQL</span>
          </div>
          <div className="editor-content">
            <textarea
              className="sql-input"
              placeholder="在此输入 SQL 语句..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        </div>
        <div className="editor-panel">
          <div className="editor-header">
            <span className="editor-title">格式化结果</span>
            {output && (
              <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={copyResult}>
                复制
              </button>
            )}
          </div>
          <div className="editor-content">
            <textarea
              className="sql-output"
              value={output}
              readOnly
              placeholder="格式化结果..."
            />
          </div>
        </div>
      </div>

      <p className="hint">支持 SELECT、INSERT、UPDATE、DELETE、CREATE 等常见 SQL 语句</p>
    </div>
  );
}
