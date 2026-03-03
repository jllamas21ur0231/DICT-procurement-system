// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     tailwindcss(),
//     react()
//   ],
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/procurements': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/projects': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/procurement-modes': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/purchase-requests': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // sAdmin API endpoints only — NOT the page routes (/sadmin/signin, /sadmin/otp etc.)
      '/sadmin/request-otp': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sadmin/verify-otp': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sadmin/resend-otp': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sadmin/me': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sadmin/procurements': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sadmin/users': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sadmin/projects': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sadmin/procurement-modes': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sadmin/logout': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },


  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})