import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // 환경변수 로드
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: './',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      proxy: {
        '/api': {
          // 환경변수에서 API URL 가져오기, 없으면 기본값 사용
          target: env.VITE_API_BASE_URL || 'http://localhost',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('프록시 에러:', err);
            });

            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('프록시 요청:', req.method, req.url);
            });

            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('프록시 응답:', proxyRes.statusCode, req.url);
            });
          }
        }
      }
    }
  }
})
