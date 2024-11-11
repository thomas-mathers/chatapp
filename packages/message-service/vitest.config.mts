import { loadEnvFile } from 'process';
import { defineConfig } from 'vitest/config';

loadEnvFile('test.env');

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['src/setupTests.ts'],
  },
});
