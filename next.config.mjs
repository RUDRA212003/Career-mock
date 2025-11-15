/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      },
      {
         protocol: 'https',
        hostname: 'listgkwerjnsuqguvfcw.supabase.co', // ✅ correct Supabase project domain
        pathname: '/storage/v1/object/public/**',     // ✅ allows any file under public buckets
      },
    ],
  },
};

export default nextConfig;