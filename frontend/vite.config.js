import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mux') || id.includes('mux-player')) {
              return 'vendor-mux';
            }
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-pdf-canvas';
            }
            if (id.includes('@lottiefiles') || id.includes('dotlottie')) {
              return 'vendor-lottie';
            }
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
              return 'vendor-charts';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'vendor-ui-motion';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('zustand') || id.includes('axios')) {
              return 'vendor-core';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});