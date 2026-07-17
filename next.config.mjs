import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "uploadthing.com" }
    ],
    formats: ["image/avif", "image/webp"]
  },

  // Production performance: compress responses
  compress: true,

  // Disable X-Powered-By header
  poweredByHeader: false,

  // Security + caching headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer policy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions policy — restrict powerful APIs
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()"
          },
          // HSTS — only active in production
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload"
                }
              ]
            : []),
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js inline scripts + Clerk + PostHog
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.clerk.dev https://*.clerk.accounts.dev https://app.posthog.com https://cdn.jsdelivr.net",
              // Styles: self + inline (Tiptap, Tailwind)
              "style-src 'self' 'unsafe-inline'",
              // Images: self + data URIs + Unsplash + Clerk avatars
              "img-src 'self' data: blob: https://images.unsplash.com https://img.clerk.com",
              // Fonts: self
              "font-src 'self' data:",
              // API connections: self + Clerk + Stripe + PostHog + Sentry + OpenAI
              "connect-src 'self' https://*.clerk.accounts.dev https://api.stripe.com https://app.posthog.com https://o*.ingest.sentry.io https://api.openai.com wss://*.clerk.accounts.dev",
              // Frames: Stripe
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              // Workers for Sentry
              "worker-src 'self' blob:",
              "base-uri 'self'",
              "form-action 'self'"
            ].join("; ")
          }
        ]
      },
      // Cache static assets aggressively
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
        ]
      },
      // Fonts
      {
        source: "/fonts/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
        ]
      }
    ];
  }
};

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
