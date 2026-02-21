// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import vue from '@astrojs/vue';

export default defineConfig({
  site: 'https://mcpackms.github.io',
  base: '/ruantools2/',
  integrations: [tailwind(), vue()],
  build: {
    format: 'directory'
  }
});