import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.1.4',
    'localhost:3000',
    'sad-bushes-call.loca.lt',
    '.loca.lt',
    '.ngrok-free.app',
    '.ngrok.io',
  ],
};

export default nextConfig;
