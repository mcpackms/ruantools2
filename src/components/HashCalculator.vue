<!-- src/components/HashCalculator.vue -->
<template>
  <div class="hash-calculator">
    <!-- 标题和描述 -->
    <div class="header">
      <h1>哈希计算器</h1>
      <p class="description">支持20+种哈希算法，计算文本和文件的哈希值</p>
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

          <!-- 算法选择 -->
          <div class="input-group">
            <label for="algorithm" class="input-label">哈希算法</label>
            <div class="algorithm-select-container">
              <select 
                id="algorithm" 
                v-model="selectedAlgorithm" 
                class="select-input"
                @change="calculateHash"
              >
                <optgroup label="MD 系列">
                  <option v-for="algo in algorithms.filter(a => a.category === 'md')" 
                          :key="algo.value" 
                          :value="algo.value">
                    {{ algo.label }}
                  </option>
                </optgroup>
                <optgroup label="SHA-1 系列">
                  <option v-for="algo in algorithms.filter(a => a.category === 'sha1')" 
                          :key="algo.value" 
                          :value="algo.value">
                    {{ algo.label }}
                  </option>
                </optgroup>
                <optgroup label="SHA-2 系列">
                  <option v-for="algo in algorithms.filter(a => a.category === 'sha2')" 
                          :key="algo.value" 
                          :value="algo.value">
                    {{ algo.label }}
                  </option>
                </optgroup>
                <optgroup label="SHA-3 系列">
                  <option v-for="algo in algorithms.filter(a => a.category === 'sha3')" 
                          :key="algo.value" 
                          :value="algo.value">
                    {{ algo.label }}
                  </option>
                </optgroup>
                <optgroup label="其他算法">
                  <option v-for="algo in algorithms.filter(a => a.category === 'other')" 
                          :key="algo.value" 
                          :value="algo.value">
                    {{ algo.label }}
                  </option>
                </optgroup>
              </select>
              <div class="algorithm-search" v-if="showAlgorithmSearch">
                <input 
                  type="text" 
                  v-model="algorithmSearch" 
                  placeholder="搜索算法..."
                  @input="filterAlgorithms"
                  class="search-input"
                />
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

          <!-- 高级选项 -->
          <div class="input-group advanced-options">
            <div class="advanced-toggle" @click="toggleAdvancedOptions">
              <span>高级选项</span>
              <svg :class="['toggle-icon', { 'expanded': showAdvancedOptions }]" 
                   viewBox="0 0 24 24">
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
              </svg>
            </div>
            
            <div v-if="showAdvancedOptions" class="advanced-content">
              <div class="option-row">
                <label class="option-label">
                  <input type="checkbox" v-model="autoCalculate" />
                  <span>实时计算</span>
                </label>
                <label class="option-label">
                  <input type="checkbox" v-model="uppercaseOutput" @change="calculateHash" />
                  <span>大写输出</span>
                </label>
              </div>
              <div class="option-row">
                <label class="option-label">
                  <input type="checkbox" v-model="showHashBytes" @change="calculateHash" />
                  <span>显示字节长度</span>
                </label>
              </div>
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
        <!-- 多个结果同时显示 -->
        <div class="results-section" :class="{ 'has-results': computedHashResults.length > 0 }">
          <div class="results-header">
            <h3>计算结果</h3>
            <div class="results-actions">
              <button 
                v-if="computedHashResults.length > 0"
                class="btn btn-icon" 
                @click="copyAllResults"
                :title="copyAllButtonText"
              >
                <svg class="icon" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                <span>复制全部</span>
              </button>
              <button 
                v-if="computedHashResults.length > 0"
                class="btn btn-icon" 
                @click="exportResults"
                title="导出结果"
              >
                <svg class="icon" viewBox="0 0 24 24">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                <span>导出</span>
              </button>
            </div>
          </div>

          <div v-if="computedHashResults.length > 0" class="results-content">
            <div class="result-tabs">
              <button 
                v-for="result in computedHashResults" 
                :key="result.algorithm"
                :class="['tab-btn', { 'active': activeResultTab === result.algorithm }]"
                @click="activeResultTab = result.algorithm"
              >
                {{ result.label }}
              </button>
            </div>

            <div class="result-display">
              <div v-for="result in computedHashResults" 
                   :key="result.algorithm"
                   v-show="activeResultTab === result.algorithm"
                   class="result-detail">
                <div class="result-item">
                  <label class="result-label">算法</label>
                  <span class="result-value">{{ result.label }}</span>
                </div>
                
                <div class="result-item">
                  <label class="result-label">输入</label>
                  <span class="result-value input-preview">
                    {{ inputType === 'text' 
                       ? (inputText.substring(0, 50) + (inputText.length > 50 ? '...' : ''))
                       : selectedFile.name }}
                  </span>
                </div>

                <div class="result-item">
                  <label class="result-label">哈希值</label>
                  <div class="hash-output">
                    <code class="hash-value">{{ uppercaseOutput ? result.hash.toUpperCase() : result.hash }}</code>
                    <button 
                      class="btn btn-icon copy-btn-sm" 
                      @click="copyResult(result.hash)"
                      :title="'复制 ' + result.label"
                    >
                      <svg class="icon-sm" viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="result-item">
                  <label class="result-label">长度</label>
                  <span class="result-value">
                    {{ showHashBytes ? `${result.hexLength} 字符 (${result.byteLength} 字节)` : `${result.hexLength} 字符` }}
                  </span>
                </div>

                <div class="result-item">
                  <label class="result-label">计算时间</label>
                  <span class="result-value">{{ result.time }} ms</span>
                </div>

                <div v-if="result.security" class="result-item">
                  <label class="result-label">安全性</label>
                  <span :class="['security-badge', result.securityLevel]">
                    {{ result.security }}
                  </span>
                </div>

                <div v-if="inputType === 'text'" class="verification-section">
                  <div class="verification-input">
                    <input
                      type="text"
                      v-model="result.verificationHash"
                      class="text-input-sm"
                      :placeholder="`输入 ${result.label} 哈希值进行验证...`"
                      @keyup.enter="verifyHash(result)"
                    />
                    <button 
                      class="btn btn-outline btn-sm" 
                      @click="verifyHash(result)"
                      :disabled="!result.verificationHash"
                    >
                      验证
                    </button>
                  </div>
                  <div v-if="result.verificationResult !== null" class="verification-result">
                    <span :class="['verification-badge', result.verificationResult ? 'success' : 'error']">
                      {{ result.verificationResult ? '✓ 匹配' : '✗ 不匹配' }}
                    </span>
                  </div>
                </div>
              </div>
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
        </div>

        <!-- 算法说明 -->
        <div class="info-section">
          <h3>支持的哈希算法</h3>
          <div class="algorithms-info">
            <div v-for="algo in filteredAlgorithms" :key="algo.value" class="algorithm-card">
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// 响应式数据
const inputType = ref('text')
const inputText = ref('')
const selectedFile = ref(null)
const selectedAlgorithm = ref('SHA-256')
const outputFormat = ref('hex')
const isCalculating = ref(false)
const copyAllButtonText = ref('复制全部')
const notification = ref({ show: false, message: '', type: 'success' })
const showAdvancedOptions = ref(false)
const autoCalculate = ref(true)
const uppercaseOutput = ref(false)
const showHashBytes = ref(false)
const algorithmSearch = ref('')
const showAlgorithmSearch = ref(false)
const activeResultTab = ref('SHA-256')

