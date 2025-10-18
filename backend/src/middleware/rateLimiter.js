const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for message sending
 * Prevents spam by limiting messages per minute
 */
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 messages per minute
  message: {
    error: "Too many messages. Please slow down.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for creators
  skip: (req) => {
    return req.user && req.looproom && req.looproom.creatorId === req.user.id;
  },
});

/**
 * Rate limiter for moderation actions
 * Prevents abuse of moderation tools
 */
const moderationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 moderation actions per minute
  message: {
    error: "Too many moderation actions. Please wait.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for content uploads
 * Prevents spam uploads
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 uploads per minute
  message: {
    error: "Too many uploads. Please wait.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for session actions
 * Prevents rapid start/stop cycles
 */
const sessionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 session actions per minute
  message: {
    error: "Too many session actions. Please wait.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter
 * Applies to all API endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    error: "Too many requests. Please try again later.",
    retryAfter: 900,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  messageLimiter,
  moderationLimiter,
  uploadLimiter,
  sessionLimiter,
  apiLimiter,
};
