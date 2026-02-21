// src/components/AESEncryptor.jsx
import { useState, useEffect } from 'react';

// 工具函数：将字符串转换为 ArrayBuffer
function stringToArrayBuffer(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// 工具函数：将 ArrayBuffer 转换为 Base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// 工具函数：将 Base64 转换为 ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// 工具函数：将 ArrayBuffer 转换为 Hex 字符串
function arrayBufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// 工具函数：将 Hex 字符串转换为 ArrayBuffer
function hexToArrayBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

// 生成随机 IV/Nonce（16字节）
function generateRandomIV() {
  const randomValues = new Uint8Array(16);
  crypto.getRandomValues(randomValues);
  return arrayBufferToHex(randomValues.buffer);
}

export default function AESEncryptor() {
  // 状态管理
  const [algorithm, setAlgorithm] = useState('AES-CBC');
  const [keyLength, setKeyLength] = useState(128);
  const [keyFormat, setKeyFormat] = useState('hex');
  const [key, setKey] = useState('');
  const [iv, setIv] = useState('');
  const [inputFormat, setInputFormat] = useState('text');
  const [outputFormat, setOutputFormat] = useState('base64');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [action, setAction] = useState('encrypt');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showIV, setShowIV] = useState(true);

  // 根据算法更新是否需要显示 IV
  useEffect(() => {
    setShowIV(algorithm !== 'AES-ECB');
    if (algorithm === 'AES-ECB') {
      setIv('');
    }
  }, [algorithm]);

  // 生成随机密钥
  const generateRandomKey = () => {
    const byteLength = keyLength === 128 ? 16 : 32;
    const randomValues = new Uint8Array(byteLength);
    crypto.getRandomValues(randomValues);
    
    if (keyFormat === 'hex') {
      setKey(arrayBufferToHex(randomValues.buffer));
    } else if (keyFormat === 'base64') {
      setKey(arrayBufferToBase64(randomValues.buffer));
    } else {
      // 文本格式：转换为可打印字符（Base64 URL安全字符）
      const base64Key = arrayBufferToBase64(randomValues.buffer)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      setKey(base64Key);
    }
  };

  // 生成随机 IV
  const generateRandomIVHandler = () => {
    setIv(generateRandomIV());
  };

  // 导入密钥
  const importKey = async () => {
    try {
      setError('');
      let keyData;
      
      // 根据密钥格式转换
      if (keyFormat === 'hex') {
        keyData = hexToArrayBuffer(key);
      } else if (keyFormat === 'base64') {
        keyData = base64ToArrayBuffer(key);
      } else {
        // 文本格式
        keyData = stringToArrayBuffer(key);
      }

      // 检查密钥长度
      const expectedLength = keyLength === 128 ? 16 : 32;
      if (keyData.byteLength !== expectedLength) {
        throw new Error(`密钥长度不正确。AES-${keyLength} 需要 ${expectedLength} 字节，当前为 ${keyData.byteLength} 字节。`);
      }

      // 导入密钥
      return await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: algorithm.split('-')[0] },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (err) {
      throw new Error(`密钥导入失败: ${err.message}`);
    }
  };

  // 执行加密/解密
  const handleProcess = async () => {
    if (!key.trim()) {
      setError('请输入密钥');
      return;
    }

    if (!inputText.trim()) {
      setError('请输入要处理的内容');
      return;
    }

    if (showIV && !iv.trim()) {
      setError('请输入IV/Nonce');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 导入密钥
      const cryptoKey = await importKey();

      // 准备算法参数
      let algorithmParams = {};
      if (algorithm === 'AES-CBC') {
        let ivData;
        if (iv.length === 32) { // Hex格式
          ivData = hexToArrayBuffer(iv);
        } else if (iv.length === 24) { // Base64格式
          ivData = base64ToArrayBuffer(iv);
        } else {
          ivData = stringToArrayBuffer(iv);
        }
        algorithmParams = { name: 'AES-CBC', iv: ivData };
      } else if (algorithm === 'AES-CTR') {
        let counterData;
        if (iv.length === 32) { // Hex格式
          counterData = hexToArrayBuffer(iv);
        } else if (iv.length === 24) { // Base64格式
          counterData = base64ToArrayBuffer(iv);
        } else {
          counterData = stringToArrayBuffer(iv);
        }
        algorithmParams = { 
          name: 'AES-CTR', 
          counter: counterData,
          length: 64
        };
      } else if (algorithm === 'AES-ECB') {
        algorithmParams = { name: 'AES-ECB' };
      }

      // 准备输入数据
      let inputData;
      if (action === 'encrypt') {
        inputData = stringToArrayBuffer(inputText);
      } else {
        // 解密时根据输入格式处理
        if (inputFormat === 'hex') {
          inputData = hexToArrayBuffer(inputText);
        } else if (inputFormat === 'base64') {
          inputData = base64ToArrayBuffer(inputText);
        } else {
          inputData = stringToArrayBuffer(inputText);
        }
      }

      // 执行加密或解密
      let result;
      if (action === 'encrypt') {
        result = await crypto.subtle.encrypt(algorithmParams, cryptoKey, inputData);
      } else {
        result = await crypto.subtle.decrypt(algorithmParams, cryptoKey, inputData);
      }

      // 处理输出结果
      if (action === 'encrypt') {
        // 加密：根据输出格式转换
        if (outputFormat === 'hex') {
          setOutputText(arrayBufferToHex(result));
        } else if (outputFormat === 'base64') {
          setOutputText(arrayBufferToBase64(result));
        } else {
          // 文本格式（通常不用于加密输出，但提供选项）
          const decoder = new TextDecoder();
          setOutputText(decoder.decode(result));
        }
      } else {
        // 解密：总是输出文本
        const decoder = new TextDecoder();
        setOutputText(decoder.decode(result));
      }
    } catch (err) {
      setError(`处理失败: ${err.message}`);
      console.error('加密/解密错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 复制结果到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText)
      .then(() => {
        alert('已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  // 清空所有输入
  const clearAll = () => {
    setKey('');
    setIv('');
    setInputText('');
    setOutputText('');
    setError('');
  };

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

      {/* 算法配置区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左列：算法和密钥设置 */}
        <div className="space-y-6">
          {/* 算法选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              算法配置
            </label>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">工作模式</label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:text-gray-100"
                >
                  <option value="AES-CBC">CBC 模式</option>
                  <option value="AES-ECB">ECB 模式</option>
                  <option value="AES-CTR">CTR 模式</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">密钥长度</label>
                <select
                  value={keyLength}
                  onChange={(e) => setKeyLength(Number(e.target.value))}
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:text-gray-100"
                >
                  <option value={128}>AES-128 (16字节)</option>
                  <option value={256}>AES-256 (32字节)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 密钥设置 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                密钥设置
              </label>
              <div className="flex gap-2">
                <select
                  value={keyFormat}
                  onChange={(e) => setKeyFormat(e.target.value)}
                  className="text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 dark:text-gray-100"
                >
                  <option value="hex">Hex</option>
                  <option value="base64">Base64</option>
                  <option value="text">文本</option>
                </select>
                <button
                  type="button"
                  onClick={generateRandomKey}
                  className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded border border-gray-300 dark:border-gray-600"
                >
                  生成随机密钥
                </button>
              </div>
            </div>
            <textarea
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={`请输入 ${keyLength} 位密钥（${keyLength === 128 ? '16' : '32'}字节）`}
              rows="3"
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:text-gray-100 font-mono"
            />
          </div>

          {/* IV/Nonce 设置 */}
          {showIV && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  IV/Nonce（16字节）
                </label>
                <button
                  type="button"
                  onClick={generateRandomIVHandler}
                  className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded border border-gray-300 dark:border-gray-600"
                >
                  生成随机IV
                </button>
              </div>
              <input
                type="text"
                value={iv}
                onChange={(e) => setIv(e.target.value)}
                placeholder="请输入16字节IV/Nonce"
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:text-gray-100 font-mono"
              />
            </div>
          )}
        </div>

        {/* 右列：输入输出格式和操作按钮 */}
        <div className="space-y-6">
          {/* 操作选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              操作
            </label>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                type="button"
                onClick={() => setAction('encrypt')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  action === 'encrypt'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                加密
              </button>
              <button
                type="button"
                onClick={() => setAction('decrypt')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  action === 'decrypt'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                解密
              </button>
            </div>
          </div>

          {/* 输入输出格式 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                输入格式
              </label>
              <select
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:text-gray-100"
              >
                <option value="text">文本</option>
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                输出格式
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:text-gray-100"
              >
                <option value="base64">Base64</option>
                <option value="hex">Hex</option>
                <option value="text">文本</option>
              </select>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="pt-4">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleProcess}
                disabled={isLoading}
                className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    处理中...
                  </span>
                ) : (
                  `${action === 'encrypt' ? '加密' : '解密'}`
                )}
              </button>
              
              <button
                type="button"
                onClick={copyToClipboard}
                disabled={!outputText}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                复制结果
              </button>
              
              <button
                type="button"
                onClick={clearAll}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg text-sm font-medium"
              >
                清空全部
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 输入输出区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {action === 'encrypt' ? '明文输入' : '密文输入'}
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {inputText.length} 字符
            </span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={action === 'encrypt' ? '请输入要加密的文本...' : '请输入要解密的密文...'}
            rows="8"
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:text-gray-100 font-mono"
          />
        </div>

        {/* 输出区域 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {action === 'encrypt' ? '密文输出' : '明文输出'}
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {outputText.length} 字符
            </span>
          </div>
          <textarea
            value={outputText}
            readOnly
            placeholder="结果将显示在这里..."
            rows="8"
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-100 font-mono"
          />
        </div>
      </div>

      {/* 提示信息 */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-500">💡</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">提示</h3>
            <ul className="mt-2 text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• 所有操作均在本地浏览器完成，数据不会上传服务器</li>
              <li>• 加密时请妥善保管密钥和IV，解密时需要相同的参数</li>
              <li>• 对于CBC和CTR模式，IV不需要保密但必须唯一</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
