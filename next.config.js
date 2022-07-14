/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  env: {
    AUTH_KEY: process.env.AUTH_KEY,
    IMAGESETS_PER_DAY: process.env.IMAGESETS_PER_DAY,
    ETHERSCAN_KEY: process.env.ETHERSCAN_KEY
  },
  images:{
    domains:[""]
  }
};


module.exports = nextConfig;
