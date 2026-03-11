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
      // Forward all /sadmin/* requests to Laravel (covers every sAdmin API route)
      '^/sadmin/(?!signin|otp|dashboard).*': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
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
      '/notifications': {
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