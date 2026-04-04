import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const WEB_ROOT = fileURLToPath(new URL('.', import.meta.url));

const config: NextConfig = {
  turbopack: {
    root: resolve(WEB_ROOT, '..', '..')
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env['NEXT_PUBLIC_API_URL'] ?? process.env['FOOTIE_API_URL'] ?? 'http://localhost:3001'
  }
};

export default config;
