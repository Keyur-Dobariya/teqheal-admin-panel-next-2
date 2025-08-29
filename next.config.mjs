import withPWA from 'next-pwa'

export default withPWA({
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
