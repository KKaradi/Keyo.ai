/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  env: {
    AUTH_KEY: process.env.AUTH_KEY
  }
};

module.exports = nextConfig;