// 文件输入引用
const fileInput = ref(null)

// 支持的算法（扩展列表）
const algorithms = ref([
  // MD 系列
  { 
    value: 'MD5', 
    label: 'MD5', 
    description: '消息摘要算法 5，广泛用于文件完整性校验',
    category: 'md',
    outputLength: '32字符',
    security: '不安全',
    securityLevel: 'low',
    byteLength: 16
  },
  { 
    value: 'MD4', 
    label: 'MD4', 
    description: '消息摘要算法 4，已被证明不安全',
    category: 'md',
    outputLength: '32字符',
    security: '不安全',
    securityLevel: 'low',
    byteLength: 16
  },
  { 
    value: 'MD2', 
    label: 'MD2', 
    description: '消息摘要算法 2，已被证明不安全',
    category: 'md',
    outputLength: '32字符',
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
    outputLength: '40字符',
    security: '不安全',
    securityLevel: 'low',
    byteLength: 20
  },

  // SHA-2 系列
  { 
    value: 'SHA-224', 
    label: 'SHA-224', 
    description: 'SHA-2 系列，224位哈希值',
    category: 'sha2',
    outputLength: '56字符',
    security: '中等',
    securityLevel: 'medium',
    byteLength: 28
  },
  { 
    value: 'SHA-256', 
    label: 'SHA-256', 
    description: 'SHA-2 系列，256位哈希值，目前最常用',
    category: 'sha2',
    outputLength: '64字符',
    security: '高',
    securityLevel: 'high',
    byteLength: 32
  },
  { 
    value: 'SHA-384', 
    label: 'SHA-384', 
    description: 'SHA-2 系列，384位哈希值',
    category: 'sha2',
    outputLength: '96字符',
    security: '高',
    securityLevel: 'high',
    byteLength: 48
  },
  { 
    value: 'SHA-512', 
    label: 'SHA-512', 
    description: 'SHA-2 系列，512位哈希值',
    category: 'sha2',
    outputLength: '128字符',
    security: '高',
    securityLevel: 'high',
    byteLength: 64
  },
  { 
    value: 'SHA-512/224', 
    label: 'SHA-512/224', 
    description: 'SHA-512/224位哈希值',
    category: 'sha2',
    outputLength: '56字符',
    security: '中等',
    securityLevel: 'medium',
    byteLength: 28
  },
  { 
    value: 'SHA-512/256', 
    label: 'SHA-512/256', 
    description: 'SHA-512/256位哈希值',
    category: 'sha2',
    outputLength: '64字符',
    security: '高',
    securityLevel: 'high',
    byteLength: 32
  },

  // SHA-3 系列
  { 
    value: 'SHA3-224', 
    label: 'SHA3-224', 
    description: 'SHA-3 系列，224位哈希值',
    category: 'sha3',
    outputLength: '56字符',
    security: '中等',
    securityLevel: 'medium',
    byteLength: 28
  },
  { 
    value: 'SHA3-256', 
    label: 'SHA3-256', 
    description: 'SHA-3 系列，256位哈希值',
    category: 'sha3',
    outputLength: '64字符',
    security: '高',
    securityLevel: 'high',
    byteLength: 32
  },
  { 
    value: 'SHA3-384', 
    label: 'SHA3-384', 
    description: 'SHA-3 系列，384位哈希值',
    category: 'sha3',
    outputLength: '96字符',
    security: '高',
    securityLevel: 'high',
    byteLength: 48
  },
  { 
    value: 'SHA3-512', 
    label: 'SHA3-512', 
    description: 'SHA-3 系列，512位哈希值',
    category: 'sha3',
    outputLength: '128字符',
    security: '高',
    securityLevel: 'high',
    byteLength: 64
  },

  // 其他算法
  { 
    value: 'RIPEMD-160', 
    label: 'RIPEMD-160', 
    description: 'RACE完整性原语评估消息摘要，比特币地址生成',
    category: 'other',
    outputLength: '40字符',
    security: '中等',
    securityLevel: 'medium',
    byteLength: 20
  },
  { 
    value: 'HMAC-MD5', 
    label: 'HMAC-MD5', 
    description: '基于MD5的HMAC，带密钥的消息认证码',
    category: 'other',
    outputLength: '32字符',
    security: '低',
    securityLevel: 'low',
    byteLength: 16
  },
  { 
    value: 'HMAC-SHA1', 
    label: 'HMAC-SHA1', 
    description: '基于SHA-1的HMAC',
    category: 'other',
    outputLength: '40字符',
    security: '中等',
    securityLevel: 'medium',
    byteLength: 20
  },
  { 
    value: 'HMAC-SHA256', 
    label: 'HMAC-SHA256', 
    description: '基于SHA-256的HMAC',
    category: 'other',
    outputLength: '64字符',
    security: '高',
    securityLevel: 'high',
    byteLength: 32
  },
  { 
    value: 'HMAC-SHA512', 
    label: 'HMAC-SHA512', 
    description: '基于SHA-512的HMAC',
    category: 'other',
    outputLength: '128字符',
    security: '高',
    securityLevel: 'high',
    byteLength: 64
  }
])

