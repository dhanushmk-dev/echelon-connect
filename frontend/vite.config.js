import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      // Proxy QR images served by backend so they load in dev mode
      '/qr_codes': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
