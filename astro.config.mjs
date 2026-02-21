// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  // 建议填写完整的部署域名
  site: 'https://mcpackms.github.io',
  // 核心：设置子目录路径
  base: '/ruantools2/',
  integrations: [tailwind()],
  build: {
    format: 'directory'
  },
  // 配置 Vite 插件来自动复制库文件
  vite: {
    plugins: [
      {
        name: 'copy-npm-libs',
        buildStart() {
          const libsDir = path.resolve('public/libs');
          
          // 确保 libs 目录存在
          if (!fs.existsSync(libsDir)) {
            fs.mkdirSync(libsDir, { recursive: true });
          }
          
          // 定义要复制的库文件
          const libsToCopy = [
            {
              source: 'node_modules/crypto-js/crypto-js.js',
              dest: 'crypto-js.min.js'
            },
            {
              source: 'node_modules/js-sha3/build/sha3.js',
              dest: 'js-sha3.min.js'
            }
          ];
          
          // 复制每个库文件
          libsToCopy.forEach(lib => {
            try {
              if (fs.existsSync(lib.source)) {
                const sourcePath = path.resolve(lib.source);
                const destPath = path.join(libsDir, lib.dest);
                fs.copyFileSync(sourcePath, destPath);
                console.log(`✅ 已复制: ${lib.dest}`);
              } else {
                console.warn(`⚠️ 文件不存在: ${lib.source}`);
              }
            } catch (error) {
              console.error(`❌ 复制失败 ${lib.dest}:`, error.message);
            }
          });
        }
      }
    ],
    // 配置构建选项
    build: {
      rollupOptions: {
        // 确保库文件被包含在构建中
        external: []
      }
    }
  }
});
