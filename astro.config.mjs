// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // 建议填写完整的部署域名
  site: 'https://mcpackms.github.io',
  // 核心：设置子目录路径
  base: '/ruantools2/',
  integrations: [tailwind()],
  build: {
    format: 'directory'
  }
});