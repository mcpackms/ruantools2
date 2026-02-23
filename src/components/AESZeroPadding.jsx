---
// src/pages/tools/aes-native.astro
import Layout from '../../layouts/Layout.astro';
import AESZeroPaddingWebCrypto from '../../components/AESZeroPaddingWebCrypto.jsx';

const pageTitle = 'AES 加密解密工具 (原生 API)';
const description = '使用浏览器原生 Web Crypto API 的 AES-128-CBC 零填充加密解密工具，更安全，无需外部依赖';
---

<Layout title={`${pageTitle} | 软糖工具`}>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- 页面标题和描述 -->
    <div class="mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {pageTitle}
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>

    <!-- 工具主界面 -->
    <div class="mb-8">
      <AESZeroPaddingWebCrypto client:load />
    </div>

    <!-- Web Crypto API 介绍 -->
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 mb-8">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
          <span class="text-2xl">🔐</span>
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">关于 Web Crypto API</h2>
      </div>
      <div class="space-y-3 text-gray-700 dark:text-gray-300">
        <p><strong>Web Crypto API</strong> 是浏览器提供的原生加密 API，具有以下优势：</p>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>高性能</strong>：使用浏览器的原生加密实现，比 JavaScript 库更快</li>
          <li><strong>更安全</strong>：避免第三方库的安全隐患，密钥处理更安全</li>
          <li><strong>标准化</strong>：W3C 标准，所有现代浏览器都支持</li>
          <li><strong>无依赖</strong>：无需加载外部库，减少页面大小</li>
          <li><strong>更好的随机数生成</strong>：使用系统级安全随机数生成器</li>
        </ul>
        <div class="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <p class="text-sm font-medium text-blue-800 dark:text-blue-300">💡 注意：此工具实现了零填充（Zero Padding），Web Crypto API 本身不支持此填充方式，因此我们在代码中手动实现了填充和去填充逻辑。</p>
        </div>
      </div>
    </div>

    <!-- 技术规格 -->
    <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 mb-8">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">技术规格</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">算法参数</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">加密 API</span>
              <code class="font-mono text-gray-800 dark:text-gray-200">Web Crypto API</code>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">算法</span>
              <code class="font-mono text-gray-800 dark:text-gray-200">AES-CBC</code>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">密钥长度</span>
              <code class="font-mono text-gray-800 dark:text-gray-200">128位 (16字节)</code>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">填充方式</span>
              <code class="font-mono text-gray-800 dark:text-gray-200">零填充 (手动实现)</code>
            </div>
          </div>
        </div>
        <div>
          <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">密钥信息</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">密钥</span>
              <code class="font-mono text-gray-800 dark:text-gray-200 break-all">P.8CGq@Wr~Vs]!4!</code>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">初始化向量</span>
              <code class="font-mono text-gray-800 dark:text-gray-200 break-all">与密钥相同</code>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">数据编码</span>
              <span class="text-gray-800 dark:text-gray-200">UTF-8 / Base64</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">块大小</span>
              <span class="text-gray-800 dark:text-gray-200">16 字节</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">加密示例</h3>
        <div class="space-y-2 text-sm">
          <p><strong>步骤：</strong></p>
          <ol class="list-decimal pl-5 space-y-1">
            <li>选择"加密"模式</li>
            <li>输入要加密的明文，如：<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">Hello! CBC NoPad</code></li>
            <li>点击"执行加密"按钮</li>
            <li>获取 Base64 编码的密文</li>
          </ol>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">注意：文本会被自动零填充至 16 字节倍数</p>
        </div>
      </div>

      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">解密示例</h3>
        <div class="space-y-2 text-sm">
          <p><strong>步骤：</strong></p>
          <ol class="list-decimal pl-5 space-y-1">
            <li>选择"解密"模式（默认）</li>
            <li>输入 Base64 密文，如示例中的密文</li>
            <li>点击"执行解密"按钮</li>
            <li>获取原始明文</li>
          </ol>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">注意：密文长度必须是 16 字节的倍数</p>
        </div>
      </div>
    </div>

    <!-- 浏览器兼容性 -->
    <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 mb-8">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">浏览器兼容性</h2>
      <div class="space-y-3 text-gray-700 dark:text-gray-300">
        <p>Web Crypto API 在现代浏览器中得到了良好支持：</p>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>Chrome 37+</strong>：完全支持</li>
          <li><strong>Firefox 34+</strong>：完全支持</li>
          <li><strong>Safari 11+</strong>：完全支持</li>
          <li><strong>Edge 12+</strong>：完全支持</li>
          <li><strong>Opera 24+</strong>：完全支持</li>
        </ul>
        <div class="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <p class="text-sm font-medium text-green-800 dark:text-green-300">✅ 此工具可在所有现代浏览器中正常工作，包括移动端浏览器。</p>
        </div>
      </div>
    </div>

    <!-- 安全提示 -->
    <div class="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <span class="text-2xl">⚠️</span>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">安全提示</h3>
          <ul class="space-y-2 text-yellow-700 dark:text-yellow-400">
            <li>• 所有加密/解密操作均在您的浏览器本地完成，数据不会上传到任何服务器</li>
            <li>• 此工具使用固定密钥，适合学习、测试和简单加密需求</li>
            <li>• 零填充方式在某些场景下可能不够安全，建议用于非关键数据</li>
            <li>• 对于生产环境，请使用标准填充方式（如 PKCS7）和安全的密钥管理方案</li>
            <li>• 考虑使用 Web Crypto API 的密钥派生函数（PBKDF2）生成更安全的密钥</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</Layout>

<style>
  /* 自定义滚动条样式 */
  pre {
    overflow-x: auto;
  }
  
  pre::-webkit-scrollbar {
    height: 6px;
  }
  
  pre::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  pre::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
  
  pre::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
  
  /* 暗色模式滚动条 */
  .dark pre::-webkit-scrollbar-track {
    background: #374151;
  }
  
  .dark pre::-webkit-scrollbar-thumb {
    background: #6b7280;
  }
  
  .dark pre::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
</style>
