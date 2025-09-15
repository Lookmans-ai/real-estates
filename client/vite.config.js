import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:1024', // Your backend server
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:1024', // Your backend server
        secure: false,
      },
    },
  },
  plugins: [react()],
});
