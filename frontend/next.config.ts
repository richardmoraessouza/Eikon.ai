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
const cspDirectives = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "https://accounts.google.com",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    // 'unsafe-inline' só em dev, se necessário para hot-reload.
    // Em produção, evite — prefira nonces se precisar de inline script.
    ...(isDev ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
  ],
  "style-src": ["'self'", "'unsafe-inline'"], // muitas libs de CSS-in-JS exigem inline
  "img-src": ["'self'", "data:", "https:"],   // ajuste "https:" para domínios específicos se possível
  "font-src": ["'self'", "data:"],
  "connect-src": [
    "'self'",
    ...allowedLocalOrigins,
    process.env.NEXT_PUBLIC_API_URL ?? "",
    "https://accounts.google.com",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
  ].filter(Boolean),
  "frame-src": ["https://accounts.google.com", "https://www.googletagmanager.com"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'self'"],
  "upgrade-insecure-requests": [],
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
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
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