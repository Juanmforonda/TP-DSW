import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],

  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', //poner donde corra el backend
        changeOrigin: true,
      },
    },
  },
});
