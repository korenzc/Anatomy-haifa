import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'skeleton.png'],
      manifest: {
        name: 'Somatomy',
        short_name: 'Somatomy',
        description: 'מתרגלים אנטומיה עיונית לפני כל בוחן, עם חזרה מרווחת.',
        lang: 'he',
        dir: 'rtl',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F5F7FC',
        theme_color: '#F5F7FC',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // Recordings (public/audio) stay out of the service worker: media elements fetch them in
      // ranges, which iOS handles most reliably straight from the network/HTTP cache.
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'] },
    }),
  ],
  build: { chunkSizeWarningLimit: 900 },
  test: { environment: 'jsdom', globals: false },
});
