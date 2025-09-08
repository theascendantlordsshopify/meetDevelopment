/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'images.pexels.com',
      'via.placeholder.com',
      'ui-avatars.com',
      'gravatar.com',
    ],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  async rewrites() {
    return [
      // Public booking routes (Calendly-style URLs)
      {
        source: '/:organizer_slug/:event_type_slug',
        destination: '/book/:organizer_slug/:event_type_slug',
      },
      {
        source: '/:organizer_slug',
        destination: '/profile/:organizer_slug',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;