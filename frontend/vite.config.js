import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',      // escucha en todas las interfaces
    port: 5173,
    strictPort: true,     // falla si el 5173 está ocupado
    cors: true,           // habilita CORS (aunque el backend ya lo tiene)
    proxy: {
      // Ajustá estas keys si tus rutas son distintas
      '/dashboard':              { target: 'http://localhost:3000', changeOrigin: true },
      '/registro':               { target: 'http://localhost:3000', changeOrigin: true },
      '/beneficiarios':          { target: 'http://localhost:3000', changeOrigin: true },
      '/producciones':           { target: 'http://localhost:3000', changeOrigin: true },
      '/productos':              { target: 'http://localhost:3000', changeOrigin: true },
      '/entregas':               { target: 'http://localhost:3000', changeOrigin: true },
      '/cic':                    { target: 'http://localhost:3000', changeOrigin: true },
      '/condiciones-familiar':   { target: 'http://localhost:3000', changeOrigin: true },
      '/mantenimientos-economico': { target: 'http://localhost:3000', changeOrigin: true },
      '/familiares':             { target: 'http://localhost:3000', changeOrigin: true },
    }
  }
})