// 计算结果存储
const computedHashResults = ref([])

// 计算属性
const canCalculate = computed(() => {
  if (inputType.value === 'text') {
    return inputText.value.trim().length > 0
  } else {
    return selectedFile.value !== null
  }
})

const selectedAlgorithmInfo = computed(() => {
  return algorithms.value.find(a => a.value === selectedAlgorithm.value) || algorithms.value[0]
})

const filteredAlgorithms = computed(() => {
  if (!algorithmSearch.value.trim()) {
    return algorithms.value.slice(0, 6) // 默认显示前6个
  }
  const searchTerm = algorithmSearch.value.toLowerCase()
  return algorithms.value.filter(algo => 
    algo.label.toLowerCase().includes(searchTerm) ||
    algo.description.toLowerCase().includes(searchTerm)
  )
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
    if (autoCalculate.value) {
      calculateHash()
    }
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    if (autoCalculate.value) {
      calculateHash()
    }
  }
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  computedHashResults.value = []
}

const clearInput = () => {
  inputText.value = ''
  computedHashResults.value = []
}

const clearResults = () => {
  computedHashResults.value = []
}

const clearAll = () => {
  clearInput()
  clearFile()
  algorithmSearch.value = ''
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const toggleAdvancedOptions = () => {
  showAdvancedOptions.value = !showAdvancedOptions.value
}

const filterAlgorithms = () => {
  // 搜索功能已在计算属性中实现
}

// 使用 CryptoJS 计算哈希
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
        case 'MD4': hash = CryptoJS.MD4(wordArray); break
        case 'MD2': hash = CryptoJS.MD2(wordArray); break
        case 'SHA-1': hash = CryptoJS.SHA1(wordArray); break
        case 'SHA-224': hash = CryptoJS.SHA224(wordArray); break
        case 'SHA-256': hash = CryptoJS.SHA256(wordArray); break
        case 'SHA-384': hash = CryptoJS.SHA384(wordArray); break
        case 'SHA-512': hash = CryptoJS.SHA512(wordArray); break
        case 'SHA-512/224': hash = CryptoJS.SHA512(wordArray, 224); break
        case 'SHA-512/256': hash = CryptoJS.SHA512(wordArray, 256); break
        case 'SHA3-224': hash = CryptoJS.SHA3(wordArray, { outputLength: 224 }); break
        case 'SHA3-256': hash = CryptoJS.SHA3(wordArray, { outputLength: 256 }); break
        case 'SHA3-384': hash = CryptoJS.SHA3(wordArray, { outputLength: 384 }); break
        case 'SHA3-512': hash = CryptoJS.SHA3(wordArray, { outputLength: 512 }); break
        case 'RIPEMD-160': hash = CryptoJS.RIPEMD160(wordArray); break
        case 'HMAC-MD5': 
          hash = CryptoJS.HmacMD5(wordArray, 'default-key')
          break
        case 'HMAC-SHA1': 
          hash = CryptoJS.HmacSHA1(wordArray, 'default-key')
          break
        case 'HMAC-SHA256': 
          hash = CryptoJS.HmacSHA256(wordArray, 'default-key')
          break
        case 'HMAC-SHA512': 
          hash = CryptoJS.HmacSHA512(wordArray, 'default-key')
          break
        default: hash = CryptoJS.SHA256(wordArray)
      }
    } else {
      // 处理文本数据
      switch(algorithm) {
        case 'MD5': hash = CryptoJS.MD5(data); break
        case 'MD4': hash = CryptoJS.MD4(data); break
        case 'MD2': hash = CryptoJS.MD2(data); break
        case 'SHA-1': hash = CryptoJS.SHA1(data); break
        case 'SHA-224': hash = CryptoJS.SHA224(data); break
        case 'SHA-256': hash = CryptoJS.SHA256(data); break
        case 'SHA-384': hash = CryptoJS.SHA384(data); break
        case 'SHA-512': hash = CryptoJS.SHA512(data); break
        case 'SHA-512/224': hash = CryptoJS.SHA512(data, 224); break
        case 'SHA-512/256': hash = CryptoJS.SHA512(data, 256); break
        case 'SHA3-224': hash = CryptoJS.SHA3(data, { outputLength: 224 }); break
        case 'SHA3-256': hash = CryptoJS.SHA3(data, { outputLength: 256 }); break
        case 'SHA3-384': hash = CryptoJS.SHA3(data, { outputLength: 384 }); break
        case 'SHA3-512': hash = CryptoJS.SHA3(data, { outputLength: 512 }); break
        case 'RIPEMD-160': hash = CryptoJS.RIPEMD160(data); break
        case 'HMAC-MD5': 
          hash = CryptoJS.HmacMD5(data, 'default-key')
          break
        case 'HMAC-SHA1': 
          hash = CryptoJS.HmacSHA1(data, 'default-key')
          break
        case 'HMAC-SHA256': 
          hash = CryptoJS.HmacSHA256(data, 'default-key')
          break
        case 'HMAC-SHA512': 
          hash = CryptoJS.HmacSHA512(data, 'default-key')
          break
        default: hash = CryptoJS.SHA256(data)
      }
    }

    const endTime = performance.now()
    const calculationTime = Math.round(endTime - startTime)
    
    // 转换为输出格式
    let hashString
    if (outputFormat.value === 'hex') {
      hashString = hash.toString(CryptoJS.enc.Hex)
    } else {
      hashString = hash.toString(CryptoJS.enc.Base64)
    }
    
    return {
      hash: hashString,
      time: calculationTime
    }
    
  } catch (error) {
    console.error('CryptoJS 计算错误:', error)
    throw error
  }
}

