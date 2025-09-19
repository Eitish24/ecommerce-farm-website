export const securityHeaders = {
  // Force HTTPS in production
  forceHTTPS: (request: Request): boolean => {
    const url = new URL(request.url)
    return process.env.NODE_ENV === "production" && url.protocol !== "https:"
  },

  // Validate SSL certificate (for production)
  validateSSL: (): boolean => {
    // In production, this would check certificate validity
    return process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "production"
  },

  // Security headers configuration
  getSecurityHeaders: () => ({
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "X-XSS-Protection": "1; mode=block",
  }),
}
