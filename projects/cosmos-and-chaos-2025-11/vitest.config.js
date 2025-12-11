import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Enable globals (describe, it, expect) without imports
    globals: true,

    // Test environment (node for unit tests, jsdom for DOM tests later)
    environment: 'node',

    // Coverage settings
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['game/js/**/*.js'],
      exclude: ['game/js/main.js', 'game/js/utils.js'], // Exclude entry points and utils for now
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    },

    // Test match patterns
    include: ['tests/**/*.test.js'],

    // Watch mode excludes
    exclude: ['node_modules', 'game', '.specify', 'archive']
  }
})
