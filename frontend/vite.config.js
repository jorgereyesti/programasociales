import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',      // escucha en todas las interfaces
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: [
      '3635a04b3b96.ngrok-free.app' // dominio de ngrok que querés permitir
    ],
    proxy: {
      '/dashboard':              { target: 'https://3635a04b3b96.ngrok-free.app:3000', changeOrigin: true },
      '/registro':               { target: 'https://3635a04b3b96.ngrok-free.app:3000', changeOrigin: true },
      '/beneficiarios':          { target: 'https://3635a04b3b96.ngrok-free.app:3000', changeOrigin: true },
      '/producciones':           { target: 'https://3635a04b3b96.ngrok-free.app:3000', changeOrigin: true },
      '/productos':              { target: 'https://3635a04b3b96.ngrok-free.app:3000', changeOrigin: true },
      '/entregas':               { target: 'https://3635a04b3b96.ngrok-free.app:3000', changeOrigin: true },
      '/cic':                    { target: 'https://3635a04b3b96.ngrok-free.app:3000', changeOrigin: true },
      '/condiciones-familiar':   { target: 'https://3635a04b3b96.ngrok-free.app:3000', changeOrigin: true },
      '/mantenimientos-economico': { target: 'https://3635a04b3b96.ngrok-free.app:3000', changeOrigin: true },
      '/familiares':             { target: 'https://3635a04b3b96.ngrok-free.app:3000', changeOrigin: true },
    }
  }
})
