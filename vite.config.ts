import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/storage': {
        target: 'https://api-smp.umediatama.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Polyfill for Buffer in browser environments
    global: 'window',
    'process.env': {}, // Define process.env as an empty object if not already defined
    Buffer: ['buffer', 'Buffer'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'ui-vendor';
            }
            if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('redux')) {
              return 'state-vendor';
            }
            if (id.includes('recharts')) {
              return 'charts-vendor';
            }
            if (id.includes('@react-pdf') || id.includes('jspdf')) {
              return 'pdf-vendor';
            }
            if (id.includes('@tiptap')) {
              return 'tiptap-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
}));