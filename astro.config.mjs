// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  site: 'https://mcpackms.github.io',
  base: '/ruantools2/',
  integrations: [tailwind()],
  build: {
    format: 'directory',
    // 确保静态资源正确复制
    assets: 'assets',
  },
  vite: {
    plugins: [
      wasm(),
      topLevelAwait()
    ],
    build: {
      // 确保所有依赖都打包
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    optimizeDeps: {
      // 确保依赖被正确优化
      include: ['crypto-js', 'js-sha3']
    }
  }
});
