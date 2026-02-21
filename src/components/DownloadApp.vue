<template>
  <div class="download-app">
    <!-- 网站头部 - 完全按照图片样式 -->
    <header class="site-header">
      <h1 class="site-title">RuanTools</h1>
      <p class="site-description">经作者授权的改版应用集散地</p>
      <p class="site-contact">投稿或建议请联系: <a href="mailto:5haghh49p@mozmail.com">5haghh49p@mozmail.com</a></p>
      <p class="site-notice">请复制网址 https://mcpackms.github.io/ruantools2/tools/ruanDl/ 到浏览器下载</p>
    </header>
    
    <!-- 应用列表 -->
    <main class="app-list">
      <!-- 应用卡片 1 -->
      <article class="app-card">
        <div class="app-header">
          <h2 class="app-name">软天空 NEXT</h2>
          <span class="app-version">v1.01</span>
        </div>
        <p class="app-author">作者: 一支电笔 / sl_ly</p>
        <p class="app-desc">主打精简，包体积小，使用流畅，功能较少，超稳定 <s>本站作者的改版</s></p>
        <div class="app-download">
          <a class="download-btn" href="https://ruantools.pages.dev/files/apk/ruansky/sl_ly/RUANSKY_NEXT_E_1.01.apk" title="下载 软天空 NEXT v1.01">
            <i class="fas fa-download"></i> 下载 APK 
          </a>
          <p class="file-hash">
            <strong>SHA256:</strong>
            <code>f0956ea4890fadb038e26438644d883bfe9e5dd2ebc5c2ac88789f003b1275de</code>
          </p>
        </div>
      </article>
      
      <!-- 应用卡片 2 -->
      <article class="app-card">
        <div class="app-header">
          <h2 class="app-name">满级软天空</h2>
          <span class="app-version">v20.0</span>
        </div>
        <p class="app-author">作者: 莎士比亚</p>
        <p class="app-desc">拥有多特色功能，如家族自动审核回复和动态修改昵称等等集合所有改版的趣味功能，开挂一般的存在，界面简洁好看</p>
        <div class="app-download">
          <a class="download-btn" href="https://ruantools.pages.dev/files/apk/ruansky/ssby/MaxRuan20.0.apk" title="下载 满级软天空 v20.0">
            <i class="fas fa-download"></i> 下载 APK 
          </a>
          <p class="file-hash">
            <strong>SHA256:</strong>
            <code>864dc0222f12029f034ad71ab40b5e204e8ecc1746f807e825ad830030e6309b</code>
          </p>
        </div>
      </article>
      
      <!-- 应用卡片 3 -->
      <article class="app-card">
        <div class="app-header">
          <h2 class="app-name">软天空（解锁版）</h2>
          <span class="app-version">2.1</span>
        </div>
        <p class="app-author">作者: k点</p>
        <p class="app-desc">极其精简，界面好看(真的好看!)，适合使用社区功能的用户使用</p>
        <div class="app-download">
          <a class="download-btn" href="https://ruantools.pages.dev/files/apk/ruansky/k_dian/kDianUnlock.apk" title="下载 k点解锁版 v2.1">
            <i class="fas fa-download"></i> 下载 APK 
          </a>
          <p class="file-hash">
            <strong>SHA256:</strong>
            <code>7c605fee22b75691566bc1f7fd294c0248b00b653622509300221a368b5becf9</code>
          </p>
        </div>
      </article>
    </main>
    
    <!-- 页脚 -->
    <footer class="site-footer">
      <p>© 2023-2025 sl_ly. Licensed under <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer">Apache 2.0</a>.</p>
    </footer>
  </div>
</template>

<script setup>
// 组件逻辑保持不变
</script>

<style scoped>
/* 根据图片重新调整样式 */
.download-app {
  width: 100%;
  max-width: 800px; /* 限制最大宽度，避免"突出来" */
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  line-height: 1.6;
  box-sizing: border-box;
}

/* 头部样式 - 完全按照图片 */
.site-header {
  text-align: left; /* 图片中是左对齐 */
  margin-bottom: 40px;
  padding: 0;
  background: transparent; /* 移除背景色 */
  border-radius: 0; /* 移除圆角 */
  box-shadow: none; /* 移除阴影 */
}

.site-title {
  font-size: 2.2rem; /* 图片中标题不是特别大 */
  font-weight: 900; /* 图片中是粗体黑色 */
  color: #000; /* 纯黑色 */
  margin-bottom: 8px;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.site-description {
  font-size: 1rem;
  color: #666; /* 灰色 */
  margin-bottom: 15px;
  font-weight: 400;
  line-height: 1.4;
}

.site-contact {
  font-size: 0.95rem;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.5;
}

.site-contact a {
  color: #0366d6; /* 图片中邮箱是蓝色 */
  text-decoration: none;
  font-weight: 500;
}

.site-contact a:hover {
  text-decoration: underline;
}

/* 注意：根据图片，这个区域是粉红色背景，红色文字 */
.site-notice {
  font-size: 0.9rem;
  color: #dc3545; /* 红色文字 */
  background: #f8d7da; /* 粉红色背景 */
  padding: 12px 16px;
  border-radius: 4px;
  display: block;
  margin-top: 20px;
  border-left: 4px solid #dc3545;
  line-height: 1.5;
  word-break: break-all;
}

/* 应用列表 */
.app-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 40px;
}

/* 应用卡片 - 简化样式 */
.app-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 20px;
  transition: box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.app-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.app-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.3;
}

.app-version {
  font-size: 0.85rem;
  color: #666;
  background: #f8f9fa;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 500;
}

.app-author {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 12px;
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
  margin-top: 10px;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
  margin-bottom: 15px;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  width: 100%;
  text-align: center;
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
  line-height: 1.5;
}

.file-hash strong {
  margin-right: 8px;
  color: #333;
  font-weight: 600;
}

.file-hash code {
  background: #f8f9fa;
  padding: 6px 10px;
  border-radius: 4px;
  color: #e83e8c;
  word-break: break-all;
  display: inline-block;
  width: calc(100% - 60px);
  border: 1px solid #eaeaea;
}

/* 页脚 */
.site-footer {
  text-align: center;
  padding: 25px 0;
  border-top: 1px solid #eee;
  color: #666;
  font-size: 0.9rem;
  background: #f8f9fa;
  border-radius: 6px;
  margin-top: 20px;
}

.site-footer a {
  color: #0366d6;
  text-decoration: none;
  font-weight: 500;
}

.site-footer a:hover {
  text-decoration: underline;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .download-app {
    padding: 15px;
  }
  
  .site-title {
    font-size: 1.8rem;
  }
  
  .site-description {
    font-size: 0.95rem;
  }
  
  .app-card {
    padding: 15px;
  }
  
  .app-name {
    font-size: 1.2rem;
  }
  
  .file-hash code {
    width: calc(100% - 50px);
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .app-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .app-version {
    align-self: flex-start;
  }
  
  .file-hash {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .file-hash code {
    width: 100%;
  }
}
</style>
