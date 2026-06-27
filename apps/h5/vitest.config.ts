import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@gridgo/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@gridgo/types': path.resolve(__dirname, '../../packages/types/src'),
      '@gridgo/api': path.resolve(__dirname, '../../packages/api/src'),
      '@gridgo/store': path.resolve(__dirname, '../../packages/store/src'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: { reporter: ['text', 'json-summary'] },
  },
})
