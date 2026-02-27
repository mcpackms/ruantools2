<template>
  <div class="image-compressor">
    <div class="header">
      <h1>图片压缩</h1>
      <p class="description">支持 JPG、PNG、GIF、WebP、BMP、AVIF 格式的在线图片压缩工具</p>
    </div>

    <div class="compressor-container">
      <div class="left-panel">
        <div class="input-section">
          <div class="input-group">
            <label class="input-label">上传图片</label>
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
                accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,image/avif"
                @change="handleFileSelect"
              />
              <div class="upload-content">
                <svg class="upload-icon" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                <p v-if="!selectedFile">点击选择图片或拖放到此处</p>
                <p v-else>点击更换图片</p>
                <p class="format-hint">支持 JPG、PNG、GIF、WebP、BMP、AVIF</p>
              </div>
            </div>
          </div>

          <div v-if="selectedFile" class="file-info-card">
            <div class="file-info-row">
              <span class="info-label">文件名</span>
              <span class="info-value">{{ selectedFile.name }}</span>
            </div>
            <div class="file-info-row">
              <span class="info-label">原始大小</span>
              <span class="info-value">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
            <div class="file-info-row">
              <span class="info-label">图片尺寸</span>
              <span class="info-value">{{ originalWidth }} × {{ originalHeight }}</span>
            </div>
            <div class="file-info-row">
              <span class="info-label">图片类型</span>
              <span class="info-value">{{ mimeType }}</span>
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">压缩质量: {{ quality }}%</label>
            <div class="quality-slider">
              <input
                type="range"
                v-model="quality"
                min="1"
                max="100"
                step="1"
                class="slider"
                @input="compressImage"
              />
              <div class="quality-labels">
                <span>低</span>
                <span>中</span>
                <span>高</span>
              </div>
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">输出格式</label>
            <div class="radio-group">
              <label 
                class="radio-label" 
                v-for="fmt in formats" 
                :key="fmt.value"
                :class="{ 'selected': outputFormat === fmt.value }"
              >
                <input 
                  type="radio" 
                  v-model="outputFormat" 
                  :value="fmt.value"
                  @change="compressImage"
                  hidden
                />
                <div class="radio-dot"></div>
                <span>{{ fmt.label }}</span>
              </label>
            </div>
          </div>

          <div class="button-group">
            <button 
              class="btn btn-primary" 
              @click="compressImage"
              :disabled="!selectedFile || isCompressing"
            >
              <svg v-if="isCompressing" class="spinner" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
              </svg>
              <span v-else>压缩图片</span>
            </button>
            <button 
              class="btn btn-outline" 
              @click="clearAll"
              :disabled="!selectedFile"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="result-section" :class="{ 'has-result': compressedUrl }">
          <div class="result-header">
            <h3>压缩结果</h3>
            <button 
              v-if="compressedUrl"
              class="btn btn-icon copy-btn" 
              @click="downloadImage"
              title="下载图片"
            >
              <svg class="icon" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
            </button>
          </div>

          <div v-if="compressedUrl" class="result-content">
            <div class="preview-container">
              <div class="preview-box">
                <div class="preview-label">原始图片</div>
                <img :src="originalPreviewUrl" class="preview-image" />
                <div class="preview-size">{{ formatFileSize(selectedFile?.size || 0) }}</div>
              </div>
              <div class="preview-arrow">
                <svg viewBox="0 0 24 24">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </div>
              <div class="preview-box">
                <div class="preview-label">压缩后</div>
                <img :src="compressedUrl" class="preview-image" />
                <div class="preview-size">{{ formatFileSize(compressedSize) }}</div>
              </div>
            </div>

            <div class="stats-container">
              <div class="stat-card">
                <div class="stat-label">压缩率</div>
                <div class="stat-value success">{{ compressionRate }}%</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">减少</div>
                <div class="stat-value">{{ formatFileSize(savedSize) }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">输出尺寸</div>
                <div class="stat-value">{{ compressedWidth }} × {{ compressedHeight }}</div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
            <p>压缩结果将显示在这里</p>
            <p class="empty-hint">上传图片后点击"压缩图片"</p>
          </div>
        </div>

        <div class="info-section">
          <h3>使用说明</h3>
          <div class="info-list">
            <div class="info-item">
              <span class="info-icon">1</span>
              <span>点击上传区域或拖拽图片到此处</span>
            </div>
            <div class="info-item">
              <span class="info-icon">2</span>
              <span>调整压缩质量滑块（1-100%）</span>
            </div>
            <div class="info-item">
              <span class="info-icon">3</span>
              <span>选择输出格式（可选）</span>
            </div>
            <div class="info-item">
              <span class="info-icon">4</span>
              <span>点击"压缩图片"按钮开始压缩</span>
            </div>
            <div class="info-item">
              <span class="info-icon">5</span>
              <span>预览压缩效果并下载</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="notification.show" class="notification" :class="notification.type">
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const fileInput = ref(null)
const selectedFile = ref(null)
const originalPreviewUrl = ref('')
const compressedUrl = ref('')
const originalWidth = ref(0)
const originalHeight = ref(0)
const compressedWidth = ref(0)
const compressedHeight = ref(0)
const compressedSize = ref(0)
const quality = ref(80)
const outputFormat = ref('image/jpeg')
const isCompressing = ref(false)
const notification = ref({ show: false, message: '', type: 'success' })

const formats = [
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/webp', label: 'WebP' },
  { value: 'image/gif', label: 'GIF' },
  { value: 'image/bmp', label: 'BMP' },
  { value: 'image/avif', label: 'AVIF' }
]

const mimeType = ref('')

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
  if (file && file.type.startsWith('image/')) {
    handleFile(file)
  } else {
    showNotification('请上传图片文件', 'error')
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    handleFile(file)
  }
}

