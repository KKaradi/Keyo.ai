/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  env: {
    AUTH_KEY: process.env.AUTH_KEY,
    START_DATE: process.env.START_DATE,
    IMAGESETS_PER_DAY: process.env.IMAGESETS_PER_DAY
  }
};

module.exports = nextConfig;
