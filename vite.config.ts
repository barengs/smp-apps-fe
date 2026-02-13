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
}));