// 计算所有算法的哈希
const calculateAllHashes = async () => {
  if (!canCalculate.value) return
  
  isCalculating.value = true
  computedHashResults.value = []
  
  try {
    // 只计算选中的算法
    const algorithm = algorithms.value.find(a => a.value === selectedAlgorithm.value)
    if (!algorithm) return

    const startTime = performance.now()
    let result
    
    if (inputType.value === 'text') {
      result = await calculateHashWithCryptoJS(inputText.value, selectedAlgorithm.value)
    } else {
      result = await calculateHashWithCryptoJS(selectedFile.value, selectedAlgorithm.value)
    }
    
    const algoInfo = algorithms.value.find(a => a.value === selectedAlgorithm.value)
    
    computedHashResults.value = [{
      algorithm: selectedAlgorithm.value,
      label: algorithm.label,
      hash: uppercaseOutput.value ? result.hash.toUpperCase() : result.hash,
      hexLength: result.hash.length,
      byteLength: algoInfo?.byteLength || 0,
      time: result.time,
      security: algoInfo?.security || '未知',
      securityLevel: algoInfo?.securityLevel || 'medium',
      verificationHash: '',
      verificationResult: null
    }]
    
    activeResultTab.value = selectedAlgorithm.value
    
    showNotification(`${algorithm.label} 计算完成`, 'success')
    
  } catch (error) {
    console.error('计算失败:', error)
    showNotification(`计算失败: ${error.message}`, 'error')
  } finally {
    isCalculating.value = false
  }
}

