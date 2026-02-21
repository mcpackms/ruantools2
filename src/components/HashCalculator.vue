<template>
  <div class="hash-calculator">
    <!-- 标题和描述 -->
    <div class="header">
      <h1>哈希计算器</h1>
      <p class="description">在线计算文本和文件的哈希值，支持多种算法</p>
    </div>

    <!-- 主内容区域 -->
    <div class="calculator-container">
      <!-- 输入区域 -->
      <div class="input-section">
        <div class="input-group">
          <label for="input-type" class="input-label">输入类型</label>
          <div class="radio-group">
            <label class="radio-label">
              <input 
                type="radio" 
                v-model="inputType" 
                value="text" 
                @change="clearResults"
              />
              <span>文本</span>
            </label>
            <label class="radio-label">
              <input 
                type="radio" 
                v-model="inputType" 
                value="file" 
                @change="clearResults"
              />
              <span>文件</span>
            </label>
          </div>
        </div>

        <!-- 文本输入 -->
        <div v-if="inputType === 'text'" class="input-group">
          <label for="text-input" class="input-label">输入文本</label>
          <textarea
            id="text-input"
            v-model="inputText"
            class="text-input"
            placeholder="请输入要计算哈希值的文本..."
            rows="6"
            @input="debouncedCalculateHash"
          ></textarea>
          <div class="input-footer">
            <span class="char-count">字符数: {{ inputText.length }}</span>
            <button 
              class="btn btn-outline btn-sm" 
              @click="clearInput"
              :disabled="!inputText"
            >
              清空
            </button>
          </div>
        </div>

        <!-- 文件输入 -->
        <div v-else class="input-group">
          <label for="file-input" class="input-label">选择文件</label>
          <div class="file-upload-area" @click="triggerFileInput">
            <input
              type="file"
              id="file-input"
              ref="fileInput"
              class="file-input"
              @change="handleFileSelect"
            />
            <div class="upload-content">
              <svg class="upload-icon" viewBox="0 0 24 24">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
              </svg>
              <p v-if="!selectedFile">点击选择文件或拖放到此处</p>
              <div v-else class="file-info">
                <p class="file-name">{{ selectedFile.name }}</p>
                <p class="file-size">大小: {{ formatFileSize(selectedFile.size) }}</p>
              </div>
            </div>
          </div>
          <div v-if="selectedFile" class="input-footer">
            <button 
              class="btn btn-outline btn-sm" 
              @click="clearFile"
            >
              移除文件
            </button>
          </div>
        </div>

        <!-- 算法选择 -->
        <div class="input-group">
          <label for="algorithm" class="input-label">哈希算法</label>
          <select 
            id="algorithm" 
            v-model="selectedAlgorithm" 
            class="select-input"
            @change="calculateHash"
          >
            <option v-for="algo in algorithms" :key="algo.value" :value="algo.value">
              {{ algo.label }}
            </option>
          </select>
          <div class="algorithm-info">
            <span class="info-text">{{ getAlgorithmInfo(selectedAlgorithm) }}</span>
          </div>
        </div>

        <!-- 输出格式 -->
        <div class="input-group">
          <label class="input-label">输出格式</label>
          <div class="radio-group">
            <label class="radio-label">
              <input 
                type="radio" 
                v-model="outputFormat" 
                value="hex" 
                @change="calculateHash"
              />
              <span>十六进制 (Hex)</span>
            </label>
            <label class="radio-label">
              <input 
                type="radio" 
                v-model="outputFormat" 
                value="base64" 
                @change="calculateHash"
              />
              <span>Base64</span>
            </label>
          </div>
        </div>

        <!-- 计算按钮 -->
        <div class="button-group">
          <button 
            class="btn btn-primary" 
            @click="calculateHash"
            :disabled="!canCalculate"
          >
            <svg v-if="isCalculating" class="spinner" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
            </svg>
            <span v-else>计算哈希值</span>
          </button>
          <button 
            class="btn btn-outline" 
            @click="clearAll"
          >
            重置
          </button>
        </div>
      </div>

      <!-- 结果区域 -->
      <div v-if="hashResult" class="result-section">
        <div class="result-header">
          <h3>计算结果</h3>
          <div class="result-actions">
            <button 
              class="btn btn-icon" 
              @click="copyToClipboard"
              :title="copyButtonText"
            >
              <svg class="icon" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="result-content">
          <div class="result-item">
            <label class="result-label">算法</label>
            <span class="result-value">{{ getAlgorithmLabel(selectedAlgorithm) }}</span>
          </div>
          
          <div class="result-item">
            <label class="result-label">输入</label>
            <span class="result-value input-preview">
              {{ inputType === 'text' ? inputText.substring(0, 100) + (inputText.length > 100 ? '...' : '') : selectedFile.name }}
            </span>
          </div>

          <div class="result-item">
            <label class="result-label">哈希值</label>
            <div class="hash-output">
              <code class="hash-value">{{ hashResult }}</code>
            </div>
          </div>

          <div class="result-item">
            <label class="result-label">长度</label>
            <span class="result-value">{{ hashResult.length }} 字符</span>
          </div>

          <div class="result-item">
            <label class="result-label">计算时间</label>
            <span class="result-value">{{ calculationTime }} ms</span>
          </div>
        </div>

        <!-- 验证功能 -->
        <div v-if="inputType === 'text'" class="verification-section">
          <h4>哈希验证</h4>
          <div class="verification-input">
            <input
              type="text"
              v-model="verificationHash"
              class="text-input-sm"
              placeholder="输入要验证的哈希值..."
            />
            <button 
              class="btn btn-outline btn-sm" 
              @click="verifyHash"
              :disabled="!verificationHash"
            >
              验证
            </button>
          </div>
          <div v-if="verificationResult !== null" class="verification-result">
            <span :class="['verification-badge', verificationResult ? 'success' : 'error']">
              {{ verificationResult ? '✓ 匹配' : '✗ 不匹配' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 算法说明 -->
      <div class="info-section">
        <h3>算法说明</h3>
        <div class="algorithms-info">
          <div v-for="algo in algorithms" :key="algo.value" class="algorithm-card">
            <h4>{{ algo.label }}</h4>
            <p>{{ algo.description }}</p>
            <div class="algorithm-stats">
              <span class="stat">输出长度: {{ algo.outputLength }}</span>
              <span class="stat" :class="algo.securityLevel">{{ algo.security }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知 -->
    <div v-if="notification.show" class="notification" :class="notification.type">
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 响应式数据
const inputType = ref('text')
const inputText = ref('')
const selectedFile = ref(null)
const selectedAlgorithm = ref('SHA-256')
const outputFormat = ref('hex')
const hashResult = ref('')
const calculationTime = ref(0)
const isCalculating = ref(false)
const verificationHash = ref('')
const verificationResult = ref(null)
const copyButtonText = ref('复制到剪贴板')
const notification = ref({ show: false, message: '', type: 'success' })

// 文件输入引用
const fileInput = ref(null)

// 支持的算法
const algorithms = [
  { 
    value: 'SHA-256', 
    label: 'SHA-256', 
    description: '安全哈希算法 256位，目前最常用的安全哈希算法',
    outputLength: '64字符 (Hex)',
    security: '高安全性',
    securityLevel: 'high'
  },
  { 
    value: 'SHA-512', 
    label: 'SHA-512', 
    description: '安全哈希算法 512位，提供更强的安全性',
    outputLength: '128字符 (Hex)',
    security: '极高安全性',
    securityLevel: 'high'
  },
  { 
    value: 'SHA-384', 
    label: 'SHA-384', 
    description: '安全哈希算法 384位，SHA-512的截断版本',
    outputLength: '96字符 (Hex)',
    security: '高安全性',
    securityLevel: 'high'
  },
  { 
    value: 'SHA-1', 
    label: 'SHA-1', 
    description: '安全哈希算法 1，已不推荐用于安全场景',
    outputLength: '40字符 (Hex)',
    security: '不安全',
    securityLevel: 'low'
  },
  { 
    value: 'MD5', 
    label: 'MD5', 
    description: '消息摘要算法 5，仅用于非安全场景如文件校验',
    outputLength: '32字符 (Hex)',
    security: '不安全',
    securityLevel: 'low'
  }
]

// 计算属性
const canCalculate = computed(() => {
  if (inputType.value === 'text') {
    return inputText.value.trim().length > 0
  } else {
    return selectedFile.value !== null
  }
})

// 方法
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    calculateHash()
  }
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  hashResult.value = ''
}

const clearInput = () => {
  inputText.value = ''
  hashResult.value = ''
}

const clearResults = () => {
  hashResult.value = ''
  verificationHash.value = ''
  verificationResult.value = null
}

const clearAll = () => {
  clearInput()
  clearFile()
  clearResults()
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getAlgorithmInfo = (algorithm) => {
  const algo = algorithms.find(a => a.value === algorithm)
  return algo ? algo.description : ''
}

const getAlgorithmLabel = (algorithm) => {
  const algo = algorithms.find(a => a.value === algorithm)
  return algo ? algo.label : algorithm
}

// 使用 Web Crypto API 计算哈希
const calculateHashWithWebCrypto = async (data, algorithm) => {
  try {
    const startTime = performance.now()
    
    let hashBuffer
    if (algorithm === 'MD5') {
      // Web Crypto API 不支持 MD5，需要特殊处理
      throw new Error('Web Crypto API 不支持 MD5，请使用其他算法')
    } else {
      hashBuffer = await crypto.subtle.digest(algorithm, data)
    }
    
    const endTime = performance.now()
    calculationTime.value = Math.round(endTime - startTime)
    
    return hashBuffer
  } catch (error) {
    console.error('哈希计算错误:', error)
    throw error
  }
}

// 转换为输出格式
const bufferToFormat = (buffer, format) => {
  if (format === 'hex') {
    const hashArray = Array.from(new Uint8Array(buffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } else if (format === 'base64') {
    const binary = String.fromCharCode.apply(null, new Uint8Array(buffer))
    return btoa(binary)
  }
  return ''
}

// 计算哈希值
const calculateHash = async () => {
  if (!canCalculate.value) return
  
  isCalculating.value = true
  verificationResult.value = null
  
  try {
    let data
    if (inputType.value === 'text') {
      const encoder = new TextEncoder()
      data = encoder.encode(inputText.value)
    } else {
      const arrayBuffer = await selectedFile.value.arrayBuffer()
      data = new Uint8Array(arrayBuffer)
    }
    
    const hashBuffer = await calculateHashWithWebCrypto(data, selectedAlgorithm.value)
    hashResult.value = bufferToFormat(hashBuffer, outputFormat.value)
    
    showNotification('哈希计算完成', 'success')
  } catch (error) {
    console.error('计算失败:', error)
    
    // 如果 Web Crypto API 不支持该算法，尝试使用 CryptoJS（如果可用）
    if (selectedAlgorithm.value === 'MD5' && typeof window !== 'undefined' && window.CryptoJS) {
      try {
        const startTime = performance.now()
        
        let hash
        if (inputType.value === 'text') {
          hash = window.CryptoJS.MD5(inputText.value)
        } else {
          const wordArray = window.CryptoJS.lib.WordArray.create(await selectedFile.value.arrayBuffer())
          hash = window.CryptoJS.MD5(wordArray)
        }
        
        const endTime = performance.now()
        calculationTime.value = Math.round(endTime - startTime)
        
        hashResult.value = outputFormat.value === 'hex' 
          ? hash.toString() 
          : hash.toString(window.CryptoJS.enc.Base64)
        
        showNotification('使用 CryptoJS 计算 MD5 完成', 'success')
      } catch (cryptoJSError) {
        showNotification('MD5 计算失败，请安装 crypto-js 库', 'error')
      }
    } else {
      showNotification(`计算失败: ${error.message}`, 'error')
    }
  } finally {
    isCalculating.value = false
  }
}

// 防抖计算
let debounceTimer = null
const debouncedCalculateHash = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (inputText.value.trim().length > 0) {
      calculateHash()
    }
  }, 500)
}

// 验证哈希
const verifyHash = () => {
  if (!hashResult.value || !verificationHash.value) return
  
  const normalizedResult = hashResult.value.toLowerCase().trim()
  const normalizedVerification = verificationHash.value.toLowerCase().trim()
  
  verificationResult.value = normalizedResult === normalizedVerification
  
  showNotification(
    verificationResult.value ? '哈希验证通过' : '哈希验证失败',
    verificationResult.value ? 'success' : 'error'
  )
}

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(hashResult.value)
    copyButtonText.value = '已复制!'
    showNotification('已复制到剪贴板', 'success')
    
    setTimeout(() => {
      copyButtonText.value = '复制到剪贴板'
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    showNotification('复制失败', 'error')
  }
}

// 显示通知
const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// 生命周期
onMounted(() => {
  // 加载 CryptoJS（如果需要）
  if (typeof window !== 'undefined' && !window.CryptoJS) {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js'
    script.onload = () => {
      console.log('CryptoJS loaded')
    }
    document.head.appendChild(script)
  }
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<style scoped>
.hash-calculator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}

.description {
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.calculator-container {
  display: grid;
  gap: 30px;
}

@media (min-width: 768px) {
  .calculator-container {
    grid-template-columns: 1fr 1fr;
  }
  
  .info-section {
    grid-column: 1 / -1;
  }
}

.input-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.input-group {
  margin-bottom: 25px;
}

.input-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.radio-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #495057;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.text-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 0.95rem;
  resize: vertical;
  transition: border-color 0.2s;
  background: #f8f9fa;
}

.text-input:focus {
  outline: none;
  border-color: #007bff;
  background: white;
}

.text-input-sm {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.char-count {
  font-size: 0.85rem;
  color: #6c757d;
}

.file-upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
}

.file-upload-area:hover {
  border-color: #007bff;
  background: #e7f5ff;
}

.file-input {
  display: none;
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  fill: #6c757d;
}

.upload-content p {
  color: #6c757d;
  margin: 0;
}

.file-info {
  text-align: center;
}

.file-name {
  font-weight: 600;
  color: #495057;
  margin-bottom: 4px;
}

.file-size {
  font-size: 0.9rem;
  color: #6c757d;
}

.select-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.select-input:focus {
  outline: none;
  border-color: #007bff;
}

.algorithm-info {
  margin-top: 8px;
}

.info-text {
  font-size: 0.85rem;
  color: #6c757d;
  font-style: italic;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  color: #495057;
  border: 2px solid #e9ecef;
}

.btn-outline:hover:not(:disabled) {
  border-color: #007bff;
  color: #007bff;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
}

.btn-icon {
  padding: 8px;
  background: transparent;
  border: none;
  color: #6c757d;
}

.btn-icon:hover {
  color: #007bff;
  background: #f8f9fa;
  border-radius: 6px;
}

.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

.spinner circle {
  stroke: white;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}

.result-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f8f9fa;
}

.result-header h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f8f9fa;
}

