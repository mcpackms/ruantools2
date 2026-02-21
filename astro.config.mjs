// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://mcpackms.github.io',
  base: '/ruantools2/',
  integrations: [tailwind()],
  build: {
    format: 'directory'
  }
});
