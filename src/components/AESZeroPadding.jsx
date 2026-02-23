// src/components/AESZeroPadding.jsx
import { useState, useEffect, useRef } from 'react';
import CryptoJS from 'crypto-js';

const AESZeroPadding = () => {
  // 固定密钥和IV
  const KEY_STRING = "P.8CGq@Wr~Vs]!4!";
  const IV_STRING = KEY_STRING;

  // 状态管理
  const [mode, setMode] = useState('decrypt'); // 'encrypt' 或 'decrypt'
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info'); // 'success', 'error', 'info'
  const [copyButtonText, setCopyButtonText] = useState('复制结果');

  const copyButtonRef = useRef(null);

  // 将字符串密钥转为 CryptoJS WordArray
  const getKeyAndIv = () => {
    const key = CryptoJS.enc.Utf8.parse(KEY_STRING);
    const iv = CryptoJS.enc.Utf8.parse(IV_STRING);
    return { key, iv };
  };

  // 零填充：补足16倍数 (补0x00)
  const applyZeroPadding = (plainUtf8Bytes) => {
    const sigBytes = plainUtf8Bytes.sigBytes;
    const remainder = sigBytes % 16;
    
    if (remainder === 0) {
      return plainUtf8Bytes.clone();
    }
    
    const padLen = 16 - remainder;
    const padded = new CryptoJS.lib.WordArray.init(
      plainUtf8Bytes.words.slice(0),
      sigBytes
    );
    
    for (let i = 0; i < padLen; i++) {
      padded.words[padded.sigBytes >>> 2] |= (0x00 << (24 - (8 * (padded.sigBytes % 4))));
      padded.sigBytes++;
    }
    
    return padded;
  };

  // 去除尾部零填充
  const removeZeroPadding = (decryptedBytes) => {
    let sigBytes = decryptedBytes.sigBytes;
    if (sigBytes === 0) return decryptedBytes;

    const words = decryptedBytes.words;
    let newLen = sigBytes;
    
    for (let i = sigBytes - 1; i >= 0; i--) {
      const byteIndex = i % 4;
      const wordIndex = Math.floor(i / 4);
      const byteVal = (words[wordIndex] >>> (24 - byteIndex * 8)) & 0xff;
      
      if (byteVal === 0x00) {
        newLen--;
      } else {
        break;
      }
    }
    
    if (newLen === sigBytes) return decryptedBytes;
    return new CryptoJS.lib.WordArray.init(words.slice(0), newLen);
  };

  // 加密 (输入明文, 输出Base64)
  const encryptPlaintext = (plainText) => {
    if (!plainText) {
      return { success: false, message: '输入不能为空' };
    }
    
    try {
      const plainUtf8 = CryptoJS.enc.Utf8.parse(plainText);
      const paddedPlain = applyZeroPadding(plainUtf8);
      const { key, iv } = getKeyAndIv();
      
      const encrypted = CryptoJS.AES.encrypt(paddedPlain, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.NoPadding
      });
      
      const cipherBase64 = CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
      return { success: true, data: cipherBase64 };
    } catch (error) {
      console.error('加密错误:', error);
      return { success: false, message: `加密异常: ${error.message}` };
    }
  };

  // 解密 (输入Base64, 输出明文字符串)
  const decryptBase64 = (cipherBase64) => {
    if (!cipherBase64) {
      return { success: false, message: '输入不能为空' };
    }
    
    try {
      // 清理输入，移除可能的空白字符
      const cleanCipher = cipherBase64.trim();
      const cipherWordArray = CryptoJS.enc.Base64.parse(cleanCipher);
      
      if (cipherWordArray.sigBytes % 16 !== 0) {
        return { 
          success: false, 
          message: `密文长度必须为16的倍数 (当前 ${cipherWordArray.sigBytes} 字节)` 
        };
      }
      
      const { key, iv } = getKeyAndIv();
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: cipherWordArray },
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.NoPadding
        }
      );
      
      const withoutPad = removeZeroPadding(decrypted);
      const plainText = CryptoJS.enc.Utf8.stringify(withoutPad);
      
      return { success: true, data: plainText };
    } catch (error) {
      console.error('解密错误:', error);
      return { success: false, message: `解密异常: ${error.message}` };
    }
  };

  // 执行加密/解密
  const handleExecute = () => {
    if (!inputText.trim()) {
      setStatusMessage('请在输入框中填写内容');
      setStatusType('error');
      setOutputText('');
      return;
    }

    let result;
    
    if (mode === 'encrypt') {
      result = encryptPlaintext(inputText);
    } else {
      result = decryptBase64(inputText);
    }

    if (result.success) {
      setOutputText(result.data || '(空)');
      setStatusMessage(`${mode === 'encrypt' ? '🔒 加密' : '🔓 解密'}成功`);
      setStatusType('success');
    } else {
      setOutputText('');
      setStatusMessage(`❌ ${result.message}`);
      setStatusType('error');
    }
  };

  // 清空所有
  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setStatusMessage('');
    setCopyButtonText('复制结果');
  };

  // 填充示例
  const handleFillExample = () => {
    if (mode === 'encrypt') {
      setInputText('Hello! CBC NoPad');
    } else {
      // 加密示例文本以生成示例密文
      const exampleResult = encryptPlaintext('Hello! CBC NoPad');
      if (exampleResult.success) {
        setInputText(exampleResult.data);
      } else {
        // 后备示例
        setInputText('8kuV0hSGqW8r8FxB3H/kDg==');
      }
    }
    
    setStatusMessage('📋 示例已填入，点击「执行」查看结果');
    setStatusType('info');
    setOutputText('');
    setCopyButtonText('复制结果');
  };

  // 复制结果到剪贴板
  const handleCopy = async () => {
    if (!outputText) {
      setStatusMessage('❌ 没有可复制的内容');
      setStatusType('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      setCopyButtonText('✅ 已复制');
      setStatusMessage('✅ 已复制到剪贴板');
      setStatusType('success');
      
      setTimeout(() => {
        setCopyButtonText('复制结果');
      }, 2000);
    } catch (error) {
      console.error('复制失败:', error);
      
      // 降级方案：使用传统的 execCommand
      try {
        const textarea = document.createElement('textarea');
        textarea.value = outputText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (success) {
          setCopyButtonText('✅ 已复制');
          setStatusMessage('✅ 已复制到剪贴板');
          setStatusType('success');
          
          setTimeout(() => {
            setCopyButtonText('复制结果');
          }, 2000);
        } else {
          throw new Error('复制失败');
        }
      } catch (fallbackError) {
        setStatusMessage('❌ 复制失败，请手动选择复制');
        setStatusType('error');
      }
    }
  };

  // 处理输入变化时清空状态
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (statusMessage) {
      setStatusMessage('');
    }
  };

  // 处理模式切换
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setOutputText('');
    setStatusMessage('');
    setCopyButtonText('复制结果');
  };

  // 初始加载时设置示例
  useEffect(() => {
    // 默认在解密模式时填入示例密文
    if (mode === 'decrypt') {
      const exampleResult = encryptPlaintext('Hello! CBC NoPad');
      if (exampleResult.success) {
        setInputText(exampleResult.data);
      } else {
        setInputText('8kuV0hSGqW8r8FxB3H/kDg==');
      }
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      {/* 密钥显示区域 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1.5 rounded-full">
              🔑 密钥/IV
            </div>
            <div className="font-mono text-lg font-semibold text-gray-900 dark:text-gray-100">
              {KEY_STRING}
            </div>
          </div>
          <div className="ml-auto text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            128位 · 零填充 · CBC模式
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="p-6">
        {/* 输入区域 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-300 font-medium">输入区</span>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                {mode === 'encrypt' ? '明文输入' : 'Base64 密文输入'}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {inputText.length} 字符
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            placeholder={
              mode === 'encrypt' 
                ? '输入要加密的明文...\n注意：文本将被零填充至16字节倍数'
                : '输入要解密的 Base64 密文...\n注意：密文长度必须是16字节的倍数'
            }
            rows={5}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 resize-none font-mono text-sm transition-colors"
          />
        </div>

        {/* 模式选择 */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">操作模式</div>
          <div className="flex gap-4">
            <button
              onClick={() => handleModeChange('encrypt')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${mode === 'encrypt' 
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' 
                : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <span className="text-lg">🔒</span>
              <span className="font-medium">加密</span>
              <span className="text-xs opacity-75">明文 → Base64</span>
            </button>
            <button
              onClick={() => handleModeChange('decrypt')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${mode === 'decrypt' 
                ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300' 
                : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <span className="text-lg">🔓</span>
              <span className="font-medium">解密</span>
              <span className="text-xs opacity-75">Base64 → 明文</span>
            </button>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <button
            onClick={handleExecute}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            执行 {mode === 'encrypt' ? '加密' : '解密'}
          </button>
          <button
            onClick={handleClear}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <span>🗑️</span>
            清空
          </button>
          <button
            onClick={handleFillExample}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <span>📎</span>
            示例
          </button>
        </div>

        {/* 输出区域 */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {mode === 'encrypt' ? '📤 加密输出 (Base64)' : '📥 解密输出 (明文)'}
              </span>
            </div>
            <button
              ref={copyButtonRef}
              onClick={handleCopy}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${copyButtonText.includes('已复制') 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'}`}
            >
              {copyButtonText}
            </button>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800">
            <div className="min-h-[120px] bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <pre className="font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all min-h-[60px]">
                {outputText || (mode === 'encrypt' ? '加密结果将显示在这里...' : '解密结果将显示在这里...')}
              </pre>
            </div>
            
            {/* 状态消息 */}
            {statusMessage && (
              <div className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${statusType === 'success' 
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                : statusType === 'error' 
                ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'}`}
              >
                {statusMessage}
              </div>
            )}
          </div>
        </div>

        {/* 技术信息 */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>算法: <code className="font-mono">AES-128-CBC</code></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>填充: <code className="font-mono">Zero Padding (补0x00)</code></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>密钥/IV: <code className="font-mono">{KEY_STRING.length * 8}位</code></span>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            AES-128-CBC · 零填充(补0x00) · 密钥即偏移量 · 所有操作在本地浏览器完成
          </p>
        </div>
      </div>
    </div>
  );
};

export default AESZeroPadding;
