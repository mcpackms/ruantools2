<template>
  <div class="video-converter">
    <div class="header">
      <h1>视频格式转换</h1>
      <p class="description">支持 MP4、WebM、MOV、AVI、MKV 等视频格式互相转换</p>
    </div>

    <div class="converter-container">
      <div class="left-panel">
        <div class="input-section">
          <div class="input-group">
            <label class="input-label">上传视频</label>
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
                accept="video/*"
                @change="handleFileSelect"
              />
              <div class="upload-content">
                <svg class="upload-icon" viewBox="0 0 24 24">
                  <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                </svg>
                <p v-if="!selectedFile">点击选择视频或拖放到此处</p>
                <p v-else>点击更换视频</p>
                <p class="format-hint">支持所有常见视频格式</p>
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
              <span class="info-label">视频时长</span>
              <span class="info-value">{{ formatDuration(duration) }}</span>
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

          <div class="input-group">
            <label class="input-label">转换选项</label>
            <div class="options-container">
              <label class="checkbox-label">
                <input type="checkbox" v-model="keepAudio" />
                <span>保留音频</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="keepVideo" />
                <span>保留视频</span>
              </label>
            </div>
          </div>

          <div v-if="isConverting" class="progress-container">
            <div class="progress-info">
              <span class="progress-label">{{ progressText }}</span>
              <span class="progress-percent">{{ progress }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
          </div>

          <div class="button-group">
            <button 
              class="btn btn-primary" 
              @click="convertVideo"
              :disabled="!selectedFile || isConverting || !ffmpegLoaded"
            >
              <svg v-if="isConverting" class="spinner" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
              </svg>
              <span v-else-if="!ffmpegLoaded">加载中...</span>
              <span v-else>开始转换</span>
            </button>
            <button 
              class="btn btn-outline" 
              @click="clearAll"
              :disabled="!selectedFile || isConverting"
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
              @click="downloadVideo"
              title="下载视频"
            >
              <svg class="icon" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
            </button>
          </div>

          <div v-if="convertedUrl" class="result-content">
            <div class="preview-container">
              <video :src="convertedUrl" class="preview-video" controls></video>
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
                <div class="stat-label">输出格式</div>
                <div class="stat-value format-badge">{{ outputFormatExt.toUpperCase() }}</div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24">
              <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
            </svg>
            <p>转换结果将显示在这里</p>
            <p class="empty-hint">上传视频后点击"开始转换"</p>
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
          <div class="warning-note">
            <svg class="warning-icon" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <span>视频转换需要加载 FFmpeg.wasm，首次加载可能较慢，请耐心等待</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'

const fileInput = ref(null)
const selectedFile = ref(null)
const convertedUrl = ref('')
const originalFormat = ref('')
const duration = ref(0)
const convertedSize = ref(0)
const outputFormat = ref('video/mp4')
const isConverting = ref(false)
const progress = ref(0)
const progressText = ref('准备中...')
const ffmpegLoaded = ref(false)
const notification = ref({ show: false, message: '', type: 'success' })
const keepAudio = ref(true)
const keepVideo = ref(true)

let ffmpeg = null

const formats = [
  { value: 'video/mp4', label: 'MP4', ext: 'mp4', desc: '最通用格式' },
  { value: 'video/webm', label: 'WebM', ext: 'webm', desc: 'Web 专用' },
  { value: 'video/x-matroska', label: 'MKV', ext: 'mkv', desc: '高清封装' },
  { value: 'video/avi', label: 'AVI', ext: 'avi', desc: '传统格式' },
  { value: 'video/quicktime', label: 'MOV', ext: 'mov', desc: '苹果格式' }
]

const outputFormatExt = computed(() => {
  const fmt = formats.find(f => f.value === outputFormat.value)
  return fmt ? fmt.ext : 'mp4'
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
  if (file && file.type.startsWith('video/')) {
    handleFile(file)
  } else {
    showNotification('请上传视频文件', 'error')
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
  originalFormat.value = ext
  
  const video = document.createElement('video')
  video.preload = 'metadata'
  video.onloadedmetadata = () => {
    duration.value = video.duration
    URL.revokeObjectURL(video.src)
  }
  video.src = URL.createObjectURL(file)
  
  convertedUrl.value = ''
  convertedSize.value = 0
}

const clearAll = () => {
  if (convertedUrl.value) {
    URL.revokeObjectURL(convertedUrl.value)
  }
  
  selectedFile.value = null
  convertedUrl.value = ''
  originalFormat.value = ''
  duration.value = 0
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

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const loadFFmpeg = async () => {
  try {
    if (window.FFmpeg) {
      ffmpeg = new window.FFmpeg()
    } else {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js'
      document.head.appendChild(script)
      
      await new Promise((resolve, reject) => {
        script.onload = resolve
        script.onerror = reject
      })
      
      ffmpeg = new window.FFmpeg()
    }
    
    ffmpeg.on('progress', ({ progress: p }) => {
      progress.value = Math.round(p * 100)
      progressText.value = '转换中...'
    })
    
    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg:', message)
    })
    
    progressText.value = '加载 FFmpeg...'
    await ffmpeg.load({
      coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
      wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm'
    })
    
    ffmpegLoaded.value = true
    showNotification('FFmpeg 加载完成', 'success')
  } catch (error) {
    console.error('FFmpeg 加载失败:', error)
    showNotification('FFmpeg 加载失败，请刷新页面重试', 'error')
  }
}

const convertVideo = async () => {
  if (!selectedFile.value) return
  
  if (!ffmpegLoaded.value) {
    showNotification('FFmpeg 正在加载中，请稍候', 'error')
    return
  }
  
  isConverting.value = true
  progress.value = 0
  progressText.value = '准备转换...'
  
  if (convertedUrl.value) {
    URL.revokeObjectURL(convertedUrl.value)
  }
  
  try {
    const fetchFile = (file) => {
      return new Uint8Array(file.arrayBuffer())
    }
    
    const inputName = 'input' + getExt(selectedFile.value.name)
    const outputName = 'output.' + outputFormatExt.value
    
    progressText.value = '读取视频...'
    await ffmpeg.writeFile(inputName, await fetchFile(selectedFile.value))
    
    const args = ['-i', inputName]
    
    if (!keepAudio.value) {
      args.push('-an')
    }
    
    if (!keepVideo.value) {
      args.push('-vn')
    }
    
    if (outputFormat.value === 'video/mp4') {
      args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '23')
    } else if (outputFormat.value === 'video/webm') {
      args.push('-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0')
    }
    
    args.push('-y', outputName)
    
    progressText.value = '转换中...'
    await ffmpeg.exec(args)
    
    progressText.value = '生成视频...'
    const data = await ffmpeg.readFile(outputName)
    const blob = new Blob([data.buffer], { type: outputFormat.value })
    
    convertedSize.value = blob.size
    convertedUrl.value = URL.createObjectURL(blob)
    
    await ffmpeg.deleteFile(inputName)
    await ffmpeg.deleteFile(outputName)
    
    progress.value = 100
    showNotification('视频转换完成', 'success')
  } catch (error) {
    console.error('转换失败:', error)
    showNotification('转换失败: ' + error.message, 'error')
  } finally {
    isConverting.value = false
  }
}

const getExt = (filename) => {
  const parts = filename.split('.')
  return parts.length > 1 ? '.' + parts.pop() : ''
}

const downloadVideo = () => {
  if (!convertedUrl.value || !selectedFile.value) return
  
  const link = document.createElement('a')
  link.href = convertedUrl.value
  
  const baseName = selectedFile.value.name.replace(/\.[^.]+$/, '')
  link.download = `${baseName}.${outputFormatExt.value}`
  
  link.click()
  showNotification('视频已开始下载', 'success')
}

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

onMounted(() => {
  loadFFmpeg()
})

onUnmounted(() => {
  if (convertedUrl.value) {
    URL.revokeObjectURL(convertedUrl.value)
  }
})
</script>

<style scoped>
.video-converter {
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

.options-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #495057;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.progress-container {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 0.85rem;
  color: #6c757d;
}

.progress-percent {
  font-size: 0.85rem;
  font-weight: 600;
  color: #007bff;
}

.progress-bar {
  height: 8px;
  background: #dee2e6;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border-radius: 4px;
  transition: width 0.3s ease;
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
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.preview-video {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stats-container {
  display: flex;
  gap: 12px;
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
  font-size: 0.9rem;
  font-weight: 700;
  color: #495057;
}

.stat-value.format-badge {
  color: #007bff;
  background: #e6f7ff;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
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
  margin-bottom: 16px;
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

.warning-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #856404;
}

.warning-icon {
  width: 18px;
  height: 18px;
  fill: #ffc107;
  flex-shrink: 0;
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
