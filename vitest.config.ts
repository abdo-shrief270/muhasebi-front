import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import type { Plugin } from 'vite'

/**
 * Replaces Nuxt's import.meta.client / import.meta.server
 * with boolean literals so composables work in Vitest.
 */
function nuxtImportMetaPlugin(): Plugin {
  return {
    name: 'nuxt-import-meta',
    transform(code, _id) {
      if (code.includes('import.meta.client') || code.includes('import.meta.server')) {
        return code
          .replaceAll('import.meta.client', 'true')
          .replaceAll('import.meta.server', 'false')
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), nuxtImportMetaPlugin()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, 'app'),
      '#imports': resolve(__dirname, '.nuxt/imports.d.ts'),
    },
  },
})
