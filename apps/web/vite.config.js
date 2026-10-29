import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:4000';

export default defineConfig({
  plugins: [react()],
  // @crud/shared is a CommonJS workspace package (also consumed by the API),
  // so Vite must pre-bundle it in dev and run it through the CJS plugin on build.
  optimizeDeps: {
    include: ['@crud/shared'],
  },
  build: {
    commonjsOptions: {
      include: [/packages[\/]shared/, /node_modules/],
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});
