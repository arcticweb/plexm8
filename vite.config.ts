import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  // Load environment variables for the current mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Use VITE_APP_BASE_PATH from .env files (default: / for dev, /plexm8/ for prod)
    base: env.VITE_APP_BASE_PATH || '/',
    server: {
      port: 5173,
      open: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'zustand', 'axios'],
          },
        },
      },
    },
  };
});
