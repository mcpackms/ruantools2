<!-- src/components/TimestampConverter.vue -->
<template>
  <div class="timestamp-converter">
    <!-- 当前时间显示 -->
    <div class="current-time-display">
      <div class="time-cards">
        <div class="time-card">
          <div class="time-label">当前时间戳（秒）</div>
          <div class="time-value mono">{{ currentSeconds }}</div>
        </div>
        <div class="time-card">
          <div class="time-label">当前时间戳（毫秒）</div>
          <div class="time-value mono">{{ currentMilliseconds }}</div>
        </div>
        <div class="time-card">
          <div class="time-label">当前时间</div>
          <div class="time-value mono">{{ currentTime }}</div>
        </div>
      </div>
    </div>

    <!-- 时间戳转日期 -->
    <div class="converter-section">
      <div class="section-header">
        <div class="icon">📅</div>
        <h2>时间戳 → 日期时间</h2>
      </div>

      <div class="input-group">
        <label for="timestamp-input">输入时间戳</label>
        <input
          id="timestamp-input"
          v-model="timestampInput"
          type="text"
          placeholder="例如：1704067200 或 1704067200000"
          class="input-field mono"
          @keyup.enter="convertTimestamp"
        >
      </div>

      <div class="options-row">
        <div class="option-group">
          <div class="option-label">时间戳单位</div>
          <div class="radio-buttons">
            <label class="radio-label">
              <input
                v-model="timestampUnit"
                type="radio"
                value="seconds"
                class="radio-input"
              >
              <span class="radio-text">秒 (10位)</span>
            </label>
            <label class="radio-label">
              <input
                v-model="timestampUnit"
                type="radio"
                value="milliseconds"
                class="radio-input"
              >
              <span class="radio-text">毫秒 (13位)</span>
            </label>
          </div>
        </div>

        <div class="option-group">
          <label for="date-format" class="option-label">输出格式</label>
          <select
            id="date-format"
            v-model="dateFormat"
            class="select-field"
          >
            <option value="local">本地格式 (YYYY-MM-DD HH:mm:ss)</option>
            <option value="iso">ISO 8601 格式</option>
            <option value="date">仅日期</option>
            <option value="time">仅时间</option>
            <option value="rfc">RFC 2822 格式</option>
          </select>
        </div>
      </div>

      <div class="button-group">
        <button
          class="btn btn-primary"
          @click="convertTimestamp"
        >
          <span class="btn-icon">🔄</span>
          转换为日期
        </button>
        <button
          class="btn btn-secondary"
          @click="useCurrentTimestamp"
        >
          <span class="btn-icon">⏰</span>
          使用当前时间戳
        </button>
        <button
          class="btn btn-outline"
          @click="copyTimestampResult"
          :disabled="!timestampResult.success"
        >
          <span class="btn-icon">📋</span>
          复制结果
        </button>
      </div>

      <div
        v-if="timestampResult.message"
        class="result-display"
        :class="{ error: !timestampResult.success }"
      >
        <div class="result-header">
          <div class="result-icon">
            {{ timestampResult.success ? '✅' : '❌' }}
          </div>
          <h3>{{ timestampResult.success ? '转换结果' : '错误' }}</h3>
        </div>
        <div class="result-content">
          <pre class="result-code mono">{{ timestampResult.message }}</pre>
        </div>
      </div>
    </div>

    <!-- 日期转时间戳 -->
    <div class="converter-section">
      <div class="section-header">
        <div class="icon">⏱️</div>
        <h2>日期时间 → 时间戳</h2>
      </div>

      <div class="input-group">
        <label for="date-input">输入日期时间</label>
        <input
          id="date-input"
          v-model="dateInput"
          type="text"
          placeholder="例如：2024-01-01 或 2024-01-01 12:00:00"
          class="input-field mono"
          @keyup.enter="convertDate"
        >
      </div>

      <div class="options-row">
        <div class="option-group">
          <div class="option-label">输出时间戳单位</div>
          <div class="radio-buttons">
            <label class="radio-label">
              <input
                v-model="outputUnit"
                type="radio"
                value="seconds"
                class="radio-input"
              >
              <span class="radio-text">秒 (10位)</span>
            </label>
            <label class="radio-label">
              <input
                v-model="outputUnit"
                type="radio"
                value="milliseconds"
                class="radio-input"
              >
              <span class="radio-text">毫秒 (13位)</span>
            </label>
          </div>
        </div>
      </div>

      <div class="button-group">
        <button
          class="btn btn-primary"
          @click="convertDate"
        >
          <span class="btn-icon">🔄</span>
          转换为时间戳
        </button>
        <button
          class="btn btn-secondary"
          @click="useCurrentDate"
        >
          <span class="btn-icon">⏰</span>
          使用当前时间
        </button>
        <button
          class="btn btn-outline"
          @click="copyDateResult"
          :disabled="!dateResult.success"
        >
          <span class="btn-icon">📋</span>
          复制结果
        </button>
      </div>

      <div
        v-if="dateResult.message"
        class="result-display"
        :class="{ error: !dateResult.success }"
      >
        <div class="result-header">
          <div class="result-icon">
            {{ dateResult.success ? '✅' : '❌' }}
          </div>
          <h3>{{ dateResult.success ? '转换结果' : '错误' }}</h3>
        </div>
        <div class="result-content">
          <pre class="result-code mono">{{ dateResult.message }}</pre>
        </div>
      </div>
    </div>

    <!-- 批量转换 -->
    <div class="converter-section">
      <div class="section-header">
        <div class="icon">📊</div>
        <h2>批量转换</h2>
      </div>

      <div class="input-group">
        <label for="batch-input">批量输入（每行一个时间戳或日期）</label>
        <textarea
          id="batch-input"
          v-model="batchInput"
          placeholder="每行一个时间戳或日期，例如：&#10;1704067200&#10;2024-01-01&#10;1704067200000"
          class="textarea-field mono"
          rows="5"
        ></textarea>
      </div>

      <div class="button-group">
        <button
          class="btn btn-primary"
          @click="batchConvert"
        >
          <span class="btn-icon">⚡</span>
          批量转换
        </button>
        <button
          class="btn btn-outline"
          @click="clearBatch"
        >
          <span class="btn-icon">🗑️</span>
          清空
        </button>
        <button
          class="btn btn-outline"
          @click="copyBatchResult"
          :disabled="!batchResult.message"
        >
          <span class="btn-icon">📋</span>
          复制结果
        </button>
      </div>

      <div
        v-if="batchResult.message"
        class="result-display"
      >
        <div class="result-header">
          <div class="result-icon">📄</div>
          <h3>批量转换结果</h3>
        </div>
        <div class="result-content">
          <pre class="result-code mono">{{ batchResult.message }}</pre>
        </div>
      </div>
    </div>

    <!-- 常见时间戳参考 -->
    <div class="reference-section">
      <h3 class="reference-title">常见时间戳参考</h3>
      <div class="reference-grid">
        <div
          v-for="(ref, index) in timestampReferences"
          :key="index"
          class="reference-item"
          @click="fillReference(ref)"
        >
          <div class="ref-time">{{ ref.timestamp }}</div>
          <div class="ref-desc">{{ ref.description }}</div>
          <div class="ref-date">{{ ref.date }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 响应式数据
const timestampInput = ref('')
const dateInput = ref('')
const batchInput = ref('')
const timestampUnit = ref('seconds')
const dateFormat = ref('local')
const outputUnit = ref('seconds')
const currentSeconds = ref('')
const currentMilliseconds = ref('')
const currentTime = ref('')
let timeInterval = null

// 结果对象
const timestampResult = ref({ success: false, message: '' })
const dateResult = ref({ success: false, message: '' })
const batchResult = ref({ message: '' })

// 常见时间戳参考
const timestampReferences = [
  { timestamp: '0', description: 'Unix 纪元起点', date: '1970-01-01 00:00:00 UTC' },
  { timestamp: '946684800', description: '21 世纪开始', date: '2000-01-01 00:00:00 UTC' },
  { timestamp: '1609459200', description: '2021 年开始', date: '2021-01-01 00:00:00 UTC' },
  { timestamp: '1704067200', description: '2024 年开始', date: '2024-01-01 00:00:00 UTC' },
  { timestamp: '1711929600', description: '2024-04-01', date: '2024-04-01 00:00:00 UTC' },
  { timestamp: '1727740800', description: '2024-10-01', date: '2024-10-01 00:00:00 UTC' },
]

// 更新时间函数
const updateCurrentTime = () => {
  const now = new Date()
  currentSeconds.value = Math.floor(now.getTime() / 1000)
  currentMilliseconds.value = now.getTime()
  
  currentTime.value = formatDate(now, 'local')
}

// 格式化日期
const formatDate = (date, format) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  switch(format) {
    case 'iso':
      return date.toISOString()
    case 'date':
      return `${year}-${month}-${day}`
    case 'time':
      return `${hours}:${minutes}:${seconds}`
    case 'rfc':
      return date.toUTCString()
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
}

// 时间戳转日期
const convertTimestamp = () => {
  const input = timestampInput.value.trim()
  
  if (!input) {
    timestampResult.value = {
      success: false,
      message: '错误：请输入时间戳'
    }
    return
  }
  
  if (!/^\d+$/.test(input)) {
    timestampResult.value = {
      success: false,
      message: '错误：时间戳必须为纯数字'
    }
    return
  }
  
  try {
    let timestamp = parseInt(input, 10)
    
    // 自动检测单位
    if (timestampUnit.value === 'seconds' && input.length === 13) {
      timestamp = Math.floor(timestamp / 1000)
    } else if (timestampUnit.value === 'milliseconds' && input.length === 10) {
      timestamp = timestamp * 1000
    }
    
    const date = timestampUnit.value === 'seconds' 
      ? new Date(timestamp * 1000)
      : new Date(timestamp)
    
    if (isNaN(date.getTime())) {
      timestampResult.value = {
        success: false,
        message: '错误：无效的时间戳'
      }
      return
    }
    
    const formattedDate = formatDate(date, dateFormat.value)
    const utcDate = date.toUTCString()
    const isoDate = date.toISOString()
    const localDate = date.toLocaleString('zh-CN')
    
    timestampResult.value = {
      success: true,
      message: `输入时间戳: ${input} (${timestampUnit.value})\n` +
               `本地时间: ${localDate}\n` +
               `格式化结果: ${formattedDate}\n` +
               `UTC 时间: ${utcDate}\n` +
               `ISO 8601: ${isoDate}\n` +
               `时间戳（秒）: ${Math.floor(date.getTime() / 1000)}\n` +
               `时间戳（毫秒）: ${date.getTime()}`
    }
  } catch (error) {
    timestampResult.value = {
      success: false,
      message: `错误：${error.message}`
    }
  }
}

// 使用当前时间戳
const useCurrentTimestamp = () => {
  const timestamp = timestampUnit.value === 'seconds' 
    ? Math.floor(Date.now() / 1000)
    : Date.now()
  timestampInput.value = timestamp.toString()
  convertTimestamp()
}

// 日期转时间戳
const convertDate = () => {
  const input = dateInput.value.trim()
  
  if (!input) {
    dateResult.value = {
      success: false,
      message: '错误：请输入日期时间'
    }
    return
  }
  
  try {
    let date
    
    // 尝试解析不同的日期格式
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(input)) {
      // YYYY-MM-DD
      date = new Date(input + 'T00:00:00')
    } else if (/^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/.test(input)) {
      // YYYY-MM-DD HH:mm:ss
      date = new Date(input.replace(' ', 'T'))
    } else if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(input)) {
      // YYYY/MM/DD
      date = new Date(input.replace(/\//g, '-') + 'T00:00:00')
    } else if (/^\d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/.test(input)) {
      // YYYY/MM/DD HH:mm:ss
      date = new Date(input.replace(/\//g, '-').replace(' ', 'T'))
    } else {
      // 尝试自动解析
      date = new Date(input)
    }
    
    if (isNaN(date.getTime())) {
      dateResult.value = {
        success: false,
        message: '错误：无法识别的日期格式\n支持的格式：\n' +
                 'YYYY-MM-DD\n' +
                 'YYYY-MM-DD HH:mm:ss\n' +
                 'YYYY/MM/DD\n' +
                 'YYYY/MM/DD HH:mm:ss\n' +
                 'ISO 8601 格式'
      }
      return
    }
    
    const seconds = Math.floor(date.getTime() / 1000)
    const milliseconds = date.getTime()
    const result = outputUnit.value === 'seconds' ? seconds : milliseconds
    
    dateResult.value = {
      success: true,
      message: `输入日期: ${input}\n` +
               `解析结果: ${date.toLocaleString('zh-CN')}\n` +
               `时间戳（秒）: ${seconds}\n` +
               `时间戳（毫秒）: ${milliseconds}\n` +
               `UTC 时间: ${date.toUTCString()}\n` +
               `ISO 8601: ${date.toISOString()}\n` +
               `输出结果 (${outputUnit.value}): ${result}`
    }
  } catch (error) {
    dateResult.value = {
      success: false,
      message: `错误：${error.message}`
    }
  }
}

// 使用当前日期
const useCurrentDate = () => {
  const now = new Date()
  dateInput.value = formatDate(now, 'local')
  convertDate()
}

// 批量转换
const batchConvert = () => {
  const input = batchInput.value.trim()
  
  if (!input) {
    batchResult.value = {
      message: '错误：请输入要转换的内容'
    }
    return
  }
  
  const lines = input.split('\n').filter(line => line.trim() !== '')
  let results = []
  
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    
    if (/^\d+$/.test(trimmed)) {
      // 时间戳转日期
      const isMs = trimmed.length === 13
      const timestamp = parseInt(trimmed, 10)
      const date = isMs ? new Date(timestamp) : new Date(timestamp * 1000)
      
      if (!isNaN(date.getTime())) {
        const formatted = date.toLocaleString('zh-CN')
        results.push(`#${index + 1}: ${trimmed} (${isMs ? '毫秒' : '秒'}) → ${formatted}`)
      } else {
        results.push(`#${index + 1}: ${trimmed} → 无效的时间戳`)
      }
    } else {
      // 日期转时间戳
      const date = new Date(trimmed)
      if (!isNaN(date.getTime())) {
        const seconds = Math.floor(date.getTime() / 1000)
        const milliseconds = date.getTime()
        results.push(`#${index + 1}: ${trimmed} → 秒: ${seconds}, 毫秒: ${milliseconds}`)
      } else {
        results.push(`#${index + 1}: ${trimmed} → 无法识别的日期格式`)
      }
    }
  })
  
  batchResult.value = {
    message: results.join('\n')
  }
}

// 清空批量输入
const clearBatch = () => {
  batchInput.value = ''
  batchResult.value = { message: '' }
}

// 填充参考值
const fillReference = (ref) => {
  timestampInput.value = ref.timestamp
  convertTimestamp()
}

// 复制功能
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制')
  }
}

