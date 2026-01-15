import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true, // Listen on all addresses (0.0.0.0)
    strictPort: false, // If port is in use, try next available
    open: true, // Auto-open browser and make link clickable
  },
})
