import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': new URL('./src', import.meta.url).pathname } },
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 180000,
    hookTimeout: 180000,
  },
});
