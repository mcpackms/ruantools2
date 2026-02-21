// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // 设置完整的部署域名
  site: 'https://mcpackms.github.io',
  
  // 必须设置与仓库名称一致的base路径
  base: '/ruantools2/',
  
  integrations: [tailwind()],
  
  build: {
    // 使用目录格式，生成 index.html 文件
    format: 'directory'
  },
  
  // 移除复杂的Vite插件配置，简化构建
  vite: {
    // 确保库能正确导入
    ssr: {
      noExternal: ['crypto-js', 'js-sha3']
    }
  }
});
