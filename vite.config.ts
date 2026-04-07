import { defineConfig, loadEnv } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Extract origin from VITE_API_BASE_URL (i.e. 'http://localhost:8000')
  let targetUrl = 'http://localhost:8000';
  if (env.VITE_API_BASE_URL) {
    try {
      const parsedUrl = new URL(env.VITE_API_BASE_URL);
      targetUrl = parsedUrl.origin;
    } catch(e) {
      // fallback if invalid URL
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/storage': {
          target: targetUrl,
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
  };
});