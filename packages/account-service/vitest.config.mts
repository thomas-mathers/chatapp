import { loadEnvFile } from 'process';
import { defineConfig } from 'vitest/config';

loadEnvFile('./packages/account-service/test.env');

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['src/setup-tests.ts'],
  },
});
