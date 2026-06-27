import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'
import path from 'node:path'

export default defineConfig({
  root: 'src',
  base: './',
  publicDir: path.resolve(__dirname, 'public'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@gridgo/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@gridgo/types': path.resolve(__dirname, '../../packages/types/src'),
      '@gridgo/api': path.resolve(__dirname, '../../packages/api/src'),
      '@gridgo/store': path.resolve(__dirname, '../../packages/store/src'),
    },
  },
  plugins: [UnoCSS(), react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: false,
  },
})
