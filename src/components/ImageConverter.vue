<template>
  <div class="image-converter">
    <div class="header">
      <h1>图片格式转换</h1>
      <p class="description">支持 JPG、PNG、GIF、WebP、BMP、SVG 等图片格式互转</p>
    </div>

    <div class="converter-container">
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
                accept="image/*"
                @change="handleFileSelect"
              />
              <div class="upload-content">
                <svg class="upload-icon" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                <p v-if="!selectedFile">点击选择图片或拖放到此处</p>
                <p v-else>点击更换图片</p>
                <p class="format-hint">支持所有常见图片格式</p>
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
              <span class="info-label">原始格式</span>
              <span class="info-value">{{ originalFormat.toUpperCase() }}</span>
            </div>
            <div class="file-info-row">
              <span class="info-label">图片尺寸</span>
              <span class="info-value">{{ originalWidth }} × {{ originalHeight }}</span>
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">目标格式</label>
            <div class="format-grid">
              <label 
                class="format-option" 
                v-for="fmt in formats" 
                :key="fmt.value"
                :class="{ 'selected': outputFormat === fmt.value }"
              >
                <input 
                  type="radio" 
                  v-model="outputFormat" 
                  :value="fmt.value"
                  hidden
                />
                <span class="format-name">{{ fmt.label }}</span>
                <span class="format-ext">.{{ fmt.ext }}</span>
              </label>
            </div>
          </div>

          <div class="button-group">
            <button 
              class="btn btn-primary" 
              @click="convertImage"
              :disabled="!selectedFile || isConverting"
            >
              <svg v-if="isConverting" class="spinner" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
              </svg>
              <span v-else>转换格式</span>
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
        <div class="result-section" :class="{ 'has-result': convertedUrl }">
          <div class="result-header">
            <h3>转换结果</h3>
            <button 
              v-if="convertedUrl"
              class="btn btn-icon copy-btn" 
              @click="downloadImage"
              title="下载图片"
            >
              <svg class="icon" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
            </button>
          </div>

          <div v-if="convertedUrl" class="result-content">
            <div class="preview-container">
              <div class="preview-box">
                <div class="preview-label">原始图片</div>
                <img :src="originalPreviewUrl" class="preview-image" />
                <div class="preview-size">{{ formatFileSize(selectedFile?.size || 0) }}</div>
                <div class="preview-format">{{ originalFormat.toUpperCase() }}</div>
              </div>
              <div class="preview-arrow">
                <svg viewBox="0 0 24 24">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </div>
              <div class="preview-box">
                <div class="preview-label">转换后</div>
                <img :src="convertedUrl" class="preview-image" />
                <div class="preview-size">{{ formatFileSize(convertedSize) }}</div>
                <div class="preview-format">{{ outputFormat.toUpperCase() }}</div>
              </div>
            </div>

            <div class="stats-container">
              <div class="stat-card">
                <div class="stat-label">原始大小</div>
                <div class="stat-value">{{ formatFileSize(selectedFile?.size || 0) }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">转换后大小</div>
                <div class="stat-value">{{ formatFileSize(convertedSize) }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">大小变化</div>
                <div class="stat-value" :class="sizeChange >= 0 ? 'success' : 'error'">
                  {{ sizeChange >= 0 ? '+' : '' }}{{ formatFileSize(Math.abs(sizeChange)) }}
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
            <p>转换结果将显示在这里</p>
            <p class="empty-hint">上传图片后点击"转换格式"</p>
          </div>
        </div>

        <div class="info-section">
          <h3>支持的格式</h3>
          <div class="format-info-grid">
            <div class="format-info-item" v-for="fmt in formats" :key="fmt.value">
              <span class="format-info-name">{{ fmt.label }}</span>
              <span class="format-info-ext">.{{ fmt.ext }}</span>
              <span class="format-info-desc">{{ fmt.desc }}</span>
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
import { ref, computed, onUnmounted } from 'vue'

const fileInput = ref(null)
const selectedFile = ref(null)
const originalPreviewUrl = ref('')
const convertedUrl = ref('')
const originalWidth = ref(0)
const originalHeight = ref(0)
const originalFormat = ref('')
const convertedSize = ref(0)
const outputFormat = ref('image/png')
const isConverting = ref(false)
const notification = ref({ show: false, message: '', type: 'success' })

const formats = [
  { value: 'image/png', label: 'PNG', ext: 'png', desc: '无损压缩，支持透明' },
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg', desc: '有损压缩，体积小' },
  { value: 'image/webp', label: 'WebP', ext: 'webp', desc: '现代格式，效果好' },
  { value: 'image/gif', label: 'GIF', ext: 'gif', desc: '动图支持' },
  { value: 'image/bmp', label: 'BMP', ext: 'bmp', desc: '位图格式，无压缩' },
  { value: 'image/svg+xml', label: 'SVG', ext: 'svg', desc: '矢量图形，可缩放' }
]

const sizeChange = computed(() => {
  if (!selectedFile.value || !convertedSize.value) return 0
  return convertedSize.value - selectedFile.value.size
})

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
    'svg': 'image/svg+xml'
  }
  originalFormat.value = mimeTypes[ext] || file.type.split('/')[1] || 'unknown'
  
  const url = URL.createObjectURL(file)
  originalPreviewUrl.value = url
  
  const img = new Image()
  img.onload = () => {
    originalWidth.value = img.width
    originalHeight.value = img.height
  }
  img.src = url
  
  convertedUrl.value = ''
  convertedSize.value = 0
}

