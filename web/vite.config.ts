import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react' }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: { enabled: false },
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'SpotBird — Katalog & Spotting Burung',
        short_name: 'SpotBird',
        description: 'Katalog burung Indonesia dan catatan spotting untuk pengamat burung.',
        lang: 'id',
        start_url: '/',
        scope: '/',
        id: '/',
        display: 'standalone',
        background_color: '#F7F3E8',
        theme_color: '#1F5D3B',
        categories: ['education', 'travel'],
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,ico,webmanifest,woff2}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api/') &&
              !url.pathname.startsWith('/api/auth/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'spotbird-api',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: { tsconfigPaths: true },
  server: {
    host: true,
    port: 5173,
    proxy: { '/api': 'http://localhost:3001' },
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: ['spotbird.myeong.xyz', 'spotbird.139.190.105.194.sslip.io'],
    proxy: { '/api': 'http://localhost:3001' },
  },
});
