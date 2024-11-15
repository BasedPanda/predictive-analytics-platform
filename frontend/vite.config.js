import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Add JSX runtime imports
      jsxRuntime: 'automatic',
    }),
  ],
  
  server: {
    port: 3000,
    // Enable HMR
    hmr: true,
    // Configure proxy for backend API
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },

  preview: {
    port: 3000,
  },

  // Configure path aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
    },
  },

  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',
    // Enable source maps for production
    sourcemap: true,
    // Configure rollup options
    rollupOptions: {
      output: {
        // Configure code splitting
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-alert-dialog', '@radix-ui/react-toast'],
          'chart-vendor': ['recharts'],
        },
      },
    },
    // Customize chunk size warnings
    chunkSizeWarningLimit: 1000,
  },

  // Configure optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts', 'axios'],
    exclude: [],
  },

  // Enable CSS modules
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    // PostCSS configuration
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },

  // Environment variables configuration
  envPrefix: 'VITE_',

  // Performance configurations
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },

  // Configure dev tools
  define: {
    __DEV__: process.env.NODE_ENV !== 'production',
  },

  // Error handling
  customLogger: {
    error: (msg) => {
      console.error('Build error:', msg);
    },
    warn: (msg) => {
      console.warn('Build warning:', msg);
    },
  },
});
