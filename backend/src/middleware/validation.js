const Joi = require("joi");
const xss = require("xss");

/**
 * Sanitize HTML content to prevent XSS attacks
 */
const sanitizeHtml = (content) => {
  return xss(content, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script", "style"],
  });
};

/**
 * Validate and sanitize message content
 */
const validateMessage = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().min(1).max(1000).required().messages({
      "string.empty": "Message cannot be empty",
      "string.max": "Message is too long (max 1000 characters)",
      "any.required": "Message content is required",
    }),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.details[0].message,
    });
  }

  // Sanitize content
  req.body.content = sanitizeHtml(value.content.trim());

  // Check for empty content after sanitization
  if (!req.body.content) {
    return res.status(400).json({
      error: "Message content is invalid",
    });
  }

  next();
};

/**
 * Validate moderation action
 */
const validateModeration = (req, res, next) => {
  const schema = Joi.object({
    targetUserId: Joi.number().integer().positive().required(),
    action: Joi.string()
      .valid("mute", "unmute", "kick", "ban", "unban", "warn", "promote")
      .required(),
    reason: Joi.string().max(500).optional(),
    duration: Joi.number().integer().min(1).max(10080).optional(), // max 1 week
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.details[0].message,
    });
  }

  // Sanitize reason if provided
  if (value.reason) {
    req.body.reason = sanitizeHtml(value.reason.trim());
  }

  next();
};

/**
 * Validate content upload
 */
const validateContent = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(1000).optional(),
    type: Joi.string()
      .valid("video", "audio", "stream", "document", "image")
      .required(),
    url: Joi.string().uri().required(),
    thumbnailUrl: Joi.string().uri().optional(),
    duration: Joi.number().integer().min(0).optional(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.details[0].message,
    });
  }

  // Sanitize text fields
  req.body.title = sanitizeHtml(value.title.trim());
  if (value.description) {
    req.body.description = sanitizeHtml(value.description.trim());
  }

  next();
};

/**
 * Validate stream URL
 */
const validateStreamUrl = (req, res, next) => {
  const schema = Joi.object({
    streamUrl: Joi.string().uri().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.details[0].message,
    });
  }

  next();
};

/**
 * Validate settings update
 */
const validateSettings = (req, res, next) => {
  const schema = Joi.object({
    chatEnabled: Joi.boolean().optional(),
    slowModeSeconds: Joi.number().integer().min(0).max(300).optional(),
    maxParticipants: Joi.number().integer().min(1).max(10000).optional(),
  }).min(1); // At least one field required

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.details[0].message,
    });
  }

  next();
};

/**
 * Validate announcement
 */
const validateAnnouncement = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().min(1).max(500).required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.details[0].message,
    });
  }

  // Sanitize content
  req.body.content = sanitizeHtml(value.content.trim());

  next();
};

module.exports = {
  sanitizeHtml,
  validateMessage,
  validateModeration,
  validateContent,
  validateStreamUrl,
  validateSettings,
  validateAnnouncement,
};
