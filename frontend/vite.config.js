import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Forwards /api calls to the Express server so the browser has no CORS issues
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
