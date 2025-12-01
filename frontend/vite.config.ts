import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Allow specifying full backend URL including '/api'. We'll strip '/api' for proxy origin.
  const raw = env.VITE_BACKEND_URL || '';
  const proxyTarget = raw ? raw.replace(/\/?api\/?$/, '') : 'http://localhost:8000';

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
