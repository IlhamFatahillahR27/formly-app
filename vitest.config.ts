import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.spec.ts', 'tests/component/**/*.spec.ts'],
    exclude: ['tests/e2e/**/*', 'node_modules/**/*'],
  },
})
