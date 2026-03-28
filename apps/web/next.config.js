/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@cognitive/content-schema", "@cognitive/game-engine", "@cognitive/utils"],
};

module.exports = nextConfig;