.result-item:last-child {
  border-bottom: none;
}

.result-label {
  font-weight: 600;
  color: #495057;
  min-width: 100px;
  font-size: 0.95rem;
}

.result-value {
  flex: 1;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 0.95rem;
  color: #2c3e50;
  word-break: break-all;
}

.input-preview {
  color: #6c757d;
  font-style: italic;
}

.hash-output {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.hash-value {
  font-size: 0.9rem;
  color: #e83e8c;
  line-height: 1.6;
}

.verification-section {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 2px solid #f8f9fa;
}

.verification-section h4 {
  font-size: 1.2rem;
  color: #495057;
  margin-bottom: 16px;
}

.verification-input {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.verification-result {
  text-align: center;
}

.verification-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.verification-badge.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.verification-badge.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.info-section h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 25px;
  text-align: center;
}

.algorithms-info {
  display: grid;
  gap: 20px;
}

@media (min-width: 768px) {
  .algorithms-info {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

.algorithm-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e9ecef;
  transition: transform 0.2s;
}

.algorithm-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.algorithm-card h4 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.algorithm-card p {
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 15px;
}

.algorithm-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.stat {
  padding: 4px 8px;
  border-radius: 4px;
  background: white;
}

.high {
  background: #d4edda;
  color: #155724;
}

.medium {
  background: #fff3cd;
  color: #856404;
}

.low {
  background: #f8d7da;
  color: #721c24;
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
  z-index: 1000;
}

.notification.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.notification.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}
</style>
