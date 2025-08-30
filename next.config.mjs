import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
};

export default withPWA(nextConfig);












// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // output: 'export', // Commented out for development
//   trailingSlash: false,
//   images: {
//     unoptimized: true
//   }
// };
//
// export default nextConfig;
