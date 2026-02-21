<!-- src/components/HashCalculator.vue -->
<template>
  <div class="hash-calculator">
    <!-- 标题和描述 -->
    <div class="header">
      <h1>哈希计算器</h1>
      <p class="description">支持多种哈希算法，计算文本和文件的哈希值</p>
    </div>

    <!-- 主内容区域 -->
    <div class="calculator-container">
      <!-- 左侧：输入和控制区域 -->
      <div class="left-panel">
        <div class="input-section">
          <!-- 输入类型选择 -->
          <div class="input-group">
            <label class="input-label">输入类型</label>
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
            <div class="text-input-container">
              <textarea
                id="text-input"
                v-model="inputText"
                class="text-input"
                placeholder="请输入要计算哈希值的文本..."
                rows="5"
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
          </div>

          <!-- 文件输入 -->
          <div v-else class="input-group">
            <label for="file-input" class="input-label">选择文件</label>
            <div 
              class="file-upload-area" 
              @click="triggerFileInput"
              @dragover.prevent="handleDragOver"
              @drop.prevent="handleFileDrop"
            >
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

          <!-- 算法选择 - 按照图片中的分组 -->
          <div class="input-group">
            <label class="input-label">哈希算法</label>
            <div class="algorithm-radio-group">
              <!-- MD 系列 -->
              <div class="algorithm-group">
                <div class="group-label">MD 系列</div>
                <div class="group-options">
                  <label class="radio-option" :class="{ 'selected': selectedAlgorithm === 'MD5' }">
                    <input 
                      type="radio" 
                      v-model="selectedAlgorithm" 
                      value="MD5" 
                      @change="calculateHash"
                      hidden
                    />
                    <div class="radio-dot"></div>
                    <span class="radio-text">MD5</span>
                  </label>
                </div>
              </div>

              <!-- SHA-1 系列 -->
              <div class="algorithm-group">
                <div class="group-label">SHA-1 系列</div>
                <div class="group-options">
                  <label class="radio-option" :class="{ 'selected': selectedAlgorithm === 'SHA-1' }">
                    <input 
                      type="radio" 
                      v-model="selectedAlgorithm" 
                      value="SHA-1" 
                      @change="calculateHash"
                      hidden
                    />
                    <div class="radio-dot"></div>
                    <span class="radio-text">SHA-1</span>
                  </label>
                </div>
              </div>

              <!-- SHA-2 系列 -->
              <div class="algorithm-group">
                <div class="group-label">SHA-2 系列</div>
                <div class="group-options">
                  <label class="radio-option" :class="{ 'selected': selectedAlgorithm === 'SHA-256' }">
                    <input 
                      type="radio" 
                      v-model="selectedAlgorithm" 
                      value="SHA-256" 
                      @change="calculateHash"
                      hidden
                    />
                    <div class="radio-dot"></div>
                    <span class="radio-text">SHA-256</span>
                  </label>
                  <label class="radio-option" :class="{ 'selected': selectedAlgorithm === 'SHA-512' }">
                    <input 
                      type="radio" 
                      v-model="selectedAlgorithm" 
                      value="SHA-512" 
                      @change="calculateHash"
                      hidden
                    />
                    <div class="radio-dot"></div>
                    <span class="radio-text">SHA-512</span>
                  </label>
                  <label class="radio-option" :class="{ 'selected': selectedAlgorithm === 'SHA-384' }">
                    <input 
                      type="radio" 
                      v-model="selectedAlgorithm" 
                      value="SHA-384" 
                      @change="calculateHash"
                      hidden
                    />
                    <div class="radio-dot"></div>
                    <span class="radio-text">SHA-384</span>
                  </label>
                </div>
              </div>

              <!-- SHA-3 系列 -->
              <div class="algorithm-group">
                <div class="group-label">SHA-3 系列</div>
                <div class="group-options">
                  <label class="radio-option" :class="{ 'selected': selectedAlgorithm === 'SHA3-256' }">
                    <input 
                      type="radio" 
                      v-model="selectedAlgorithm" 
                      value="SHA3-256" 
                      @change="calculateHash"
                      hidden
                    />
                    <div class="radio-dot"></div>
                    <span class="radio-text">SHA3-256</span>
                  </label>
                  <label class="radio-option" :class="{ 'selected': selectedAlgorithm === 'SHA3-512' }">
                    <input 
                      type="radio" 
                      v-model="selectedAlgorithm" 
                      value="SHA3-512" 
                      @change="calculateHash"
                      hidden
                    />
                    <div class="radio-dot"></div>
                    <span class="radio-text">SHA3-512</span>
                  </label>
                </div>
              </div>

              <!-- 其他算法 -->
              <div class="algorithm-group">
                <div class="group-label">其他算法</div>
                <div class="group-options">
                  <label class="radio-option" :class="{ 'selected': selectedAlgorithm === 'RIPEMD-160' }">
                    <input 
                      type="radio" 
                      v-model="selectedAlgorithm" 
                      value="RIPEMD-160" 
                      @change="calculateHash"
                      hidden
                    />
                    <div class="radio-dot"></div>
                    <span class="radio-text">RIPEMD-160</span>
                  </label>
                  <label class="radio-option" :class="{ 'selected': selectedAlgorithm === 'Whirlpool' }">
                    <input 
                      type="radio" 
                      v-model="selectedAlgorithm" 
                      value="Whirlpool" 
                      @change="calculateHash"
                      hidden
                    />
                    <div class="radio-dot"></div>
                    <span class="radio-text">Whirlpool</span>
                  </label>
                  <label class="radio-option" :class="{ 'selected': selectedAlgorithm === 'HMAC-MD5' }">
                    <input 
                      type="radio" 
                      v-model="selectedAlgorithm" 
                      value="HMAC-MD5" 
                      @change="calculateHash"
                      hidden
                    />
                    <div class="radio-dot"></div>
                    <span class="radio-text">HMAC-MD5</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="algorithm-info">
              <span class="info-text">{{ selectedAlgorithmInfo.description }}</span>
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
              :disabled="!canCalculate || isCalculating"
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
      </div>

      <!-- 右侧：结果区域 -->
      <div class="right-panel">
        <div class="result-section" :class="{ 'has-result': hashResult }">
          <div class="result-header">
            <h3>计算结果</h3>
            <button 
              v-if="hashResult"
              class="btn btn-icon copy-btn" 
              @click="copyToClipboard"
              :title="copyButtonText"
            >
              <svg class="icon" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
          </div>

          <div v-if="hashResult" class="result-content">
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

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
            </svg>
            <p>计算结果将显示在这里</p>
            <p class="empty-hint">输入文本或选择文件后点击"计算哈希值"</p>
          </div>

          <!-- 验证功能 -->
          <div v-if="hashResult && inputType === 'text'" class="verification-section">
            <h4>哈希验证</h4>
            <div class="verification-input">
              <input
                type="text"
                v-model="verificationHash"
                class="text-input-sm"
                placeholder="输入要验证的哈希值..."
                @keyup.enter="verifyHash"
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
              <div class="algorithm-header">
                <h4>{{ algo.label }}</h4>
                <span :class="['security-badge', algo.securityLevel]">{{ algo.security }}</span>
              </div>
              <p class="algorithm-desc">{{ algo.description }}</p>
              <div class="algorithm-stats">
                <span class="stat">输出长度: {{ algo.outputLength }}</span>
                <button 
                  class="btn btn-sm btn-try"
                  @click="selectedAlgorithm = algo.value; calculateHash()"
                  :disabled="!canCalculate"
                >
                  计算
                </button>
              </div>
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
const selectedAlgorithm = ref('MD5') // 默认选中 MD5，与图片一致
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

