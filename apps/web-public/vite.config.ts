import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@maku/shared-types': resolve(__dirname, '../../packages/shared-types/src/index.ts'),
      '@maku/ui': resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@maku/utils': resolve(__dirname, '../../packages/utils/src/index.ts'),
    },
  },
  server: {
    port: 4000,
    host: '127.0.0.1',
  },
  build: {
    // Good for SEO — split chunks
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          leaflet: ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
});
