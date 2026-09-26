import { defineConfig } from 'vitest/config';
// loadEnv and Plugin come from vite itself: vitest/config only re-exports a
// defineConfig widened with the `test` key.
import { loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';

const CONFIG_TEMPLATE = path.resolve(__dirname, 'public/config.template.json');

/**
 * Serves /config.json to the dev and preview servers.
 *
 * In a container this file is produced by envsubst at startup
 * (docker/runtime-config.sh). Neither `vite dev` nor `vite preview` has an
 * entrypoint, so they render the same template from .env instead - one
 * template and one set of variable names everywhere.
 */
function runtimeConfig(env: Record<string, string>): Plugin {
  const handler = (
    _req: unknown,
    res: {
      setHeader: (k: string, v: string) => void;
      end: (body: string) => void;
    },
  ) => {
    const body = fs
      .readFileSync(CONFIG_TEMPLATE, 'utf8')
      .replace(/\$\{(\w+)\}/g, (_match, key: string) => env[key] ?? '');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(body);
  };

  // Block bodies: .use() returns the connect app, and Vite would call a
  // returned value as a post-middleware hook.
  return {
    name: 'runtime-config',
    configureServer(server) {
      server.middlewares.use('/config.json', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/config.json', handler);
    },
  };
}

export default defineConfig(({ mode }) => {
  // "" prefix so a value passed in the shell is picked up like one in .env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), runtimeConfig(env)],
    resolve: {
      alias: {
        '@styles': path.resolve(__dirname, 'src/styles'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
    },
    preview: {
      port: 3000,
    },
    build: {
      // Keep CRA's output folder so the Dockerfile / nginx setup keeps working
      outDir: 'build',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      passWithNoTests: true,
    },
  };
});
