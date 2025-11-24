import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

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
      // Only generate source maps in development mode
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          // Use content hash in filenames for better cache busting
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: {
            vendor: ['react', 'react-dom', 'zustand', 'axios'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
