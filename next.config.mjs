/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Commented out for development
  trailingSlash: false,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
