/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa');

const nextConfig = {
  // output: 'export', // Commented out for development
  trailingSlash: false,
  images: {
    unoptimized: true
  },
  pwa: {
    dest: 'public',  // service worker and manifest will be stored here
    register: true,   // register the service worker
    skipWaiting: true // ensures the service worker takes control immediately
  }
};

module.exports = withPWA(nextConfig);