const handleFile = (file) => {
  selectedFile.value = file
  
  const ext = file.name.split('.').pop().toLowerCase()
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'avif': 'image/avif'
  }
  mimeType.value = mimeTypes[ext] || file.type || 'image/jpeg'
  
  const url = URL.createObjectURL(file)
  originalPreviewUrl.value = url
  
  const img = new Image()
  img.onload = () => {
    originalWidth.value = img.width
    originalHeight.value = img.height
  }
  img.src = url
  
  compressedUrl.value = ''
  compressedSize.value = 0
}

const clearAll = () => {
  if (selectedFile.value) {
    URL.revokeObjectURL(originalPreviewUrl.value)
  }
  if (compressedUrl.value) {
    URL.revokeObjectURL(compressedUrl.value)
  }
  
  selectedFile.value = null
  originalPreviewUrl.value = ''
  compressedUrl.value = ''
  originalWidth.value = 0
  originalHeight.value = 0
  compressedWidth.value = 0
  compressedHeight.value = 0
  compressedSize.value = 0
  quality.value = 80
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const compressImage = () => {
  if (!selectedFile.value) return
  
  isCompressing.value = true
  
  if (compressedUrl.value) {
    URL.revokeObjectURL(compressedUrl.value)
  }
  
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    
    const outputMime = outputFormat.value === 'image/png' && selectedFile.value.type === 'image/png' 
      ? 'image/png' 
      : outputFormat.value
    
    const qualityValue = outputMime === 'image/png' ? 1 : quality.value / 100
    
    canvas.toBlob((blob) => {
      if (blob) {
        compressedWidth.value = img.width
        compressedHeight.value = img.height
        compressedSize.value = blob.size
        compressedUrl.value = URL.createObjectURL(blob)
        showNotification('图片压缩完成', 'success')
      } else {
        showNotification('压缩失败，请重试', 'error')
      }
      isCompressing.value = false
    }, outputMime, qualityValue)
  }
  
  img.onerror = () => {
    showNotification('图片加载失败', 'error')
    isCompressing.value = false
  }
  
  img.src = originalPreviewUrl.value
}

const downloadImage = () => {
  if (!compressedUrl.value || !selectedFile.value) return
  
  const link = document.createElement('a')
  link.href = compressedUrl.value
  
  const extMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/avif': 'avif'
  }
  const ext = extMap[outputFormat.value] || 'jpg'
  const baseName = selectedFile.value.name.replace(/\.[^.]+$/, '')
  link.download = `${baseName}_compressed.${ext}`
  
  link.click()
  showNotification('图片已开始下载', 'success')
}

const compressionRate = computed(() => {
  if (!selectedFile.value || !compressedSize.value) return 0
  return Math.round((1 - compressedSize.value / selectedFile.value.size) * 100)
})

const savedSize = computed(() => {
  if (!selectedFile.value || !compressedSize.value) return 0
  return Math.max(0, selectedFile.value.size - compressedSize.value)
})

import { computed } from 'vue'

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

onUnmounted(() => {
  if (originalPreviewUrl.value) {
    URL.revokeObjectURL(originalPreviewUrl.value)
  }
  if (compressedUrl.value) {
    URL.revokeObjectURL(compressedUrl.value)
  }
})
</script>

<style scoped>
.image-compressor {
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

.compressor-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 600px;
}

@media (min-width: 1024px) {
  .compressor-container {
    flex-direction: row;
    min-height: 600px;
  }
}

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

.format-hint {
  font-size: 0.8rem !important;
  color: #adb5bd !important;
  margin-top: 8px !important;
}

.file-info-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

.file-info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.file-info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #6c757d;
  font-size: 0.85rem;
}

.info-value {
  color: #495057;
  font-size: 0.85rem;
  font-weight: 600;
  word-break: break-all;
  text-align: right;
  max-width: 60%;
}

.quality-slider {
  padding: 0 8px;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #dee2e6;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: none;
}

.quality-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.75rem;
  color: #6c757d;
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

.radio-label.selected {
  background-color: #e6f7ff;
}

.radio-label .radio-dot {
  width: 18px;
  height: 18px;
  border: 2px solid #adb5bd;
  border-radius: 50%;
  position: relative;
}

.radio-label.selected .radio-dot {
  border-color: #007bff;
}

.radio-label.selected .radio-dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background-color: #007bff;
  border-radius: 50%;
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

.btn-outline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-container {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-height: 200px;
}

.preview-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.preview-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 600;
}

.preview-image {
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.preview-size {
  font-size: 0.85rem;
  color: #495057;
  font-weight: 600;
}

.preview-arrow {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  fill: #6c757d;
}

.stats-container {
  display: flex;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.stat-card {
  flex: 1;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: #495057;
}

.stat-value.success {
  color: #28a745;
}

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

.info-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.info-section h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.info-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.info-item span:last-child {
  font-size: 0.9rem;
  color: #495057;
}

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
