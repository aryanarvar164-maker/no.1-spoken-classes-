/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Only used for images in /public. WebP alone halves host image-optimization usage vs WebP+AVIF.
    formats: ["image/webp"],
    // Add the host of any remote images here (e.g. a CDN or Cloudinary).
    // Images placed in /public need no entry.
    remotePatterns: [
      // Cloudinary images go straight to Cloudinary via components/CldImage.tsx;
      // this entry only matters if you pass a full Cloudinary URL to plain next/image.
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async headers() {
    return [
      {
        // Private owner editor: never indexed, never cached, never leaks its URL via Referer.
        source: "/owner/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
