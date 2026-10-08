import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'MAKU Cooperative Management',
        short_name: 'MAKU App',
        description: 'MAKU Digital Cooperative Platform — Management System',
        theme_color: '#15803d',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Cache API GET requests with stale-while-revalidate
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/v1') && !url.pathname.includes('/auth/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'maku-api-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@maku/shared-types': resolve(__dirname, '../../packages/shared-types/src/index.ts'),
      '@maku/ui': resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@maku/utils': resolve(__dirname, '../../packages/utils/src/index.ts'),
    },
  },
  server: {
    port: 4001,
    host: '127.0.0.1',
    proxy: {
      '/v1': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
