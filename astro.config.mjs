// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The public URL of the site. Used for canonical links and the sitemap.
export default defineConfig({
  site: 'https://www.hinmanlabucla.org',
  integrations: [sitemap()],
  build: {
    // Emit clean URLs (e.g. /research/ instead of /research.html)
    format: 'directory',
  },
});
