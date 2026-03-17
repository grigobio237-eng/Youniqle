/** @type {import('next').NextConfig} */
const nextConfig = {
  // 에러 처리 개선
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // 번들 최적화 (Next.js 15에서는 swcMinify가 기본값)
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingExcludes: {
    '/api/**/*': [
      'public/imgly-assets/**/*',
      'public/imgly/**/*',
      'public/images/**/*',
      'public/output/**/*'
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'qhlswiwiisfserta.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'youniqle-eea2f.firebasestorage.app', // 특정 프로젝트 버킷 직접 허용
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'k.kakaocdn.net', // 카카오 프로필 이미지
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'th-p.kakaocdn.net', // 카카오 프로필 썸네일
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.kakaocdn.net', // 카카오 모든 이미지 서브도메인 (HTTPS)
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '*.kakaocdn.net', // 카카오 모든 이미지 서브도메인 (HTTP)
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'shopping-phinf.pstatic.net', // 네이버 쇼핑 상품 이미지
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.pstatic.net', // 네이버 이미지 CDN 전체
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  serverExternalPackages: ['mongoose'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          },
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'production'
              ? "default-src *; media-src 'self' data:; script-src * 'unsafe-inline' 'unsafe-eval' blob: data: https://unpkg.com https://cdn.jsdelivr.net; style-src * 'unsafe-inline'; img-src * data: blob:; font-src *; connect-src * blob: data: https://unpkg.com https://cdn.jsdelivr.net; frame-src *; frame-ancestors *; base-uri *; form-action *; worker-src 'self' blob: data:;"
              : "default-src *; media-src 'self' data:; script-src * 'unsafe-inline' 'unsafe-eval' blob: data: https://unpkg.com https://cdn.jsdelivr.net; style-src * 'unsafe-inline'; img-src * data: blob:; font-src *; connect-src * blob: data: https://unpkg.com https://cdn.jsdelivr.net; frame-src *; frame-ancestors *; base-uri *; form-action *; worker-src 'self' blob: data:;",
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless', // require-corp에서 완화: 외부 이미지(CORS) 로드 허용
          },

        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
}

// [Force Restart] Firebase 초기화 로직 반영을 위한 강제 리로드 트리거 (한글)
module.exports = nextConfig
