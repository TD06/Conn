/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_ZEGO_APP_ID:912242580,
    NEXT_PUBLIC_ZEGO_SERVER_ID:"fcb095e162b2f8da3a44ec56cf8329f6",
  },
  images: {
    domains: ["localhost"],
  },
};

module.exports = nextConfig;
