import { fileURLToPath, URL } from 'node:url';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isMock = process.env.MOCK_SIO === '1' || mode === 'mock';

  if (isMock) console.log('[vite] MOCK_SIO ON');

  return {
    server: {
      port: 5174,
      strictPort: true,
    },
    plugins: [vue(), vueJsx(), vueDevTools(), basicSsl()],
    resolve: {
      alias: {
        ...(isMock
          ? {
              'socket.io-client': fileURLToPath(
                new URL('./tests/mocks/socket.io-client.mock.js', import.meta.url),
              ),
              '@/services/api': fileURLToPath(
                new URL('./tests/mocks/services-api-mock.js', import.meta.url),
              ),
              './api': fileURLToPath(
                new URL('./tests/mocks/services-api-mock.js', import.meta.url),
              ),
            }
          : {}),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: isMock ? ['socket.io-client', '@/services/api'] : [],
    },
  };
});
