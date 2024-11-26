import path from 'path';
import { loadEnvFile } from 'process';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const envFile = path.resolve(__dirname, `${mode}.env`);
  try {
    loadEnvFile(envFile);
  } catch {
    // Ignore
  }
  return {
    test: {
      globals: true,
      environment: 'node',
      setupFiles: ['src/setup-tests.ts'],
    },
  };
});
