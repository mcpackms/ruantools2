// src/components/Base64UrlTool.jsx
import { useState, useEffect } from 'react';

function Base64UrlTool() {
  const [activeTab, setActiveTab] = useState('base64');
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlOutput, setUrlOutput] = useState('');
  const [copyText, setCopyText] = useState('复制结果');

  // Base64 编码
  const handleBase64Encode = () => {
    try {
      // 处理中文等非ASCII字符
      const encoded = btoa(unescape(encodeURIComponent(base64Input)));
      setBase64Output(encoded);
    } catch (error) {
      setBase64Output('❌ 编码错误：输入包含无效字符');
    }
  };

  // Base64 解码
  const handleBase64Decode = () => {
    try {
      // 移除可能的空白字符
      const cleanInput = base64Input.replace(/\s/g, '');
      const decoded = decodeURIComponent(escape(atob(cleanInput)));
      setBase64Output(decoded);
    } catch (error) {
      setBase64Output('❌ 解码错误：输入的 Base64 格式无效');
    }
  };

  // URL 编码
  const handleUrlEncode = () => {
    try {
      const encoded = encodeURIComponent(urlInput);
      setUrlOutput(encoded);
    } catch (error) {
      setUrlOutput('❌ 编码错误');
    }
  };

  // URL 解码
  const handleUrlDecode = () => {
    try {
      const decoded = decodeURIComponent(urlInput);
      setUrlOutput(decoded);
    } catch (error) {
      setUrlOutput('❌ 解码错误：URL 格式无效');
    }
  };

  // 复制文本
  const handleCopy = (text) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopyText('已复制!');
      setTimeout(() => setCopyText('复制结果'), 1500);
    }).catch(err => {
      console.error('复制失败:', err);
      setCopyText('复制失败');
      setTimeout(() => setCopyText('复制结果'), 1500);
    });
  };

  // 清空输入
  const handleClear = (type) => {
    if (type === 'base64') {
      setBase64Input('');
      setBase64Output('');
    } else {
      setUrlInput('');
      setUrlOutput('');
    }
  };

  // 输入字符数统计
  const getCharCount = (text) => {
    return text.length;
  };

  return (
    <div className="space-y-6">
      {/* 标签页导航 */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${
            activeTab === 'base64'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          onClick={() => setActiveTab('base64')}
        >
          Base64 编解码
        </button>
        <button
          className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${
            activeTab === 'url'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          onClick={() => setActiveTab('url')}
        >
          URL 编解码
        </button>
      </div>

      {/* Base64 标签内容 */}
      {activeTab === 'base64' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 输入区域 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  原始文本
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getCharCount(base64Input)} 字符
                </span>
              </div>
              <textarea
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                placeholder="输入要编码的文本，或粘贴 Base64 字符串进行解码"
                rows={8}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:text-gray-100 font-mono transition-colors"
              />
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleBase64Encode}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  编码 →
                </button>
                <button
                  onClick={handleBase64Decode}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  ← 解码
                </button>
                <button
                  onClick={() => handleClear('base64')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  清空
                </button>
              </div>
            </div>

            {/* 输出区域 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  转换结果
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getCharCount(base64Output)} 字符
                </span>
              </div>
              <textarea
                value={base64Output}
                readOnly
                rows={8}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-100 font-mono"
              />
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCopy(base64Output)}
                  disabled={!base64Output}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    base64Output
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {copyText}
                </button>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                <p>Base64 常用于在文本环境中安全传输二进制数据，如邮件附件、图片编码等。</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* URL 标签内容 */}
      {activeTab === 'url' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 输入区域 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  原始 URL/文本
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getCharCount(urlInput)} 字符
                </span>
              </div>
              <textarea
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="输入要编码的 URL，或粘贴编码后的 URL 进行解码"
                rows={8}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:text-gray-100 font-mono transition-colors"
              />
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleUrlEncode}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  编码 →
                </button>
                <button
                  onClick={handleUrlDecode}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  ← 解码
                </button>
                <button
                  onClick={() => handleClear('url')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  清空
                </button>
              </div>
            </div>

            {/* 输出区域 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  转换结果
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getCharCount(urlOutput)} 字符
                </span>
              </div>
              <textarea
                value={urlOutput}
                readOnly
                rows={8}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-100 font-mono"
              />
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCopy(urlOutput)}
                  disabled={!urlOutput}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    urlOutput
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {copyText}
                </button>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                <p>URL 编码用于确保特殊字符（如空格、中文、&、=等）在 URL 中安全传输。</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 工具提示信息 */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-500">💡</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">使用提示</h3>
            <ul className="mt-2 text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Base64 编码：将二进制数据转换为可打印 ASCII 字符，常用于数据存储和传输</li>
              <li>• URL 编码：将 URL 中的特殊字符转换为 % 后跟两位十六进制数的形式</li>
              <li>• 解码时，请确保输入格式正确，否则可能导致解码失败</li>
              <li>• 所有操作均在浏览器本地完成，数据不会上传服务器</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Base64UrlTool;