// 算法列表（根据图片中的分组）
const algorithms = [
  // MD 系列
  { 
    value: 'MD5', 
    label: 'MD5', 
    description: '消息摘要算法 5，广泛用于文件完整性校验',
    category: 'md',
    outputLength: '32字符 (Hex)',
    security: '不安全',
    securityLevel: 'low',
    byteLength: 16
  },

  // SHA-1 系列
  { 
    value: 'SHA-1', 
    label: 'SHA-1', 
    description: '安全哈希算法 1，已不推荐用于安全场景',
    category: 'sha1',
    outputLength: '40字符 (Hex)',
    security: '不安全',
    securityLevel: 'low',
    byteLength: 20
  },

  // SHA-2 系列
  { 
    value: 'SHA-256', 
    label: 'SHA-256', 
    description: '安全哈希算法 256位，目前最常用的安全哈希算法',
    category: 'sha2',
    outputLength: '64字符 (Hex)',
    security: '高安全性',
    securityLevel: 'high',
    byteLength: 32
  },
  { 
    value: 'SHA-512', 
    label: 'SHA-512', 
    description: '安全哈希算法 512位，提供更强的安全性',
    category: 'sha2',
    outputLength: '128字符 (Hex)',
    security: '极高安全性',
    securityLevel: 'high',
    byteLength: 64
  },
  { 
    value: 'SHA-384', 
    label: 'SHA-384', 
    description: '安全哈希算法 384位，SHA-512的截断版本',
    category: 'sha2',
    outputLength: '96字符 (Hex)',
    security: '高安全性',
    securityLevel: 'high',
    byteLength: 48
  },

  // SHA-3 系列
  { 
    value: 'SHA3-256', 
    label: 'SHA3-256', 
    description: 'SHA-3 系列，256位哈希值',
    category: 'sha3',
    outputLength: '64字符 (Hex)',
    security: '高安全性',
    securityLevel: 'high',
    byteLength: 32
  },
  { 
    value: 'SHA3-512', 
    label: 'SHA3-512', 
    description: 'SHA-3 系列，512位哈希值',
    category: 'sha3',
    outputLength: '128字符 (Hex)',
    security: '极高安全性',
    securityLevel: 'high',
    byteLength: 64
  },

  // 其他算法
  { 
    value: 'RIPEMD-160', 
    label: 'RIPEMD-160', 
    description: 'RACE完整性原语评估消息摘要，比特币地址生成',
    category: 'other',
    outputLength: '40字符 (Hex)',
    security: '中等安全性',
    securityLevel: 'medium',
    byteLength: 20
  },
  { 
    value: 'Whirlpool', 
    label: 'Whirlpool', 
    description: '基于AES设计的哈希函数，512位输出',
    category: 'other',
    outputLength: '128字符 (Hex)',
    security: '高安全性',
    securityLevel: 'high',
    byteLength: 64
  },
  { 
    value: 'HMAC-MD5', 
    label: 'HMAC-MD5', 
    description: '基于MD5的HMAC，带密钥的消息认证码',
    category: 'other',
    outputLength: '32字符 (Hex)',
    security: '低安全性',
    securityLevel: 'low',
    byteLength: 16
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

const selectedAlgorithmInfo = computed(() => {
  return algorithms.find(a => a.value === selectedAlgorithm.value) || algorithms[0]
})

// 方法
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleDragOver = (e) => {
  e.preventDefault()
  e.currentTarget.style.borderColor = '#007bff'
  e.currentTarget.style.background = '#e7f5ff'
}

const handleFileDrop = (e) => {
  e.preventDefault()
  e.currentTarget.style.borderColor = '#dee2e6'
  e.currentTarget.style.background = '#f8f9fa'
  
  const file = e.dataTransfer.files[0]
  if (file) {
    selectedFile.value = file
    calculateHash()
  }
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
  verificationHash.value = ''
  verificationResult.value = null
}

const clearInput = () => {
  inputText.value = ''
  hashResult.value = ''
  verificationHash.value = ''
  verificationResult.value = null
}

const clearResults = () => {
  hashResult.value = ''
  verificationHash.value = ''
  verificationResult.value = null
}

const clearAll = () => {
  clearInput()
  clearFile()
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getAlgorithmLabel = (algorithm) => {
  const algo = algorithms.find(a => a.value === algorithm)
  return algo ? algo.label : algorithm
}

// 使用 Web Crypto API 计算哈希（支持基础算法）
const calculateHashWithWebCrypto = async (data, algorithm) => {
  try {
    const startTime = performance.now()
    
    // Web Crypto API 支持的算法映射
    const algorithmMap = {
      'SHA-256': 'SHA-256',
      'SHA-384': 'SHA-384',
      'SHA-512': 'SHA-512',
      'SHA-1': 'SHA-1'
    }
    
    const webCryptoAlgorithm = algorithmMap[algorithm]
    if (!webCryptoAlgorithm) {
      throw new Error('Web Crypto API 不支持该算法')
    }
    
    const hashBuffer = await crypto.subtle.digest(webCryptoAlgorithm, data)
    const endTime = performance.now()
    calculationTime.value = Math.round(endTime - startTime)
    
    return hashBuffer
  } catch (error) {
    console.error('Web Crypto 计算错误:', error)
    throw error
  }
}

// 使用 CryptoJS 计算哈希（支持更多算法）
const calculateHashWithCryptoJS = async (data, algorithm) => {
  const startTime = performance.now()
  let hash
  
  try {
    if (typeof window.CryptoJS === 'undefined') {
      throw new Error('CryptoJS 库未加载')
    }

    const CryptoJS = window.CryptoJS

    // 处理文件数据
    if (data instanceof File) {
      const arrayBuffer = await data.arrayBuffer()
      const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(arrayBuffer))
      
      switch(algorithm) {
        case 'MD5': hash = CryptoJS.MD5(wordArray); break
        case 'SHA-1': hash = CryptoJS.SHA1(wordArray); break
        case 'SHA-256': hash = CryptoJS.SHA256(wordArray); break
        case 'SHA-384': hash = CryptoJS.SHA384(wordArray); break
        case 'SHA-512': hash = CryptoJS.SHA512(wordArray); break
        case 'SHA3-256': 
          if (CryptoJS.SHA3) {
            hash = CryptoJS.SHA3(wordArray, { outputLength: 256 })
          } else {
            throw new Error('CryptoJS.SHA3 未加载，请确保加载了 sha3.js')
          }
          break
        case 'SHA3-512': 
          if (CryptoJS.SHA3) {
            hash = CryptoJS.SHA3(wordArray, { outputLength: 512 })
          } else {
            throw new Error('CryptoJS.SHA3 未加载，请确保加载了 sha3.js')
          }
          break
        case 'RIPEMD-160': 
          if (CryptoJS.RIPEMD160) {
            hash = CryptoJS.RIPEMD160(wordArray)
          } else {
            throw new Error('CryptoJS.RIPEMD160 未加载，请确保加载了 ripemd160.js')
          }
          break
        case 'Whirlpool': 
          if (CryptoJS.Whirlpool) {
            hash = CryptoJS.Whirlpool(wordArray)
          } else {
            throw new Error('CryptoJS.Whirlpool 未加载，请确保加载了 whirlpool.js')
          }
          break
        case 'HMAC-MD5': 
          // 使用默认密钥 'key'
          const key = CryptoJS.enc.Utf8.parse('ruantools-hmac-key')
          const hmacData = CryptoJS.enc.Hex.parse(wordArray.toString())
          hash = CryptoJS.HmacMD5(hmacData, key)
          break
        default: hash = CryptoJS.SHA256(wordArray)
      }
    } else {
      // 处理文本数据
      switch(algorithm) {
        case 'MD5': hash = CryptoJS.MD5(data); break
        case 'SHA-1': hash = CryptoJS.SHA1(data); break
        case 'SHA-256': hash = CryptoJS.SHA256(data); break
        case 'SHA-384': hash = CryptoJS.SHA384(data); break
        case 'SHA-512': hash = CryptoJS.SHA512(data); break
        case 'SHA3-256': 
          if (CryptoJS.SHA3) {
            hash = CryptoJS.SHA3(data, { outputLength: 256 })
          } else {
            throw new Error('CryptoJS.SHA3 未加载，请确保加载了 sha3.js')
          }
          break
        case 'SHA3-512': 
          if (CryptoJS.SHA3) {
            hash = CryptoJS.SHA3(data, { outputLength: 512 })
          } else {
            throw new Error('CryptoJS.SHA3 未加载，请确保加载了 sha3.js')
          }
          break
        case 'RIPEMD-160': 
          if (CryptoJS.RIPEMD160) {
            hash = CryptoJS.RIPEMD160(data)
          } else {
            throw new Error('CryptoJS.RIPEMD160 未加载，请确保加载了 ripemd160.js')
          }
          break
        case 'Whirlpool': 
          if (CryptoJS.Whirlpool) {
            hash = CryptoJS.Whirlpool(data)
          } else {
            throw new Error('CryptoJS.Whirlpool 未加载，请确保加载了 whirlpool.js')
          }
          break
        case 'HMAC-MD5': 
          // 使用默认密钥
          const key = CryptoJS.enc.Utf8.parse('ruantools-hmac-key')
          hash = CryptoJS.HmacMD5(data, key)
          break
        default: hash = CryptoJS.SHA256(data)
      }
    }

    const endTime = performance.now()
    calculationTime.value = Math.round(endTime - startTime)
    
    // 转换为输出格式
    let hashString
    if (outputFormat.value === 'hex') {
      hashString = hash.toString(CryptoJS.enc.Hex)
    } else {
      hashString = hash.toString(CryptoJS.enc.Base64)
    }
    
    return hashString
    
  } catch (error) {
    console.error('CryptoJS 计算错误:', error)
    throw error
  }
}

// 计算哈希值
const calculateHash = async () => {
  if (!canCalculate.value) return
  
  isCalculating.value = true
  verificationResult.value = null
  
  try {
    let hashString
    let startTime
    
    // 尝试使用 Web Crypto API（性能更好）
    try {
      let data
      if (inputType.value === 'text') {
        const encoder = new TextEncoder()
        data = encoder.encode(inputText.value)
      } else {
        const arrayBuffer = await selectedFile.value.arrayBuffer()
        data = new Uint8Array(arrayBuffer)
      }
      
      // Web Crypto API 支持的算法
      const webCryptoAlgorithms = ['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1']
      
      if (webCryptoAlgorithms.includes(selectedAlgorithm.value)) {
        const hashBuffer = await calculateHashWithWebCrypto(data, selectedAlgorithm.value)
        
        // 转换为输出格式
        if (outputFormat.value === 'hex') {
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          hashString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        } else {
          const binary = String.fromCharCode.apply(null, new Uint8Array(hashBuffer))
          hashString = btoa(binary)
        }
      } else {
        // 使用 CryptoJS 计算
        if (inputType.value === 'text') {
          hashString = await calculateHashWithCryptoJS(inputText.value, selectedAlgorithm.value)
        } else {
          hashString = await calculateHashWithCryptoJS(selectedFile.value, selectedAlgorithm.value)
        }
      }
    } catch (webCryptoError) {
      console.log('Web Crypto API 失败，回退到 CryptoJS:', webCryptoError)
      
      // 使用 CryptoJS 计算
      if (inputType.value === 'text') {
        hashString = await calculateHashWithCryptoJS(inputText.value, selectedAlgorithm.value)
      } else {
        hashString = await calculateHashWithCryptoJS(selectedFile.value, selectedAlgorithm.value)
      }
    }
    
    hashResult.value = hashString
    showNotification('哈希计算完成', 'success')
    
  } catch (error) {
    console.error('计算失败:', error)
    showNotification(`计算失败: ${error.message}`, 'error')
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

// 加载 CryptoJS 及其扩展
const loadCryptoJS = () => {
  return new Promise((resolve) => {
    if (typeof window.CryptoJS !== 'undefined') {
      resolve()
      return
    }
    
    const baseScript = document.createElement('script')
    baseScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js'
    baseScript.onload = () => {
      console.log('CryptoJS 基础库已加载')
      
      // 加载扩展算法
      const extensions = [
        'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/sha3.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/ripemd160.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/whirlpool.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/hmac-md5.min.js'
      ]
      
      let loaded = 0
      const checkAllLoaded = () => {
        loaded++
        if (loaded === extensions.length) {
          console.log('所有 CryptoJS 扩展已加载')
          resolve()
        }
      }
      
      extensions.forEach(src => {
        const script = document.createElement('script')
        script.src = src
        script.onload = checkAllLoaded
        script.onerror = checkAllLoaded
        document.head.appendChild(script)
      })
    }
    
    document.head.appendChild(baseScript)
  })
}

// 生命周期
onMounted(() => {
  // 预加载 CryptoJS
  loadCryptoJS().then(() => {
    showNotification('CryptoJS 库已加载，支持所有哈希算法', 'success')
  })
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
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}

.description {
  font-size: 1rem;
  color: #6c757d;
  max-width: 600px;
  margin: 0 auto;
}

/* 主布局 - 使用 flexbox 固定比例 */
.calculator-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 600px;
}

@media (min-width: 1024px) {
  .calculator-container {
    flex-direction: row;
    height: calc(100vh - 200px);
    min-height: 600px;
    max-height: 800px;
  }
}

/* 左侧面板 */
.left-panel {
  flex: 1;
  min-width: 0;
}

@media (min-width: 1024px) {
  .left-panel {
    flex: 0 0 45%;
    max-width: 45%;
  }
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

@media (min-width: 1024px) {
  .right-panel {
    flex: 0 0 55%;
    max-width: 55%;
  }
}

/* 输入区域 - 固定高度，允许滚动 */
.input-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 12px;
}

.radio-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #495057;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.radio-label:hover {
  background-color: #f8f9fa;
}

.radio-label input[type="radio"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* 算法选择 - 按照图片样式 */
.algorithm-radio-group {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.algorithm-group {
  border-bottom: 1px solid #e9ecef;
}

.algorithm-group:last-child {
  border-bottom: none;
}

.group-label {
  padding: 12px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
  background: #f1f3f5;
  border-bottom: 1px solid #e9ecef;
}

.group-options {
  padding: 8px 16px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
  margin-bottom: 4px;
}

.radio-option:hover {
  background-color: #edf2ff;
}

.radio-option.selected {
  background-color: #e6f7ff;
}

.radio-option.selected .radio-dot {
  background-color: #007bff;
  border-color: #007bff;
}

.radio-option.selected .radio-dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 50%;
}

.radio-dot {
  width: 18px;
  height: 18px;
  border: 2px solid #adb5bd;
  border-radius: 50%;
  position: relative;
  transition: all 0.2s;
}

.radio-text {
  font-size: 0.95rem;
  color: #212529;
}

.radio-option input[type="radio"] {
  display: none;
}

.text-input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.text-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 120px;
  max-height: 200px;
  transition: border-color 0.2s;
  background: #f8f9fa;
}

.text-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  background: white;
}

.text-input-sm {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.text-input-sm:focus {
  outline: none;
  border-color: #007bff;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.char-count {
  font-size: 0.8rem;
  color: #6c757d;
}

.file-upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 30px 20px;
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
  width: 40px;
  height: 40px;
  margin-bottom: 12px;
  fill: #6c757d;
}

.upload-content p {
  color: #6c757d;
  margin: 0;
  font-size: 0.9rem;
}

.file-info {
  text-align: center;
}

.file-name {
  font-weight: 600;
  color: #495057;
  margin-bottom: 4px;
  font-size: 0.95rem;
  word-break: break-all;
}

.file-size {
  font-size: 0.85rem;
  color: #6c757d;
}

.select-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.select-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.algorithm-info {
  margin-top: 8px;
}

.info-text {
  font-size: 0.8rem;
  color: #6c757d;
  font-style: italic;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: auto;
  padding-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
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
  border: 1px solid #dee2e6;
}

.btn-outline:hover:not(:disabled) {
  border-color: #007bff;
  color: #007bff;
  background: #f8f9fa;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

.btn-icon {
  padding: 6px;
  background: transparent;
  border: none;
  color: #6c757d;
  flex: 0 0 auto;
}

.btn-icon:hover {
  color: #007bff;
  background: #f8f9fa;
  border-radius: 6px;
}

.copy-btn {
  margin-left: auto;
}

.spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

.spinner circle {
  stroke: white;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

/* 结果区域 - 固定高度，允许滚动 */
.result-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  flex: 1;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.result-section.has-result {
  border-color: #007bff;
  box-shadow: 0 2px 15px rgba(0, 123, 255, 0.1);
}

.result-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f8f9fa;
}

.result-header h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0;
}

.result-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
  border-bottom: 1px solid #f8f9fa;
}

.result-item:last-child {
  border-bottom: none;
}

.result-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.85rem;
}

