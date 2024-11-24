import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': '/src',
    },
    dedupe: ['@emotion/react'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testing/setup-tests.ts'],
  },
});
