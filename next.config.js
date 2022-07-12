/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  env: {
    AUTH_KEY: process.env.AUTH_KEY,
    ETHERSCAN_KEY: process.env.ETHERSCAN_KEY
  }
};

module.exports = nextConfig;
