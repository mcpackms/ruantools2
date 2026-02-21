// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vue from '@astrojs/vue';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // 修复：使用完整的 GitHub Pages URL
  site: 'https://mcpackms.github.io',
  base: '/ruantools2/',
  integrations: [tailwind(), vue(), react()],
  build: {
    format: 'directory'
  }
});
