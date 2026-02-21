<template>
  <article class="app-card">
    <div class="app-header">
      <h2 class="app-name">{{ app.name }}</h2>
      <span class="app-version">{{ app.version }}</span>
    </div>
    
    <p class="app-author">作者: {{ app.author }}</p>
    
    <div class="app-description" v-html="app.description"></div>
    
    <div class="app-download">
      <a 
        class="download-btn" 
        :href="app.downloadUrl" 
        :title="`下载 ${app.name} ${app.version}`"
        @click="handleDownload"
      >
        <i class="fas fa-download"></i> {{ app.downloadText }}
      </a>
      
      <div class="file-hash">
        <strong>SHA256:</strong>
        <code class="hash-code">{{ app.sha256 }}</code>
        <button 
          v-if="showCopyButton" 
          class="copy-btn" 
          @click="copyHash"
          :title="`复制SHA256哈希值`"
        >
          <i class="fas fa-copy"></i>
        </button>
      </div>
      
      <div v-if="copyStatus" class="copy-status">
        {{ copyStatus }}
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  app: {
    type: Object,
    required: true
  },
  showCopyButton: {
    type: Boolean,
    default: true
  }
})

const copyStatus = ref('')

const handleDownload = (event) => {
  console.log(`开始下载: ${props.app.name} ${props.app.version}`)
  // 这里可以添加下载统计或其他逻辑
}

const copyHash = async () => {
  try {
    await navigator.clipboard.writeText(props.app.sha256)
    copyStatus.value = '已复制到剪贴板!'
    
    // 3秒后清除状态
    setTimeout(() => {
      copyStatus.value = ''
    }, 3000)
  } catch (err) {
    console.error('复制失败:', err)
    copyStatus.value = '复制失败，请手动复制'
  }
}
</script>

<style scoped>
.app-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #eaeaea;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #007bff;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.app-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.app-version {
  background: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.app-author {
  color: #666;
  font-size: 0.95rem;
  margin: 8px 0 16px;
}

.app-description {
  color: #444;
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 1rem;
}

.app-description :deep(s) {
  color: #999;
  text-decoration: line-through;
}

.app-download {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.download-btn:hover {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.download-btn:active {
  transform: scale(0.98);
}

.file-hash {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.file-hash strong {
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
}

.hash-code {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  color: #333;
  flex: 1;
  min-width: 200px;
  overflow-x: auto;
  white-space: nowrap;
}

.copy-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-btn:hover {
  background: #545b62;
}

.copy-status {
  margin-top: 8px;
  color: #28a745;
  font-size: 0.875rem;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-card {
    padding: 20px;
  }
  
  .app-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .app-name {
    font-size: 1.3rem;
  }
  
  .hash-code {
    min-width: 100%;
    font-size: 0.8rem;
  }
  
  .file-hash {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
