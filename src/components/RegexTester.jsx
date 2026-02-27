import { useState, useRef, useEffect } from 'react';

export default function RegexTester() {
  const [regex, setRegex] = useState('\\w+@\\w+\\.\\w+');
  const [testText, setTestText] = useState('请发送邮件到 test@example.com 或联系 admin@domain.com');
  const [flags, setFlags] = useState({
    global: true,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false
  });
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [resultCount, setResultCount] = useState(0);
  const [highlightedText, setHighlightedText] = useState('');
  const [matchInfo, setMatchInfo] = useState('');
  
  const textareaRef = useRef(null);

  const buildFlagsString = () => {
    let flagStr = '';
    if (flags.global) flagStr += 'g';
    if (flags.ignoreCase) flagStr += 'i';
    if (flags.multiline) flagStr += 'm';
    if (flags.dotAll) flagStr += 's';
    if (flags.unicode) flagStr += 'u';
    if (flags.sticky) flagStr += 'y';
    return flagStr;
  };

  const testRegex = () => {
    setError('');
    setMatches([]);
    setResultCount(0);
    setHighlightedText(testText);
    setMatchInfo('');

    if (!regex.trim()) {
      setError('请输入正则表达式');
      return;
    }

    if (!testText.trim()) {
      setError('请输入测试文本');
      return;
    }

    try {
      const flagStr = buildFlagsString();
      const pattern = new RegExp(regex, flagStr);
      
      const matchesArray = [];
      
      if (flags.global) {
        const globalMatches = testText.matchAll(pattern);
        for (const m of globalMatches) {
          matchesArray.push({
            fullMatch: m[0],
            index: m.index,
            groups: m.slice(1),
            groupsNamed: m.groups || {}
          });
        }
      } else {
        const singleMatch = pattern.exec(testText);
        if (singleMatch) {
          matchesArray.push({
            fullMatch: singleMatch[0],
            index: singleMatch.index,
            groups: singleMatch.slice(1),
            groupsNamed: singleMatch.groups || {}
          });
        }
      }
      
      setMatches(matchesArray);
      setResultCount(matchesArray.length);
      
      if (matchesArray.length > 0) {
        let lastIndex = 0;
        const segments = [];
        matchesArray.forEach(match => {
          segments.push(testText.slice(lastIndex, match.index));
          segments.push(`<mark class="match-highlight">${escapeHtml(match.fullMatch)}</mark>`);
          lastIndex = match.index + match.fullMatch.length;
        });
        segments.push(testText.slice(lastIndex));
        setHighlightedText(segments.join(''));
      }
      
      if (matchesArray.length > 0) {
        let info = `找到 ${matchesArray.length} 个匹配项\n\n`;
        matchesArray.forEach((match, idx) => {
          info += `匹配 #${idx + 1}:\n`;
          info += `  完整匹配: "${match.fullMatch}"\n`;
          info += `  位置: 索引 ${match.index}\n`;
          info += `  长度: ${match.fullMatch.length} 字符\n`;
          
          if (match.groups.length > 0) {
            info += `  捕获组:\n`;
            match.groups.forEach((group, groupIdx) => {
              info += `    $${groupIdx + 1}: "${group || '(空)'}"\n`;
            });
          }
          
          if (Object.keys(match.groupsNamed).length > 0) {
            info += `  命名捕获组:\n`;
            Object.entries(match.groupsNamed).forEach(([name, value]) => {
              info += `    ${name}: "${value || '(空)'}"\n`;
            });
          }
          info += '\n';
        });
        setMatchInfo(info);
      } else {
        setMatchInfo('没有找到匹配项。');
      }
      
    } catch (err) {
      setError(`正则表达式错误: ${err.message}`);
    }
  };

  const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const clearAll = () => {
    setRegex('');
    setTestText('');
    setFlags({
      global: true,
      ignoreCase: false,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false
    });
    setMatches([]);
    setError('');
    setResultCount(0);
    setHighlightedText('');
    setMatchInfo('');
  };

  const toggleFlag = (flagName) => {
    setFlags(prev => ({
      ...prev,
      [flagName]: !prev[flagName]
    }));
  };

  const loadExample = (example) => {
    setRegex(example.regex);
    setTestText(example.text);
    setFlags(example.flags || {
      global: true,
      ignoreCase: false,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false
    });
  };

  const examples = [
    {
      name: '邮箱地址',
      regex: '\\w+@\\w+\\.\\w+',
      text: '请发送邮件到 test@example.com 或联系 admin@domain.com',
      description: '匹配简单的邮箱地址'
    },
    {
      name: '手机号码',
      regex: '1[3-9]\\d{9}',
      text: '我的手机是13800138000，备用手机是13912345678',
      description: '匹配中国大陆手机号码'
    },
    {
      name: '日期格式',
      regex: '\\d{4}-\\d{2}-\\d{2}',
      text: '今天是2024-01-15，会议时间2024-02-20',
      description: '匹配 YYYY-MM-DD 格式的日期'
    },
    {
      name: 'HTML标签',
      regex: '<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)<\\/\\1>',
      text: '<div class="test">Hello</div><p>World</p>',
      flags: { global: true, ignoreCase: false, multiline: false, dotAll: true },
      description: '匹配 HTML 标签及其内容'
    },
    {
      name: '提取URL',
      regex: 'https?:\\/\\/(?:[\\w-]+\\.)+[\\w-]+(?:\\/[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=]*)?',
      text: '访问 https://example.com 或 http://test.org/path',
      description: '匹配 HTTP/HTTPS URL'
    }
  ];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (regex.trim() && testText.trim()) {
        testRegex();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [regex, testText, flags]);

  return (
    <div className="regex-tester">
      <style>{`
        .regex-tester {
          max-width: 1200px;
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
        .error-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .error-icon {
          font-size: 1.25rem;
        }
        .error-title {
          font-weight: 600;
          color: #dc2626;
          font-size: 0.9rem;
        }
        .error-text {
          color: #dc2626;
          font-size: 0.85rem;
          margin-top: 4px;
        }
        .main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }
        .panel {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
        }
        .panel-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 16px;
        }
        .input-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 10px;
        }
        .regex-input-wrapper {
          display: flex;
          align-items: center;
          background: #1e293b;
          border-radius: 10px;
          padding: 4px 16px;
          margin-bottom: 12px;
        }
        .regex-delimiter {
          font-size: 1.25rem;
          color: #64748b;
          font-weight: 500;
        }
        .regex-input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 12px 12px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.95rem;
          color: #f1f5f9;
        }
        .regex-input:focus {
          outline: none;
        }
        .regex-input::placeholder {
          color: #64748b;
        }
        .flags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }
        .flag-btn {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .flag-btn.inactive {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #64748b;
        }
        .flag-btn.active {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: 1px solid #3b82f6;
          color: white;
        }
        .flag-btn:hover:not(.active) {
          border-color: #3b82f6;
          color: #3b82f6;
        }
        .flag-letter {
          font-weight: 700;
        }
        .test-textarea {
          width: 100%;
          min-height: 180px;
          padding: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.9rem;
          resize: vertical;
          line-height: 1.6;
          transition: border-color 0.2s;
        }
        .test-textarea:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .btn-row {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        .btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
        }
        .btn-outline {
          background: white;
          border: 1px solid #e2e8f0;
          color: #64748b;
        }
        .btn-outline:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }
        .result-box {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .result-title {
          font-weight: 600;
          color: #1e293b;
        }
        .result-count {
          font-size: 0.85rem;
          color: #64748b;
        }
        .result-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .badge-success {
          background: #dcfce7;
          color: #16a34a;
        }
        .badge-empty {
          background: #f1f5f9;
          color: #64748b;
        }
        .highlight-box {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.9rem;
          line-height: 1.7;
          white-space: pre-wrap;
          word-break: break-all;
          min-height: 80px;
        }
        :global(.match-highlight) {
          background: linear-gradient(135deg, #fef08a, #fde047);
          color: #854d0e;
          padding: 2px 4px;
          border-radius: 4px;
          font-weight: 600;
        }
        .info-box {
          background: #1e293b;
          border-radius: 10px;
          padding: 14px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.8rem;
          color: #e2e8f0;
          line-height: 1.7;
          white-space: pre-wrap;
          word-break: break-all;
          max-height: 300px;
          overflow-y: auto;
        }
        .examples-section {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #e2e8f0;
        }
        .examples-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 20px;
        }
        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .example-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }
        .example-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
          transform: translateY(-2px);
        }
        .example-name {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
        }
        .example-regex {
          font-family: monospace;
          font-size: 0.8rem;
          background: #f1f5f9;
          color: #3b82f6;
          padding: 6px 10px;
          border-radius: 6px;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .example-desc {
          font-size: 0.8rem;
          color: #64748b;
        }
        .help-box {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08));
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 12px;
          padding: 20px;
          margin-top: 30px;
        }
        .help-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
        }
        .help-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 10px;
        }
        .help-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
        }
        .help-code {
          font-family: monospace;
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
          color: #3b82f6;
          font-weight: 500;
        }
        .help-text {
          color: #64748b;
        }
        .help-note {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid rgba(59, 130, 246, 0.2);
        }
      `}</style>

      <div className="header">
        <h1>正则表达式测试</h1>
        <p>在线测试和调试正则表达式，实时显示匹配结果</p>
      </div>

      {error && (
        <div className="error-box">
          <span className="error-icon">❌</span>
          <div>
            <div className="error-title">错误</div>
            <div className="error-text">{error}</div>
          </div>
        </div>
      )}

      <div className="main-grid">
        <div className="panel">
          <div>
            <label className="input-label">正则表达式</label>
            <div className="regex-input-wrapper">
              <span className="regex-delimiter">/</span>
              <input
                type="text"
                value={regex}
                onChange={(e) => setRegex(e.target.value)}
                placeholder="输入正则表达式..."
                className="regex-input"
              />
              <span className="regex-delimiter">/{buildFlagsString()}</span>
            </div>
            
            <div className="flags-row">
              {Object.entries(flags).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => toggleFlag(key)}
                  className={`flag-btn ${value ? 'active' : 'inactive'}`}
                >
                  <span className="flag-letter">{key.charAt(0).toUpperCase()}</span>
                  <span>{getFlagDescription(key)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">测试文本</label>
            <textarea
              ref={textareaRef}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="输入要测试的文本..."
              className="test-textarea"
            />
          </div>

          <div className="btn-row">
            <button className="btn btn-primary" onClick={testRegex}>
              测试正则表达式
            </button>
            <button className="btn btn-outline" onClick={clearAll}>
              清空全部
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="result-box">
            <div className="result-header">
              <div>
                <div className="result-title">匹配结果</div>
                <div className="result-count">
                  {resultCount > 0 ? `找到 ${resultCount} 个匹配项` : '未找到匹配项'}
                </div>
              </div>
              {resultCount > 0 && (
                <span className="result-badge badge-success">匹配成功</span>
              )}
              {resultCount === 0 && regex && testText && (
                <span className="result-badge badge-empty">无匹配</span>
              )}
            </div>
          </div>

          {highlightedText && (
            <div>
              <label className="input-label">匹配高亮</label>
              <div
                className="highlight-box"
                dangerouslySetInnerHTML={{ __html: highlightedText }}
              />
            </div>
          )}

          {matchInfo && (
            <div style={{ marginTop: '16px' }}>
              <label className="input-label">匹配详情</label>
              <div className="info-box">{matchInfo}</div>
            </div>
          )}
        </div>
      </div>

      <div className="examples-section">
        <div className="examples-title">常用示例</div>
        <div className="examples-grid">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => loadExample(example)}
              className="example-card"
            >
              <div className="example-name">{example.name}</div>
              <div className="example-regex">/{example.regex}/</div>
              <div className="example-desc">{example.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="help-box">
        <div className="help-title">正则表达式快速参考</div>
        <div className="help-grid">
          <div className="help-item"><span className="help-code">\d</span><span className="help-text">数字</span></div>
          <div className="help-item"><span className="help-code">\w</span><span className="help-text">单词字符</span></div>
          <div className="help-item"><span className="help-code">\s</span><span className="help-text">空白</span></div>
          <div className="help-item"><span className="help-code">.</span><span className="help-text">任意字符</span></div>
          <div className="help-item"><span className="help-code">*</span><span className="help-text">0次或多次</span></div>
          <div className="help-item"><span className="help-code">+</span><span className="help-text">1次或多次</span></div>
          <div className="help-item"><span className="help-code">?</span><span className="help-text">0次或1次</span></div>
          <div className="help-item"><span className="help-code">{'{n,m}'}</span><span className="help-text">n到m次</span></div>
        </div>
        <div className="help-note">💡 所有操作均在浏览器本地完成，数据不会上传服务器。</div>
      </div>
    </div>
  );
}

function getFlagDescription(flag) {
  const descriptions = {
    global: '全局',
    ignoreCase: '忽略大小写',
    multiline: '多行',
    dotAll: '点号匹配换行',
    unicode: 'Unicode',
    sticky: '粘性'
  };
  return descriptions[flag] || flag;
}
