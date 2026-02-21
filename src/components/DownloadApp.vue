<template>
  <div class="download-app">
    <!-- 网站头部 -->
    <header class="site-header">
      <h1 class="site-title">RuanTools</h1>
      <p class="site-description">经作者授权的改版应用集散地</p>
      <p class="site-contact">投稿或建议请联系: <a href="mailto:5haghh49p@mozmail.com">5haghh49p@mozmail.com</a></p>
      <p class="site-notice">请复制网址 https://ruantools.pages.dev/files/apk/ruansky 到浏览器下载</p>
    </header>
    
    <!-- 应用列表 -->
    <main class="app-list">
      <!-- 应用卡片 -->
      <article class="app-card" v-for="(app, index) in apps" :key="index">
        <div class="app-header">
          <h2 class="app-name">{{ app.name }}</h2>
          <span class="app-version">{{ app.version }}</span>
        </div>
        
        <p class="app-author">作者: {{ app.author }}</p>
        
        <p class="app-desc" v-html="formatDescription(app.description)"></p>
        
        <div class="app-download">
          <a 
            class="download-btn" 
            :href="app.downloadUrl" 
            :title="`下载 ${app.name} ${app.version}`"
            target="_blank"
            rel="noopener noreferrer"
            @click="trackDownload(app)"
          >
            <i class="fas fa-download"></i> {{ app.downloadText }}
          </a>
          
          <p class="file-hash">
            <strong>SHA256:</strong>
            <code>{{ app.sha256 }}</code>
            <button class="copy-hash-btn" @click="copyHash(app.sha256, app.name)">
              <i class="fas fa-copy"></i>
            </button>
          </p>
        </div>
      </article>
    </main>
    
    <!-- 页脚 -->
    <footer class="site-footer">
      <p>© 2023-2025 sl_ly. Licensed under <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer">Apache 2.0</a>.</p>
    </footer>
    
    <!-- 通知 -->
    <div v-if="showNotification" class="notification" :class="notificationType">
      {{ notificationMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 响应式数据
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success')

// 应用数据 - 使用完整的外部URL
const apps = ref([
  {
    id: 1,
    name: '软天空 NEXT',
    version: 'v1.01',
    author: '一支电笔 / sl_ly',
    description: '主打精简，包体积小，使用流畅，功能较少，超稳定 <s>本站作者的改版</s>',
    downloadUrl: 'https://ruantools.pages.dev/files/apk/ruansky/sl_ly/RUANSKY_NEXT_E_1.01.apk',
    sha256: 'f0956ea4890fadb038e26438644d883bfe9e5dd2ebc5c2ac88789f003b1275de',
    downloadText: '下载 APK'
  },
  {
    id: 2,
    name: '满级软天空',
    version: 'v20.0',
    author: '莎士比亚',
    description: '拥有多特色功能，如家族自动审核回复和动态修改昵称等等集合所有改版的趣味功能，开挂一般的存在，界面简洁好看',
    downloadUrl: 'https://ruantools.pages.dev/files/apk/ruansky/ssby/MaxRuan20.0.apk',
    sha256: '864dc0222f12029f034ad71ab40b5e204e8ecc1746f807e825ad830030e6309b',
    downloadText: '下载 APK'
  },
  {
    id: 3,
    name: '软天空（解锁版）',
    version: '2.1',
    author: 'k点',
    description: '极其精简，界面好看(真的好看!)，适合使用社区功能的用户使用',
    downloadUrl: 'https://ruantools.pages.dev/files/apk/ruansky/k_dian/kDianUnlock.apk',
    sha256: '7c605fee22b75691566bc1f7fd294c0248b00b653622509300221a368b5becf9',
    downloadText: '下载 APK'
  }
])

// 方法
const formatDescription = (desc) => {
  return desc
}

const trackDownload = (app) => {
  console.log(`下载跟踪: ${app.name} ${app.version}`)
  // 这里可以添加下载统计代码
}

const copyHash = async (hash, appName) => {
  try {
    await navigator.clipboard.writeText(hash)
    showNotificationFunc(`已复制 ${appName} 的SHA256哈希值`, 'success')
  } catch (err) {
    // 回退方案
    const textArea = document.createElement('textarea')
    textArea.value = hash
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showNotificationFunc(`已复制 ${appName} 的SHA256哈希值`, 'success')
  }
}

const showNotificationFunc = (message, type = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
  
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}
</script>

<style scoped>
.download-app {
  width: 100%;
}

/* 头部样式 */
.site-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.site-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.site-description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 10px;
}

.site-contact {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 10px;
}

.site-contact a {
  color: #0366d6;
  text-decoration: none;
}

.site-contact a:hover {
  text-decoration: underline;
}

.site-notice {
  font-size: 0.9rem;
  color: #dc3545;
  background: #f8d7da;
  padding: 10px 15px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 10px;
}

/* 应用列表 */
.app-list {
  display: grid;
  gap: 20px;
  margin-bottom: 40px;
}

@media (min-width: 768px) {
  .app-list {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
}

/* 应用卡片 */
.app-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.app-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.app-name {
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.app-version {
  font-size: 0.9rem;
  color: #666;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.app-author {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 15px;
  font-style: italic;
}

.app-desc {
  line-height: 1.6;
  color: #444;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.app-desc s {
  color: #999;
  text-decoration: line-through;
}

.app-download {
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
  margin-bottom: 15px;
}

.download-btn:hover {
  background: #0056b3;
  text-decoration: none;
}

.download-btn i {
  font-size: 1.1em;
}

.file-hash {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.file-hash strong {
  margin-right: 5px;
}

.file-hash code {
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  color: #e83e8c;
  word-break: break-all;
  flex: 1;
  min-width: 0;
}

.copy-hash-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 4px;
}

.copy-hash-btn:hover {
  background: #5a6268;
}

/* 页脚 */
.site-footer {
  text-align: center;
  padding: 20px;
  border-top: 1px solid #eee;
  color: #666;
  font-size: 0.9rem;
  background: white;
  border-radius: 8px;
}

.site-footer a {
  color: #0366d6;
  text-decoration: none;
  font-weight: 500;
}

.site-footer a:hover {
  text-decoration: underline;
}

/* 通知 */
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease;
  max-width: 300px;
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
</style>
