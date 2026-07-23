import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

// 固定 Turbopack 工作区根目录，避免主目录下存在多余 lockfile 时被误判
const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  // 产出 standalone 产物，便于自托管 Node 服务器（不影响 Vercel / Netlify）
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              // 浏览器侧只同源访问 /api/generate；服务端对 OpenRouter 的请求不受 CSP 限制
              "connect-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
