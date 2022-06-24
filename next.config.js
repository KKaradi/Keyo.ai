/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  env: {
    AUTH_KEY: process.env.AUTH_KEY,
    START_DATE: process.env.START_DATE
  }
};

module.exports = nextConfig;
