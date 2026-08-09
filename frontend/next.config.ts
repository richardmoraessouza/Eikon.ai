import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const allowedLocalOrigins = isDev
  ? [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
    ]
  : [];

// Ajuste os domínios abaixo para os que o Eikon realmente usa
// (API, Google OAuth, analytics, CDN de imagens, etc.)
const supabaseHosts = [
  "https://whydzqwlkhopyvxeclzs.supabase.co",
  "https://*.supabase.co",
];

const cspDirectives = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "https://accounts.google.com",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    // Next App Router and some analytics/runtime scripts use inline execution.
    // Keep this only if you are not using nonce-based CSP for inline scripts.
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
  ],
  "style-src": ["'self'", "'unsafe-inline'"], // muitas libs de CSS-in-JS exigem inline
  "img-src": ["'self'", "data:", "https:", ...supabaseHosts],
  "font-src": ["'self'", "data:"],
  "connect-src": [
    "'self'",
    ...allowedLocalOrigins,
    process.env.NEXT_PUBLIC_API_URL ?? "",
    "https://accounts.google.com",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    ...supabaseHosts,
  ].filter(Boolean),
  "frame-src": ["https://accounts.google.com", "https://www.googletagmanager.com"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'self'"],
  ...(isDev ? {} : { "upgrade-insecure-requests": [] }),
};

const cspHeader = Object.entries(cspDirectives)
  .map(([key, values]) =>
    values.length > 0 ? `${key} ${values.join(" ")}` : key
  )
  .join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspHeader,
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), geolocation=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "whydzqwlkhopyvxeclzs.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;