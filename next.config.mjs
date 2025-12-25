/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.freepik.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "cdn-icons-png.flaticon.com" },

      // Existing Supabase project
      {
        protocol: "https",
        hostname: "grtduudyzchqzffvcbtz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },

      // ✅ ADD THIS (current Supabase project)
      {
        protocol: "https",
        hostname: "listgkwerjnsuqguvfcw.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
