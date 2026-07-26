import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Emits sitemap.xml at build time.
 *
 * A sitemap requires absolute URLs, and the production domain is not knowable
 * from the source tree — so it comes from VITE_SITE_URL and, when that is
 * unset, no sitemap is written at all. Shipping one pointing at a guessed
 * domain would be rejected by search engines as a cross-submission.
 *
 * Only the landing page is listed. Articles and author pages are created by
 * users after the build, so this plugin cannot know them; covering those needs
 * a generator with database access (see docs/SEO.md). Nothing under
 * /dashboard, and no credential route, may ever be added here.
 */
const sitemapPlugin = () => ({
  name: 'quillora-sitemap',
  apply: 'build',
  generateBundle() {
    const siteUrl = (process.env.VITE_SITE_URL || '').replace(/\/$/, '');
    if (!siteUrl) return;

    this.emitFile({
      type: 'asset',
      fileName: 'sitemap.xml',
      source: [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url>',
        `    <loc>${siteUrl}/</loc>`,
        '    <changefreq>weekly</changefreq>',
        '    <priority>1.0</priority>',
        '  </url>',
        '</urlset>',
        '',
      ].join('\n'),
    });
  },
});

export default defineConfig({
  plugins: [react(), sitemapPlugin()],
  // Absolute, so asset URLs resolve the same from every route depth. With './'
  // a hard load of /dashboard/write asks for /dashboard/assets/... and 404s.
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.test.{js,jsx}'],
    // The build output is not source; Vitest should never crawl it.
    exclude: ['node_modules/**', 'dist/**'],
    restoreMocks: true,
    // Mounting the MUI theme in jsdom costs a couple of seconds on a cold
    // render, which overruns the 5s default once the whole suite is running.
    testTimeout: 20000,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        /*
         * `experimentalMinChunkSize` was measured here and deliberately left
         * off: at 20 kB it folded 77 chunks down to 65, but pushed 5.7 kB of
         * shared modules back into the entry. Those small chunks are lucide
         * icons that only load beside the route needing them, so the trade
         * ran against the point of the split — landing paid for navigations
         * it never makes.
         */
        /*
         * One vendor chunk, for the libraries every route needs anyway.
         *
         * React and the router are on the critical path for the landing page,
         * so isolating them moves no bytes into the initial load — it just
         * gives them a hash that survives application deploys, so returning
         * visitors keep them cached.
         *
         * MUI is deliberately NOT grouped: Rollup already splits it per
         * component, so Tooltip, Snackbar, Alert and friends ride along with
         * the lazy routes that use them. Forcing them into one eager vendor
         * chunk would put ~65 kB back on the landing page.
         */
        manualChunks: (id) =>
          /node_modules[/\\](react|react-dom|react-router|react-router-dom|scheduler)[/\\]/.test(id)
            ? 'react-vendor'
            : undefined,
      },
    },
  }
});
