// src/components/RegexTester.jsx
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

  // 构建正则表达式标志字符串
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

  // 测试正则表达式
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
      let match;
      
      if (flags.global) {
        // 全局匹配
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
        // 单次匹配
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
      
      // 生成高亮文本
      if (matchesArray.length > 0) {
        let lastIndex = 0;
        const segments = [];
        matchesArray.forEach(match => {
          // 添加匹配前的文本
          segments.push(testText.slice(lastIndex, match.index));
          // 添加高亮的匹配文本
          segments.push(`<mark class="bg-yellow-200 dark:bg-yellow-700 px-1 rounded">${match.fullMatch}</mark>`);
          lastIndex = match.index + match.fullMatch.length;
        });
        // 添加剩余文本
        segments.push(testText.slice(lastIndex));
        setHighlightedText(segments.join(''));
      }
      
      // 生成匹配信息
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
      console.error('Regex error:', err);
    }
  };

  // 清空所有
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

  // 切换标志
  const toggleFlag = (flagName) => {
    setFlags(prev => ({
      ...prev,
      [flagName]: !prev[flagName]
    }));
  };

  // 快速填充示例
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

  // 常用示例
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
      name: '日期 (YYYY-MM-DD)',
      regex: '\\d{4}-\\d{2}-\\d{2}',
      text: '今天是2024-01-15，会议时间2024-02-20',
      description: '匹配YYYY-MM-DD格式的日期'
    },
    {
      name: 'HTML标签',
      regex: '<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)<\\/\\1>',
      text: '<div class="test">Hello</div><p>World</p>',
      flags: { global: true, ignoreCase: false, multiline: false, dotAll: true },
      description: '匹配HTML标签及其内容'
    },
    {
      name: '提取URL',
      regex: 'https?:\\/\\/(?:[\\w-]+\\.)+[\\w-]+(?:\\/[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=]*)?',
      text: '访问 https://example.com 或 http://test.org/path',
      description: '匹配HTTP/HTTPS URL'
    }
  ];

  // 自动测试（当正则表达式变化时）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (regex.trim() && testText.trim()) {
        testRegex();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [regex, testText, flags]);

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-500">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">错误</h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：正则表达式和测试文本 */}
        <div className="space-y-6">
          {/* 正则表达式输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              正则表达式
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-lg text-gray-500 dark:text-gray-400">/</div>
              <input
                type="text"
                value={regex}
                onChange={(e) => setRegex(e.target.value)}
                placeholder="例如：\d{3}-\d{3}-\d{4}"
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:text-gray-100 font-mono"
              />
              <div className="text-lg text-gray-500 dark:text-gray-400">/{buildFlagsString()}</div>
            </div>
            
            {/* 正则标志 */}
            <div className="flex flex-wrap gap-3 mt-3">
              {Object.entries(flags).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => toggleFlag(key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    value
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {key.charAt(0).toUpperCase()}
                  <span className="text-xs opacity-75 ml-1">({getFlagDescription(key)})</span>
                </button>
              ))}
            </div>
          </div>

          {/* 测试文本输入 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                测试文本
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {testText.length} 字符
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="输入要测试的文本..."
              rows={8}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:text-gray-100 font-mono"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={testRegex}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              测试正则表达式
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              清空全部
            </button>
          </div>
        </div>

        {/* 右侧：匹配结果 */}
        <div className="space-y-6">
          {/* 结果摘要 */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">匹配结果</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {resultCount > 0 ? `找到 ${resultCount} 个匹配项` : '未找到匹配项'}
                </p>
              </div>
              {resultCount > 0 && (
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                  匹配成功
                </div>
              )}
            </div>
          </div>

          {/* 高亮显示 */}
          {highlightedText && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                匹配高亮
              </label>
              <div
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-gray-100 font-mono whitespace-pre-wrap break-words min-h-[100px]"
                dangerouslySetInnerHTML={{ __html: highlightedText }}
              />
            </div>
          )}

          {/* 详细匹配信息 */}
          {matchInfo && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                匹配详情
              </label>
              <pre className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-100 font-mono whitespace-pre-wrap break-words max-h-[300px] overflow-y-auto">
                {matchInfo}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 示例区 */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">常用示例</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => loadExample(example)}
              className="text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                {example.name}
              </h4>
              <code className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded block mb-2 truncate">
                /{example.regex}/
              </code>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {example.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 帮助信息 */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-500">💡</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">正则表达式提示</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-400 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div><code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">\d</code> 数字</div>
                <div><code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">\w</code> 单词字符</div>
                <div><code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">\s</code> 空白字符</div>
                <div><code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">.</code> 任意字符</div>
                <div><code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">*</code> 0次或多次</div>
                <div><code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">+</code> 1次或多次</div>
                <div><code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">?</code> 0次或1次</div>
                <div><code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{'{n,m}'}</code> n到m次</div>
              </div>
              <p>所有操作均在浏览器本地完成，数据不会上传服务器。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 获取标志描述
function getFlagDescription(flag) {
  const descriptions = {
    global: '全局匹配',
    ignoreCase: '忽略大小写',
    multiline: '多行模式',
    dotAll: '点号匹配换行',
    unicode: 'Unicode模式',
    sticky: '粘性匹配'
  };
  return descriptions[flag] || flag;
}
