import { useState, useEffect } from 'react';

export default function WordCounter() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    chars: 0,
    charsNoSpaces: 0,
    words: 0,
    lines: 0,
    paragraphs: 0,
    chinese: 0,
    english: 0,
    numbers: 0
  });

  useEffect(() => {
    if (!text) {
      setStats({
        chars: 0,
        charsNoSpaces: 0,
        words: 0,
        lines: 0,
        paragraphs: 0,
        chinese: 0,
        english: 0,
        numbers: 0
      });
      return;
    }

    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const lines = text.split('\n').length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length || (text.trim() ? 1 : 0);
    const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const english = (text.match(/[a-zA-Z]/g) || []).length;
    const numbers = (text.match(/[0-9]/g) || []).length;
    
    const words = text
      .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0)
      .length;

    setStats({ chars, charsNoSpaces, words, lines, paragraphs, chinese, english, numbers });
  }, [text]);

  const handleClear = () => {
    setText('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  const getReadingTime = () => {
    const wordsPerMinute = 200;
    return Math.ceil(stats.words / wordsPerMinute);
  };

  const statCards = [
    { label: '字符数', value: stats.chars },
    { label: '字符数（不含空格）', value: stats.charsNoSpaces },
    { label: '单词数', value: stats.words },
    { label: '行数', value: stats.lines },
    { label: '段落数', value: stats.paragraphs },
    { label: '中文字符', value: stats.chinese },
    { label: '英文字母', value: stats.english },
    { label: '数字', value: stats.numbers }
  ];

  return (
    <div className="word-counter">
      <style>{`
        .word-counter {
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
        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .reading-time {
          font-size: 0.9rem;
          color: #64748b;
          background: #f1f5f9;
          padding: 8px 16px;
          border-radius: 20px;
        }
        .btn-group {
          display: flex;
          gap: 12px;
        }
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
        }
        .btn-outline {
          background: white;
          border: 1px solid #e2e8f0;
          color: #64748b;
        }
        .btn:hover {
          transform: translateY(-1px);
        }
        .text-area {
          width: 100%;
          min-height: 250px;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.95rem;
          line-height: 1.7;
          resize: vertical;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .text-area:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }
        .stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.2s;
        }
        .stat-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }
        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #3b82f6;
          display: block;
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 0.85rem;
          color: #64748b;
        }
        .summary-card {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          text-align: center;
        }
        .summary-card .stat-value {
          color: white;
        }
        .summary-card .stat-label {
          color: rgba(255, 255, 255, 0.8);
        }
      `}</style>

      <div className="header">
        <h1>字数统计</h1>
        <p>统计文本字数、行数、字符数，支持中英文混合统计</p>
      </div>

      <div className="toolbar">
        <div className="reading-time">
          📖 阅读时间约 {getReadingTime()} 分钟
        </div>
        <div className="btn-group">
          <button className="btn btn-outline" onClick={handleCopy}>
            复制文本
          </button>
          <button className="btn btn-outline" onClick={handleClear}>
            清空
          </button>
        </div>
      </div>

      <textarea
        className="text-area"
        placeholder="在此输入或粘贴文本..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="stats-grid">
        <div className="stat-card summary-card">
          <span className="stat-value">{stats.words}</span>
          <span className="stat-label">总词数</span>
        </div>
        {statCards.slice(0, 7).map((stat, index) => (
          <div key={index} className="stat-card">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
