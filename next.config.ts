
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Changed from true
  },
  eslint: {
    ignoreDuringBuilds: false, // Changed from true
  },
  allowedDevOrigins: [
    'cloudworkstations.dev', 
    '*.cloudworkstations.dev',
    '9003-firebase-studio-1747653706683.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev',
    '6000-firebase-studio-1747653706683.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev'
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.freympc.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