.result-value {
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 0.9rem;
  color: #2c3e50;
  word-break: break-all;
  line-height: 1.4;
}

.input-preview {
  color: #6c757d;
  font-style: italic;
}

.hash-output {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e9ecef;
  max-height: 150px;
  overflow-y: auto;
}

.hash-value {
  font-size: 0.85rem;
  color: #e83e8c;
  line-height: 1.4;
  word-break: break-all;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6c757d;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  fill: #dee2e6;
  margin-bottom: 16px;
}

.empty-hint {
  font-size: 0.9rem;
  color: #adb5bd;
  margin-top: 8px;
}

/* 验证功能 */
.verification-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #f8f9fa;
}

.verification-section h4 {
  font-size: 1rem;
  color: #495057;
  margin-bottom: 12px;
}

.verification-input {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.verification-result {
  text-align: center;
}

.verification-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.85rem;
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

/* 算法说明 */
.info-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  max-height: 400px;
  overflow-y: auto;
}

.info-section h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.algorithms-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.algorithm-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
  transition: transform 0.2s;
}

.algorithm-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.algorithm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.algorithm-header h4 {
  font-size: 1rem;
  color: #2c3e50;
  margin: 0;
}

.security-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.security-badge.high {
  background: #d4edda;
  color: #155724;
}

.security-badge.medium {
  background: #fff3cd;
  color: #856404;
}

.security-badge.low {
  background: #f8d7da;
  color: #721c24;
}

.algorithm-desc {
  font-size: 0.85rem;
  color: #6c757d;
  line-height: 1.4;
  margin-bottom: 8px;
}

.algorithm-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.stat {
  padding: 2px 6px;
  border-radius: 4px;
  background: white;
}

.btn-try {
  padding: 4px 12px;
  font-size: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-try:hover:not(:disabled) {
  background: #0056b3;
}

.btn-try:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 通知 */
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
  z-index: 1000;
  font-size: 0.9rem;
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

/* 动画 */
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

@keyframes spin {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}

.icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}
</style>
