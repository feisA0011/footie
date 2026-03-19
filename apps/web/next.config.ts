import type { NextConfig } from 'next';

const config: NextConfig = {
  env: {
    FOOTIE_API_URL: process.env['FOOTIE_API_URL'] ?? 'http://localhost:3001'
  }
};

export default config;
