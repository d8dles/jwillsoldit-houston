// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Served at jwillsoldit.com/houston via a rewrite from the hub's Vercel
// project, so every route and asset must live under /houston.
export default defineConfig({
  site: 'https://www.jwillsoldit.com',
  base: '/houston',
  trailingSlash: 'never',
  output: 'static',
  integrations: [sitemap()],
});
