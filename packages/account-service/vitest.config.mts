import { defineConfig } from 'vitest/config';

export default defineConfig({
  envPrefix: 'ACCOUNT_SERVICE_',
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['src/setup-tests.ts'],
  },
});
