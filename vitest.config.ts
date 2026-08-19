import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(import.meta.dirname, './app'),
      '@': path.resolve(import.meta.dirname, './app'),
    },
  },
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.spec.ts', 'tests/component/**/*.spec.ts'],
    exclude: ['tests/e2e/**/*', 'node_modules/**/*'],
  },
})
