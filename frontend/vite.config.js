import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the backend to avoid CORS and preview host issues
      '/generate': 'http://localhost:3001',
      '/export': 'http://localhost:3001'
    }
  }
});
