// src/components/AESEncryptorOpenSSL.jsx
import { useState, useEffect, useRef } from 'react';
import CryptoJS from 'crypto-js';

function AESEncryptorOpenSSL() {
  // 状态管理
  const [config, setConfig] = useState({
    keySize: '128',
    mode: 'CBC',
    password: '',
    iv: '',
    salt: '',
    iterations: 100,
    usePbkdf2: true
  });
  
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [stats, setStats] = useState({
    inputCount: 0,
    outputCount: 0,
    processTime: 0
  });
  const [showOpensslConfig, setShowOpensslConfig] = useState(true);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteJson, setPasteJson] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const toastRef = useRef(null);

  // 显示 Toast 提示
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2000);
  };

  // 更新配置
  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // 更新输入文本
  const updateInputText = (text) => {
    setInputText(text);
    setStats(prev => ({ ...prev, inputCount: text.length }));
  };

  // 生成随机字符串
  const generateRandomString = (length, type = 'alphanumeric') => {
    let chars = '';
    if (type === 'alphanumeric') {
      chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    } else if (type === 'hex') {
      chars = '0123456789ABCDEF';
    } else if (type === 'base64') {
      // 通过随机字节生成 Base64
      const randomBytes = CryptoJS.lib.WordArray.random(length);
      return CryptoJS.enc.Base64.stringify(randomBytes).slice(0, length);
    }
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 生成密码
  const generatePassword = () => {
    const password = generateRandomString(16, 'alphanumeric');
    updateConfig('password', password);
    showToast('密码已生成');
  };

  // 生成 IV
  const generateIV = () => {
    const ivWordArray = CryptoJS.lib.WordArray.random(16);
    const iv = CryptoJS.enc.Hex.stringify(ivWordArray);
    updateConfig('iv', iv);
    showToast('IV 已生成');
  };

  // 生成盐值
  const generateSalt = () => {
    const saltWordArray = CryptoJS.lib.WordArray.random(8);
    const salt = CryptoJS.enc.Base64.stringify(saltWordArray);
    updateConfig('salt', salt);
    showToast('盐值已生成');
  };

  // 一键生成所有参数
  const generateAllParams = () => {
    generatePassword();
    generateSalt();
    generateIV();
    showToast('所有安全参数已生成');
  };

  // 一键复制所有参数
  const copyAllParams = () => {
    const params = {
      password: config.password,
      salt: config.salt,
      iv: config.iv,
      keySize: config.keySize,
      mode: config.mode,
      iterations: config.iterations,
      timestamp: new Date().toISOString(),
      note: '由 Ruantools AES 工具生成的参数'
    };
    
    const jsonString = JSON.stringify(params, null, 2);
    
    navigator.clipboard.writeText(jsonString)
      .then(() => showToast('所有参数已复制到剪贴板'))
      .catch(err => {
        console.error('复制失败:', err);
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = jsonString;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('所有参数已复制到剪贴板（兼容模式）');
      });
  };

  // 应用粘贴的参数
  const applyPastedParams = () => {
    if (!pasteJson.trim()) {
      showToast('请粘贴参数 JSON 数据', 'error');
      return;
    }
    
    try {
      const params = JSON.parse(pasteJson);
      
      const updates = {};
      if (params.password) updates.password = params.password;
      if (params.salt) updates.salt = params.salt;
      if (params.iv) updates.iv = params.iv;
      if (params.iterations) updates.iterations = params.iterations;
      if (params.keySize) updates.keySize = params.keySize.toString();
      if (params.mode) updates.mode = params.mode;
      
      setConfig(prev => ({ ...prev, ...updates }));
      setShowPasteModal(false);
      setPasteJson('');
      showToast('参数已成功应用');
      
    } catch (error) {
      console.error('JSON 解析错误:', error);
      showToast('JSON 解析失败，请检查格式是否正确', 'error');
    }
  };

  // AES 加密
  const encryptAES = () => {
    const startTime = performance.now();
    
    if (!inputText.trim()) {
      setResult('请输入要加密的内容');
      return;
    }
    
    if (!config.password.trim()) {
      setResult('请输入密码');
      return;
    }
    
    try {
      let keyWordArray;
      let saltWordArray;
      let finalSalt;
      
      // OpenSSL 兼容的 PBKDF2 密钥派生
      if (config.usePbkdf2) {
        if (!config.salt.trim()) {
          finalSalt = CryptoJS.lib.WordArray.random(8);
          updateConfig('salt', CryptoJS.enc.Base64.stringify(finalSalt));
        } else {
          finalSalt = CryptoJS.enc.Base64.parse(config.salt);
        }
        
        // PBKDF2 密钥派生
        keyWordArray = CryptoJS.PBKDF2(config.password, finalSalt, {
          keySize: parseInt(config.keySize) / 32,
          iterations: config.iterations,
          hasher: CryptoJS.algo.SHA256
        });
      } else {
        // 简单密钥派生（不推荐）
        keyWordArray = CryptoJS.enc.Utf8.parse(config.password.padEnd(32, '0').slice(0, 32));
      }
      
      // 处理 IV
      let ivWordArray;
      if (config.mode === 'CBC' || config.mode === 'CTR') {
        if (config.iv) {
          ivWordArray = CryptoJS.enc.Utf8.parse(config.iv.padEnd(16, '\0').slice(0, 16));
        } else {
          ivWordArray = CryptoJS.lib.WordArray.random(16);
          updateConfig('iv', CryptoJS.enc.Hex.stringify(ivWordArray));
        }
      }
      
      // 执行加密
      let encrypted;
      const options = {
        padding: config.mode === 'CTR' ? CryptoJS.pad.NoPadding : CryptoJS.pad.Pkcs7
      };
      
      if (config.mode === 'CBC') {
        options.iv = ivWordArray;
        options.mode = CryptoJS.mode.CBC;
      } else if (config.mode === 'ECB') {
        options.mode = CryptoJS.mode.ECB;
      } else if (config.mode === 'CTR') {
        options.iv = ivWordArray;
        options.mode = CryptoJS.mode.CTR;
      }
      
      encrypted = CryptoJS.AES.encrypt(inputText, keyWordArray, options);
      
      // OpenSSL 兼容输出格式
      let resultText = '';
      if (config.usePbkdf2) {
        resultText += `Salted__${finalSalt.toString(CryptoJS.enc.Hex).toUpperCase()}\n`;
      }
      resultText += encrypted.toString();
      
      const endTime = performance.now();
      setResult(resultText);
      setStats(prev => ({
        ...prev,
        outputCount: resultText.length,
        processTime: Math.round(endTime - startTime)
      }));
      
    } catch (error) {
      console.error('加密失败:', error);
      setResult(`加密失败: ${error.message}`);
    }
  };

  // AES 解密
  const decryptAES = () => {
    const startTime = performance.now();
    
    if (!inputText.trim()) {
      setResult('请输入要解密的内容');
      return;
    }
    
    if (!config.password.trim()) {
      setResult('请输入密码');
      return;
    }
    
    try {
      let ciphertext = inputText;
      let extractedSalt = null;
      
      // 解析 OpenSSL 格式
      if (inputText.startsWith('Salted__')) {
        const lines = inputText.split('\n');
        if (lines.length >= 1) {
          const saltLine = lines[0];
          const saltHex = saltLine.substring(8);
          extractedSalt = CryptoJS.enc.Hex.parse(saltHex);
          ciphertext = lines.slice(1).join('\n');
        }
      } else if (config.salt) {
        extractedSalt = CryptoJS.enc.Base64.parse(config.salt);
      }
      
      // 密钥派生
      let keyWordArray;
      if (config.usePbkdf2) {
        if (!extractedSalt) {
          setResult('需要提供盐值进行 PBKDF2 解密');
          return;
        }
        
        keyWordArray = CryptoJS.PBKDF2(config.password, extractedSalt, {
          keySize: parseInt(config.keySize) / 32,
          iterations: config.iterations,
          hasher: CryptoJS.algo.SHA256
        });
      } else {
        keyWordArray = CryptoJS.enc.Utf8.parse(config.password.padEnd(32, '0').slice(0, 32));
      }
      
      // 处理 IV
      let ivWordArray;
      if (config.mode === 'CBC' || config.mode === 'CTR') {
        if (config.iv) {
          ivWordArray = CryptoJS.enc.Utf8.parse(config.iv.padEnd(16, '\0').slice(0, 16));
        } else {
          setResult('CBC/CTR 模式需要提供 IV');
          return;
        }
      }
      
      // 执行解密
      const options = {
        padding: config.mode === 'CTR' ? CryptoJS.pad.NoPadding : CryptoJS.pad.Pkcs7
      };
      
      if (config.mode === 'CBC') {
        options.iv = ivWordArray;
        options.mode = CryptoJS.mode.CBC;
      } else if (config.mode === 'ECB') {
        options.mode = CryptoJS.mode.ECB;
      } else if (config.mode === 'CTR') {
        options.iv = ivWordArray;
        options.mode = CryptoJS.mode.CTR;
      }
      
      const decrypted = CryptoJS.AES.decrypt(ciphertext, keyWordArray, options);
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        setResult('解密失败：密码、盐值或 IV 不正确');
      } else {
        const endTime = performance.now();
        setResult(decryptedText);
        setStats(prev => ({
          ...prev,
          outputCount: decryptedText.length,
          processTime: Math.round(endTime - startTime)
        }));
      }
      
    } catch (error) {
      console.error('解密失败:', error);
      setResult(`解密失败: ${error.message}`);
    }
  };

  // 清空所有
  const clearAll = () => {
    setInputText('');
    setResult('');
    setConfig(prev => ({
      ...prev,
      password: '',
      salt: '',
      iv: ''
    }));
    setStats({ inputCount: 0, outputCount: 0, processTime: 0 });
    showToast('已清空所有内容');
  };

  // 从剪贴板粘贴参数
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setPasteJson(text);
        setShowPasteModal(true);
      } else {
        setShowPasteModal(true);
      }
    } catch (err) {
      console.warn('剪贴板读取失败:', err);
      setShowPasteModal(true);
    }
  };

  // 监听 Escape 键关闭模态框
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showPasteModal) {
        setShowPasteModal(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showPasteModal]);

  return (
    <div className="aes-container">
      {/* 头部 */}
      <div className="header">
        <h1>AES 加密解密 - Ruantools</h1>
        <p className="description">专业 AES 加解密工具，支持 OpenSSL 兼容模式</p>
      </div>

      {/* 配置区域 */}
      <div className="config-section">
        <div className="config-group">
          <label htmlFor="keySize">密钥长度：</label>
          <select
            id="keySize"
            value={config.keySize}
            onChange={(e) => updateConfig('keySize', e.target.value)}
          >
            <option value="128">AES-128</option>
            <option value="256">AES-256</option>
          </select>
        </div>

        <div className="config-group">
          <label htmlFor="mode">加密模式：</label>
          <select
            id="mode"
            value={config.mode}
            onChange={(e) => updateConfig('mode', e.target.value)}
          >
            <option value="CBC">CBC</option>
            <option value="ECB">ECB</option>
            <option value="CTR">CTR</option>
          </select>
        </div>

        <div className="config-group">
          <label htmlFor="key">密码：</label>
          <input
            type="text"
            id="key"
            value={config.password}
            onChange={(e) => updateConfig('password', e.target.value)}
            placeholder="输入密码"
          />
          <div className="gen-btn-group">
            <button className="btn-info" onClick={generatePassword}>
              生成密码
            </button>
          </div>
        </div>

        <div className="config-group">
          <label htmlFor="iv">IV 向量：</label>
          <input
            type="text"
            id="iv"
            value={config.iv}
            onChange={(e) => updateConfig('iv', e.target.value)}
            placeholder="输入 IV（可选）"
          />
          <div className="gen-btn-group">
            <button className="btn-info" onClick={generateIV}>
              生成 IV
            </button>
          </div>
        </div>
      </div>

      {/* 批量操作 */}
      <div className="batch-operations">
        <button className="btn-warning" onClick={generateAllParams}>
          🔄 一键生成所有参数
        </button>
        <button className="btn-success" onClick={copyAllParams}>
          📋 一键复制所有参数
        </button>
        <button className="btn-info" onClick={pasteFromClipboard}>
          📋 一键粘贴填充参数
        </button>
      </div>

      {/* 输入区域 */}
      <div className="input-section">
        <div className="input-group">
          <label htmlFor="inputText">输入内容：</label>
          <textarea
            id="inputText"
            value={inputText}
            onChange={(e) => updateInputText(e.target.value)}
            placeholder="请输入要处理的内容..."
            rows={6}
          />
        </div>

        <div className="btn-group">
          <button className="btn-primary" onClick={encryptAES}>
            加密 →
          </button>
          <button className="btn-success" onClick={decryptAES}>
            ← 解密
          </button>
          <button className="btn-secondary" onClick={clearAll}>
            清空所有
          </button>
        </div>
      </div>

      {/* 结果区域 */}
      <div className="result-section">
        <div className="result-label">处理结果：</div>
        <div className="result-box">
          {result || '处理结果将显示在这里...'}
        </div>

        <div className="stats">
          <div className="stat-item">
            <span>输入字符数</span>
            <span className="stat-value">{stats.inputCount}</span>
          </div>
          <div className="stat-item">
            <span>输出字符数</span>
            <span className="stat-value">{stats.outputCount}</span>
          </div>
          <div className="stat-item">
            <span>处理时间</span>
            <span className="stat-value">{stats.processTime}ms</span>
          </div>
          <div className="stat-item">
            <span>当前模式</span>
            <span className="stat-value">AES-{config.keySize}-{config.mode}</span>
          </div>
        </div>
      </div>

      {/* OpenSSL 配置 */}
      <div className="openssl-section">
        <div className="openssl-header" onClick={() => setShowOpensslConfig(!showOpensslConfig)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12L12 8L8 4L4 8L8 12Z" fill="#856404" />
          </svg>
          <span className="openssl-title">OpenSSL 兼容配置</span>
        </div>
        {showOpensslConfig && (
          <div className="openssl-content">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="usePbkdf2"
                checked={config.usePbkdf2}
                onChange={(e) => updateConfig('usePbkdf2', e.target.checked)}
              />
              <label htmlFor="usePbkdf2">使用 PBKDF2 密钥派生（OpenSSL 兼容模式）</label>
            </div>

            {config.usePbkdf2 && (
              <div id="pbkdf2Config">
                <div className="config-group">
                  <label htmlFor="iterations">迭代次数：</label>
                  <input
                    type="number"
                    id="iterations"
                    value={config.iterations}
                    onChange={(e) => updateConfig('iterations', parseInt(e.target.value))}
                    min="1"
                    max="100000"
                  />
                  <small style={{ color: '#666', marginTop: '2px' }}>
                    优化值：100（原默认 10000）
                  </small>
                </div>

                <div className="config-group">
                  <label htmlFor="salt">盐值（Base64）：</label>
                  <input
                    type="text"
                    id="salt"
                    value={config.salt}
                    onChange={(e) => updateConfig('salt', e.target.value)}
                    placeholder="自动生成 8 字节盐值"
                  />
                  <div className="gen-btn-group">
                    <button className="btn-info" onClick={generateSalt}>
                      生成盐值
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 粘贴参数模态框 */}
      {showPasteModal && (
        <div className="paste-modal" onClick={() => setShowPasteModal(false)}>
          <div className="paste-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>粘贴参数配置</h3>
            <p>请粘贴之前复制的 JSON 格式参数：</p>
            <textarea
              id="pasteTextarea"
              value={pasteJson}
              onChange={(e) => setPasteJson(e.target.value)}
              placeholder='{"password":"your_password","salt":"your_salt","iv":"your_iv"}'
              rows={6}
            />
            <div className="paste-modal-buttons">
              <button className="btn-secondary" onClick={() => setShowPasteModal(false)}>
                取消
              </button>
              <button className="btn-primary" onClick={applyPastedParams}>
                应用参数
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast 提示 */}
      {toast.show && (
        <div
          ref={toastRef}
          className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'} show`}
        >
          {toast.message}
        </div>
      )}

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .aes-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .header h1 {
          color: #333;
          font-size: 24px;
          margin-bottom: 5px;
        }
        
        .description {
          color: #666;
          font-size: 14px;
        }
        
        .config-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 6px;
        }
        
        .config-group {
          display: flex;
          flex-direction: column;
        }
        
        label {
          margin-bottom: 5px;
          color: #333;
          font-weight: 500;
          font-size: 14px;
        }
        
        select, input {
          padding: 8px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .batch-operations {
          display: flex;
          gap: 10px;
          margin: 15px 0;
          padding: 10px;
          background-color: #e9ecef;
          border-radius: 6px;
          flex-wrap: wrap;
        }
        
        .input-section {
          margin-bottom: 20px;
        }
        
        .input-group {
          margin-bottom: 15px;
        }
        
        textarea {
          width: 100%;
          min-height: 120px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
          font-size: 14px;
          font-family: 'SF Mono', Monaco, Consolas, monospace;
        }
        
        .btn-group {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }
        
        .gen-btn-group {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        
        button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          white-space: nowrap;
        }
        
        button:hover {
          opacity: 0.9;
        }
        
        .btn-primary {
          background-color: #007bff;
          color: white;
        }
        
        .btn-primary:hover {
          background-color: #0056b3;
        }
        
        .btn-success {
          background-color: #28a745;
          color: white;
        }
        
        .btn-success:hover {
          background-color: #1e7e34;
        }
        
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
        
        .btn-secondary:hover {
          background-color: #545b62;
        }
        
        .btn-warning {
          background-color: #ffc107;
          color: #212529;
        }
        
        .btn-warning:hover {
          background-color: #e0a800;
        }
        
        .btn-info {
          background-color: #17a2b8;
          color: white;
        }
        
        .btn-info:hover {
          background-color: #138496;
        }
        
        .result-section {
          margin-top: 20px;
        }
        
        .result-label {
          font-weight: 500;
          margin-bottom: 5px;
          color: #333;
        }
        
        .result-box {
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          padding: 15px;
          min-height: 150px;
          font-family: 'SF Mono', Monaco, Consolas, monospace;
          font-size: 14px;
          white-space: pre-wrap;
          word-break: break-all;
          overflow-y: auto;
          max-height: 400px;
        }
        
        .stats {
          display: flex;
          gap: 20px;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
          font-size: 14px;
          color: #666;
          flex-wrap: wrap;
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .stat-value {
          font-weight: 600;
          color: #333;
        }
        
        .openssl-section {
          margin-top: 20px;
          padding: 15px;
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          border-radius: 6px;
        }
        
        .openssl-header {
          display: flex;
          align-items: center;
          cursor: pointer;
          margin-bottom: 10px;
        }
        
        .openssl-title {
          font-weight: 600;
          color: #856404;
          margin-left: 8px;
        }
        
        .checkbox-group {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .checkbox-group input {
          margin-right: 8px;
          cursor: pointer;
        }
        
        .checkbox-group label {
          cursor: pointer;
          margin-bottom: 0;
        }
        
        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          color: white;
          padding: 10px 20px;
          border-radius: 4px;
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        
        .toast.show {
          opacity: 1;
        }
        
        .toast-success {
          background-color: #28a745;
        }
        
        .toast-error {
          background-color: #dc3545;
        }
        
        .paste-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }
        
        .paste-modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
        }
        
        .paste-modal-content h3 {
          margin-bottom: 10px;
          color: #333;
        }
        
        .paste-modal-content p {
          margin-bottom: 15px;
          color: #666;
        }
        
        .paste-modal-buttons {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 15px;
        }
        
        @media (max-width: 600px) {
          .config-section {
            grid-template-columns: 1fr;
          }
          
          .batch-operations {
            flex-direction: column;
          }
          
          .paste-modal-content {
            width: 95%;
            padding: 15px;
          }
          
          .stats {
            flex-direction: column;
            gap: 10px;
          }
        }

        /* 暗色模式支持 */
        @media (prefers-color-scheme: dark) {
          .aes-container {
            background: #1a1a1a;
            color: #e0e0e0;
            border-color: #333;
          }
          
          .header h1 {
            color: #ffffff;
          }
          
          .description {
            color: #aaa;
          }
          
          .config-section {
            background-color: #2d2d2d;
          }
          
          label {
            color: #e0e0e0;
          }
          
          select, input, textarea {
            background: #333;
            border-color: #555;
            color: #e0e0e0;
          }
          
          .batch-operations {
            background-color: #333;
          }
          
          .result-box {
            background-color: #252525;
            border-color: #444;
            color: #e0e0e0;
          }
          
          .stat-value {
            color: #e0e0e0;
          }
          
          .openssl-section {
            background-color: #332b00;
            border-color: #665800;
          }
          
          .openssl-title {
            color: #ffd700;
          }
          
          .paste-modal-content {
            background: #2d2d2d;
            color: #e0e0e0;
          }
          
          .paste-modal-content h3 {
            color: #ffffff;
          }
          
          .paste-modal-content p {
            color: #aaa;
          }
        }
      `}</style>
    </div>
  );
}

export default AESEncryptorOpenSSL;