const clearAll = () => {
  if (selectedFile.value) {
    URL.revokeObjectURL(originalPreviewUrl.value)
  }
  if (convertedUrl.value) {
    URL.revokeObjectURL(convertedUrl.value)
  }
  
  selectedFile.value = null
  originalPreviewUrl.value = ''
  convertedUrl.value = ''
  originalWidth.value = 0
  originalHeight.value = 0
  originalFormat.value = ''
  convertedSize.value = 0
  
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

const convertImage = () => {
  if (!selectedFile.value) return
  
  isConverting.value = true
  
  if (convertedUrl.value) {
    URL.revokeObjectURL(convertedUrl.value)
  }
  
  if (outputFormat.value === 'image/svg+xml') {
    convertToSvg()
    return
  }
  
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    
    const ctx = canvas.getContext('2d')
    
    if (outputFormat.value === 'image/png' && hasTransparency(img)) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    
    ctx.drawImage(img, 0, 0)
    
    const quality = outputFormat.value === 'image/jpeg' ? 0.92 : 1
    
    canvas.toBlob((blob) => {
      if (blob) {
        convertedSize.value = blob.size
        convertedUrl.value = URL.createObjectURL(blob)
        showNotification('图片转换完成', 'success')
      } else {
        showNotification('转换失败，请重试', 'error')
      }
      isConverting.value = false
    }, outputFormat.value, quality)
  }
  
  img.onerror = () => {
    showNotification('图片加载失败', 'error')
    isConverting.value = false
  }
  
  img.src = originalPreviewUrl.value
}

const convertToSvg = () => {
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    
    const dataUrl = canvas.toDataURL('image/png')
    
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}">
  <image href="${dataUrl}" width="${img.width}" height="${img.height}"/>
</svg>`
    
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    
    convertedSize.value = blob.size
    convertedUrl.value = url
    showNotification('图片转换完成', 'success')
    isConverting.value = false
  }
  
  img.onerror = () => {
    showNotification('图片加载失败', 'error')
    isConverting.value = false
  }
  
  img.src = originalPreviewUrl.value
}

const hasTransparency = (img) => {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const data = ctx.getImageData(0, 0, 1, 1).data
  return data[3] < 255
}

const downloadImage = () => {
  if (!convertedUrl.value || !selectedFile.value) return
  
  const link = document.createElement('a')
  link.href = convertedUrl.value
  
  const extMap = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/svg+xml': 'svg'
  }
  const ext = extMap[outputFormat.value] || 'png'
  const baseName = selectedFile.value.name.replace(/\.[^.]+$/, '')
  link.download = `${baseName}.${ext}`
  
  link.click()
  showNotification('图片已开始下载', 'success')
}

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
  if (convertedUrl.value) {
    URL.revokeObjectURL(convertedUrl.value)
  }
})
</script>

<style scoped>
.image-converter {
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

.converter-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 600px;
}

@media (min-width: 1024px) {
  .converter-container {
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

.format-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.format-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.format-option:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.format-option.selected {
  border-color: #007bff;
  background: #e6f7ff;
}

.format-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
}

.format-ext {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 2px;
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

.preview-format {
  font-size: 0.75rem;
  color: #007bff;
  font-weight: 600;
  background: #e6f7ff;
  padding: 2px 8px;
  border-radius: 4px;
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

.stat-value.error {
  color: #dc3545;
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

.format-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.format-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
}

.format-info-name {
  font-weight: 600;
  color: #495057;
  font-size: 0.85rem;
}

.format-info-ext {
  color: #007bff;
  font-size: 0.75rem;
  font-weight: 600;
}

.format-info-desc {
  color: #6c757d;
  font-size: 0.7rem;
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
