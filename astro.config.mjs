// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // 设置你的部署域名
  site: 'https://mcpackms.github.io',
  // 设置基础路径为仓库名（必须以斜杠开头和结尾）
  base: '/ruantools2/',
  // 可选：确保构建输出格式与 base 配置兼容
  build: {
    format: 'directory' // 生成 /about/index.html 而非 /about.html
  }
});
