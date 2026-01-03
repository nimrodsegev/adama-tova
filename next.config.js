/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile ivrita package to work with Next.js ES modules
  transpilePackages: ['ivrita'],
};

module.exports = nextConfig;
