import { isTauri } from '@tauri-apps/api/core';

export type RuntimeConfig = {
  VITE_API_URL: string;
  VITE_ONLINE_BINGO_URL: string;
  VITE_BALANCE_SIGNING_PUBLIC_KEY: string;
};

let config: RuntimeConfig | null = null;

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (config) return config;

  if (isTauri()) {
    config = {
      VITE_API_URL: import.meta.env.VITE_API_URL ?? '',
      VITE_ONLINE_BINGO_URL: import.meta.env.VITE_ONLINE_BINGO_URL ?? '',
      VITE_BALANCE_SIGNING_PUBLIC_KEY:
        import.meta.env.VITE_BALANCE_SIGNING_PUBLIC_KEY ?? '',
    };
    return config;
  }

  // no-store because the file is rewritten on every container start; a cached
  // copy would survive a deploy that changed the API address.
  const res = await fetch('/config.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(
      `Runtime config: GET /config.json returned ${res.status}. In a container ` +
        'this file is written at startup - check that docker/runtime-config.sh ran.',
    );
  }

  config = (await res.json()) as RuntimeConfig;
  return config;
}

/**
 * The loaded config, synchronously. Throws rather than returning a half-empty
 * object, because a silent "" would surface far away as a request to the
 * wrong host.
 */
export function getRuntimeConfig(): RuntimeConfig {
  if (!config) {
    throw new Error(
      'Runtime config read before loadRuntimeConfig() resolved. Anything ' +
        'reading config at import time must be imported from the bootstrap in ' +
        'index.tsx, not statically.',
    );
  }
  return config;
}
