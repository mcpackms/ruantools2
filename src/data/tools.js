// src/data/tools.js

export const categoryConfig = {
  '数据格式': { icon: '⚡', bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' },
  '编码转换': { icon: '🔄', bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
  '时间工具': { icon: '⏰', bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
  '加密工具': { icon: '🔐', bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
  '文本处理': { icon: '📝', bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' },
  '软件下载': { icon: '📦', bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
  '图片工具': { icon: '🖼️', bg: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' },
  '开发工具': { icon: '🛠️', bg: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' },
  '生活工具': { icon: '🏠', bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308' },
  '其他': { icon: '📌', bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }
};

export const tools = [
  { 
    id: "code-formatter", 
    name: "代码格式化工具", 
    description: "格式化、验证和美化", 
    path: "/ruantools2/tools/code-formatter", 
    category: "数据格式",
    comingSoon: false
  },
  { 
    id: "base64-url", 
    name: "Base64 & URL 编解码", 
    description: "支持 Base64 编码/解码和 URL 编码/解码，处理特殊字符和中文。", 
    path: "/ruantools2/tools/base64-url", 
    category: "编码转换",
    comingSoon: false
  },
  { 
    id: "timestamp", 
    name: "时间戳转换", 
    description: "Unix 时间戳与日期时间相互转换，支持多种格式。", 
    path: "/ruantools2/tools/timestamp", 
    category: "时间工具",
    comingSoon: false
  },
  { 
    id: "hash-generator", 
    name: "哈希计算器", 
    description: "计算文本的 MD5、SHA-1、SHA-256 等哈希值。", 
    path: "/ruantools2/tools/hash", 
    category: "加密工具",
    comingSoon: false
  },
  { 
    id: "regex-tester", 
    name: "正则表达式测试", 
    description: "在线测试和调试正则表达式。", 
    path: "/ruantools2/tools/regex", 
    category: "文本处理",
    comingSoon: false
  },
  { 
    id: "ruanDl", 
    name: "软天空改版下载站", 
    description: "对原下载站的重构", 
    path: "/ruantools2/tools/ruanDl", 
    category: "软件下载",
    comingSoon: false
  },
  { 
    id: "aes-openssl", 
    name: "AES在线加解密", 
    description: "AES在线加解密工具", 
    path: "/ruantools2/tools/aes", 
    category: "加密工具",
    comingSoon: false
  },
  { 
    id: "image-compressor", 
    name: "图片压缩", 
    description: "在线压缩 JPG、PNG、GIF、WebP 图片", 
    path: "/ruantools2/tools/image-compressor", 
    category: "图片工具",
    comingSoon: false
  },
  { 
    id: "image-converter", 
    name: "图片格式转换", 
    description: "在线转换 JPG、PNG、GIF、WebP、BMP、SVG 图片格式", 
    path: "/ruantools2/tools/image-converter", 
    category: "图片工具",
    comingSoon: false
  },
  { 
    id: "jwt-decoder", 
    name: "JWT 解码器", 
    description: "在线解码 JWT Token，查看 Header 和 Payload", 
    path: "/ruantools2/tools/jwt-decoder", 
    category: "开发工具",
    comingSoon: false
  },
  { 
    id: "color-converter", 
    name: "颜色转换器", 
    description: "在线转换 HEX、RGB、HSL、HSV 颜色格式", 
    path: "/ruantools2/tools/color-converter", 
    category: "开发工具",
    comingSoon: false
  },
  { 
    id: "uuid-generator", 
    name: "UUID 生成器", 
    description: "批量生成 UUID，可选择版本（v1、v4）", 
    path: "/ruantools2/tools/uuid-generator", 
    category: "开发工具",
    comingSoon: false
  },
  { 
    id: "morse-code", 
    name: "摩斯电码", 
    description: "文本与摩斯电码相互转换", 
    path: "/ruantools2/tools/morse-code", 
    category: "编码转换",
    comingSoon: false
  },
  { 
    id: "sql-formatter", 
    name: "SQL 格式化", 
    description: "在线格式化 SQL 语句，支持关键词高亮", 
    path: "/ruantools2/tools/sql-formatter", 
    category: "开发工具",
    comingSoon: false
  },
  { 
    id: "markdown-preview", 
    name: "Markdown 预览", 
    description: "在线编辑和预览 Markdown，支持实时转换 HTML", 
    path: "/ruantools2/tools/markdown-preview", 
    category: "开发工具",
    comingSoon: false
  },
  { 
    id: "word-counter", 
    name: "字数统计", 
    description: "统计文本字数、行数、字符数，支持中英文", 
    path: "/ruantools2/tools/word-counter", 
    category: "文本处理",
    comingSoon: false
  },
  { 
    id: "html-escape", 
    name: "HTML 转义", 
    description: "HTML 实体编码与解码，防止 XSS 攻击", 
    path: "/ruantools2/tools/html-escape", 
    category: "编码转换",
    comingSoon: false
  },
  { 
    id: "unicode-converter", 
    name: "Unicode 转换", 
    description: "文本与 Unicode 编码相互转换", 
    path: "/ruantools2/tools/unicode-converter", 
    category: "编码转换",
    comingSoon: false
  },
  { 
    id: "cron-generator", 
    name: "Cron 表达式", 
    description: "在线生成和解析 Cron 表达式，支持可视化选择", 
    path: "/ruantools2/tools/cron-generator", 
    category: "开发工具",
    comingSoon: false
  },
  { 
    id: "url-parser", 
    name: "URL 参数解析", 
    description: "解析 URL 查询参数，查看和编辑 URL", 
    path: "/ruantools2/tools/url-parser", 
    category: "开发工具",
    comingSoon: false
  }
  
];
