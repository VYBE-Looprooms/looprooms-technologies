const crypto = require("crypto");

/**
 * CSRF Protection Middleware
 * Generates and validates CSRF tokens
 */
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Skip CSRF for WebSocket connections
  if (req.headers.upgrade === "websocket") {
    return next();
  }

  // Get token from header or body
  const token = req.headers["x-csrf-token"] || req.body._csrf;

  // Get expected token from session or cookie
  const expectedToken = req.session?.csrfToken || req.cookies?.csrfToken;

  if (!token || !expectedToken || token !== expectedToken) {
    return res.status(403).json({
      error: "Invalid CSRF token",
    });
  }

  next();
};

/**
 * Generate CSRF token
 */
const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Set CSRF token in response
 */
const setCsrfToken = (req, res, next) => {
  if (!req.session?.csrfToken) {
    const token = generateCsrfToken();

    // Store in session if available
    if (req.session) {
      req.session.csrfToken = token;
    }

    // Also set as cookie
    res.cookie("csrfToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }

  next();
};

/**
 * Content Security Policy headers
 */
const setSecurityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' ws: wss:; " +
      "media-src 'self' https:; " +
      "frame-ancestors 'none';"
  );

  next();
};

/**
 * Validate request origin
 */
const validateOrigin = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "https://www.feelyourvybe.com",
    "https://feelyourvybe.com",
  ].filter(Boolean);

  // Allow requests without origin (same-origin)
  if (!origin) {
    return next();
  }

  if (allowedOrigins.includes(origin)) {
    return next();
  }

  return res.status(403).json({
    error: "Invalid origin",
  });
};

/**
 * Prevent parameter pollution
 */
const preventParameterPollution = (req, res, next) => {
  // Check for duplicate parameters
  const params = { ...req.query, ...req.body };

  for (const key in params) {
    if (Array.isArray(params[key]) && params[key].length > 1) {
      // Only allow arrays for specific parameters
      const allowedArrayParams = ["tags", "categories", "ids"];

      if (!allowedArrayParams.includes(key)) {
        return res.status(400).json({
          error: `Parameter pollution detected: ${key}`,
        });
      }
    }
  }

  next();
};

/**
 * Sanitize file uploads
 */
const sanitizeFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "audio/mpeg",
    "audio/wav",
    "application/pdf",
  ];

  const files = req.files || [req.file];

  for (const file of files) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: `File type not allowed: ${file.mimetype}`,
      });
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      return res.status(400).json({
        error: "File too large (max 100MB)",
      });
    }
  }

  next();
};

/**
 * Rate limit by IP
 */
const ipRateLimit = new Map();

const checkIpRateLimit = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!ipRateLimit.has(ip)) {
      ipRateLimit.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = ipRateLimit.get(ip);

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        error: "Too many requests from this IP",
      });
    }

    record.count++;
    next();
  };
};

// Clean up old IP records every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRateLimit.entries()) {
    if (now > record.resetTime) {
      ipRateLimit.delete(ip);
    }
  }
}, 60 * 60 * 1000);

module.exports = {
  csrfProtection,
  generateCsrfToken,
  setCsrfToken,
  setSecurityHeaders,
  validateOrigin,
  preventParameterPollution,
  sanitizeFileUpload,
  checkIpRateLimit,
};
