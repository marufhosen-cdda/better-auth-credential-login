// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // Remove these in production - they hide important errors
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: process.env.NODE_ENV === "development",
//   },

//   // External packages for server components (moved from experimental)
//   serverExternalPackages: [
//     "@prisma/client",
//     "prisma",
//     "@prisma/extension-accelerate",
//   ],
//   // Enable React strict mode
//   reactStrictMode: false,

//   // Image optimization
//   images: {
//     unoptimized: true, // Keep this if you don't need Next.js image optimization
//     // Or configure domains if you're using external images:
//     // domains: ['example.com', 'cdn.example.com'],
//   },

//   // Additional recommended settings for auth apps
//   // experimental: {
//   //   serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
//   // },

//   // Headers for security (optional but recommended)
//   async headers() {
//     return [
//       {
//         source: "/(.*)",
//         headers: [
//           {
//             key: "X-Frame-Options",
//             value: "DENY",
//           },
//           {
//             key: "X-Content-Type-Options",
//             value: "nosniff",
//           },
//           {
//             key: "Referrer-Policy",
//             value: "origin-when-cross-origin",
//           },
//         ],
//       },
//     ];
//   },
// };

// export default nextConfig;

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      resolveExtensions: [
        '.mdx',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.mjs',
        '.json',
      ],
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config: any, { isServer }: any) => {
    // Fix for VideoSDK's self is not defined error
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Add polyfills for VideoSDK
    config.resolve.alias = {
      ...config.resolve.alias,
      // Add any specific aliases if needed
    };

    return config;
  },
  // Enable static optimization
  output: 'standalone',

  // Environment variables
  env: {
    CUSTOM_KEY: 'videosdk-implementation',
  },

  // Headers for better VideoSDK compatibility
  async headers() {
    return [
      {
        source: '/video-meeting',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, display-capture=*'
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;