const copyTimestampResult = () => {
  if (timestampResult.value.success) {
    copyToClipboard(timestampResult.value.message)
  }
}

const copyDateResult = () => {
  if (dateResult.value.success) {
    copyToClipboard(dateResult.value.message)
  }
}

const copyBatchResult = () => {
  if (batchResult.value.message) {
    copyToClipboard(batchResult.value.message)
  }
}

// 生命周期钩子
onMounted(() => {
  updateCurrentTime()
  timeInterval = setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.timestamp-converter {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 当前时间显示 */
.current-time-display {
  margin-bottom: 2rem;
}

.time-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.time-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.time-card:hover {
  transform: translateY(-2px);
}

.time-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.time-value {
  font-size: 1.25rem;
  font-weight: 600;
}

/* 转换器部分 */
.converter-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-header .icon {
  font-size: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* 输入组 */
.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.input-field,
.textarea-field,
.select-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.input-field:focus,
.textarea-field:focus,
.select-field:focus {
  outline: none;
  border-color: #6366f1;
  background: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.textarea-field {
  min-height: 120px;
  resize: vertical;
}

.mono {
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
}

/* 选项行 */
.options-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.radio-buttons {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.radio-input {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.radio-text {
  font-size: 0.875rem;
  color: #4b5563;
}

/* 按钮组 */
.button-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-secondary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-outline {
  background: white;
  color: #4b5563;
  border: 2px solid #e5e7eb;
}

.btn-outline:hover:not(:disabled) {
  border-color: #9ca3af;
  background: #f9fafb;
}

/* 结果展示 */
.result-display {
  border-radius: 12px;
  overflow: hidden;
  animation: slideDown 0.3s ease;
}

.result-display.error {
  border: 2px solid #f87171;
  background: #fef2f2;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #f3f4f6;
}

.result-display.error .result-header {
  background: #fef2f2;
}

.result-icon {
  font-size: 1.25rem;
}

.result-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.result-display.error .result-header h3 {
  color: #dc2626;
}

.result-content {
  padding: 1.5rem;
  background: white;
}

.result-display.error .result-content {
  background: #fef2f2;
}

.result-code {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #1f2937;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.result-display.error .result-code {
  color: #dc2626;
}

/* 参考部分 */
.reference-section {
  margin-top: 2rem;
}

.reference-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.reference-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.reference-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reference-item:hover {
  transform: translateY(-2px);
  border-color: #6366f1;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.1);
}

.ref-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  color: #6366f1;
  margin-bottom: 0.25rem;
}

.ref-desc {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.ref-date {
  font-size: 0.75rem;
  color: #6b7280;
}

/* 动画 */
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

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  .converter-section,
  .reference-item {
    background: #1f2937;
    border-color: #374151;
  }

  .section-header h2,
  .reference-title {
    color: #f9fafb;
  }

  .input-group label,
  .option-label {
    color: #d1d5db;
  }

  .input-field,
  .textarea-field,
  .select-field {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .input-field:focus,
  .textarea-field:focus,
  .select-field:focus {
    background: #374151;
    border-color: #6366f1;
  }

  .radio-text {
    color: #d1d5db;
  }

  .btn-outline {
    background: #1f2937;
    color: #d1d5db;
    border-color: #4b5563;
  }

  .btn-outline:hover:not(:disabled) {
    background: #374151;
  }

  .result-header {
    background: #374151;
  }

  .result-content {
    background: #1f2937;
  }

  .result-code {
    color: #d1d5db;
  }

  .ref-desc {
    color: #f9fafb;
  }

  .ref-date {
    color: #9ca3af;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .time-cards {
    grid-template-columns: 1fr;
  }

  .options-row {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .button-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .reference-grid {
    grid-template-columns: 1fr;
  }
}
</style>