// 计算哈希值
const calculateHash = async () => {
  await calculateAllHashes()
}

// 防抖计算
let debounceTimer = null
const debouncedCalculateHash = () => {
  if (!autoCalculate.value) return
  
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (inputText.value.trim().length > 0) {
      calculateHash()
    }
  }, 800)
}

// 验证哈希
const verifyHash = (result) => {
  if (!result.hash || !result.verificationHash) return
  
  const normalizedResult = result.hash.toLowerCase().trim()
  const normalizedVerification = result.verificationHash.toLowerCase().trim()
  
  result.verificationResult = normalizedResult === normalizedVerification
  
  showNotification(
    result.verificationResult ? '哈希验证通过' : '哈希验证失败',
    result.verificationResult ? 'success' : 'error'
  )
}

// 复制单个结果
const copyResult = async (hash) => {
  try {
    await navigator.clipboard.writeText(hash)
    showNotification('已复制到剪贴板', 'success')
  } catch (error) {
    console.error('复制失败:', error)
    showNotification('复制失败', 'error')
  }
}

// 复制所有结果
const copyAllResults = async () => {
  const resultsText = computedHashResults.value.map(result => 
    `${result.label}: ${result.hash}`
  ).join('\n')
  
  try {
    await navigator.clipboard.writeText(resultsText)
    copyAllButtonText.value = '已复制!'
    showNotification('所有结果已复制到剪贴板', 'success')
    
    setTimeout(() => {
      copyAllButtonText.value = '复制全部'
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    showNotification('复制失败', 'error')
  }
}

// 导出结果
const exportResults = () => {
  const resultsText = computedHashResults.value.map(result => 
    `算法: ${result.label}\n哈希值: ${result.hash}\n长度: ${result.hexLength} 字符\n时间: ${result.time}ms\n`
  ).join('\n---\n\n')
  
  const blob = new Blob([resultsText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hash-results-${new Date().getTime()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  showNotification('结果已导出', 'success')
}

// 显示通知
const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// 监听自动计算
watch([inputType, selectedAlgorithm, outputFormat], () => {
  if (autoCalculate.value && canCalculate.value) {
    calculateHash()
  }
})

// 监听高级选项变化
watch([uppercaseOutput, showHashBytes], () => {
  if (computedHashResults.value.length > 0) {
    // 更新显示但不需要重新计算
    computedHashResults.value.forEach(result => {
      if (uppercaseOutput.value) {
        result.hash = result.hash.toUpperCase()
      } else {
        result.hash = result.hash.toLowerCase()
      }
    })
  }
})

// 生命周期
onMounted(() => {
  // 动态加载 CryptoJS
  if (typeof window !== 'undefined' && !window.CryptoJS) {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js'
    script.onload = () => {
      console.log('CryptoJS 已加载')
      showNotification('CryptoJS 已加载，支持20+种哈希算法', 'success')
    }
    script.onerror = () => {
      console.error('CryptoJS 加载失败')
      showNotification('CryptoJS 加载失败，部分功能可能无法使用', 'error')
    }
    document.head.appendChild(script)
  }
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<style scoped>
/* 基本样式保持之前的结构，新增部分样式 */
.hash-calculator {
  max-width: 1400px;
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
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}

.description {
  font-size: 1.1rem;
  color: #6c757d;
  max-width: 600px;
  margin: 0 auto;
}

.calculator-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 600px;
}

@media (min-width: 1200px) {
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

@media (min-width: 1200px) {
  .left-panel {
    flex: 0 0 40%;
    max-width: 40%;
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

@media (min-width: 1200px) {
  .right-panel {
    flex: 0 0 60%;
    max-width: 60%;
  }
}

/* 算法选择容器 */
.algorithm-select-container {
  position: relative;
}

.select-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

.select-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* 高级选项 */
.advanced-options {
  margin-top: 10px;
}

.advanced-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
}

.advanced-toggle:hover {
  background: #e9ecef;
  border-color: #ced4da;
}

.toggle-icon {
  width: 20px;
  height: 20px;
  fill: #6c757d;
  transition: transform 0.2s;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.advanced-content {
  padding: 16px;
  background: white;
  border: 1px solid #dee2e6;
  border-top: none;
  border-radius: 0 0 8px 8px;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.option-row {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #495057;
  cursor: pointer;
}

.option-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* 搜索结果区域 */
.algorithm-search {
  margin-top: 8px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* 结果区域样式调整 */
.results-section {
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

.results-section.has-results {
  border-color: #007bff;
  box-shadow: 0 2px 15px rgba(0, 123, 255, 0.1);
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f8f9fa;
}

.results-header h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0;
}

.results-actions {
  display: flex;
  gap: 8px;
}

.result-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  background: white;
  color: #495057;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.tab-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.tab-btn.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.result-display {
  flex: 1;
  overflow-y: auto;
}

.result-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hash-output {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.hash-value {
  flex: 1;
  font-size: 0.85rem;
  color: #e83e8c;
  line-height: 1.4;
  word-break: break-all;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
}

.copy-btn-sm {
  padding: 6px;
  background: transparent;
  border: none;
  color: #6c757d;
  flex: 0 0 auto;
}

.copy-btn-sm:hover {
  color: #007bff;
  background: #e9ecef;
  border-radius: 4px;
}

.icon-sm {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* 安全等级徽章 */
.security-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
}

.security-badge.high {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.security-badge.medium {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.security-badge.low {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* 算法卡片样式调整 */
.algorithm-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
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

.algorithm-desc {
  font-size: 0.85rem;
  color: #6c757d;
  line-height: 1.4;
  margin-bottom: 12px;
}

.algorithm-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
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

/* 其他原有样式保持不变... */
</style>
