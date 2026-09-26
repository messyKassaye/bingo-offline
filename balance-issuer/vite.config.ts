import { defineConfig, loadEnv } from 'vite';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const repositoryRoot = path.resolve(process.cwd(), '..');
  const env = loadEnv(mode, repositoryRoot, '');

  return {
    base: './',
    define: {
      __ISSUER_PRIVATE_KEY__: JSON.stringify(env.VITE_BALANCE_ISSUER_PRIVATE_KEY ?? ''),
    },
    server: {
      host: '127.0.0.1',
      port: 1420,
      strictPort: true,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});
