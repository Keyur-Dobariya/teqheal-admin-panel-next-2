const withPWA = require('next-pwa')

module.exports = withPWA({
  trailingSlash: false,
  images: {
    unoptimized: true
  },
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true
  }
})
