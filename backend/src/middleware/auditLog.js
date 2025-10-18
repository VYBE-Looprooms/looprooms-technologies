const { ModerationLog } = require("../models");

/**
 * Audit log middleware
 * Logs important actions for security and compliance
 */
const auditLog = (action) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    // Override send function to log after response
    res.send = function (data) {
      // Log the action
      logAction(req, action, res.statusCode);

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Log action to database or file
 */
async function logAction(req, action, statusCode) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId: req.user?.id,
      userName: req.user?.name,
      looproomId: req.params.id || req.body.looproomId,
      targetUserId: req.body.targetUserId,
      statusCode,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      method: req.method,
      path: req.path,
      body: sanitizeLogData(req.body),
      query: req.query,
    };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("📝 Audit Log:", JSON.stringify(logEntry, null, 2));
    }

    // In production, you might want to:
    // 1. Store in a separate audit log database
    // 2. Send to a logging service (e.g., Winston, Loggly)
    // 3. Write to a file

    // For now, we'll just log critical actions
    if (isCriticalAction(action)) {
      // You can implement file logging or external service here
      console.log("🚨 CRITICAL ACTION:", logEntry);
    }
  } catch (error) {
    console.error("Failed to log audit entry:", error);
    // Don't throw error - logging failure shouldn't break the request
  }
}

/**
 * Sanitize sensitive data from logs
 */
function sanitizeLogData(data) {
  if (!data) return data;

  const sanitized = { ...data };

  // Remove sensitive fields
  const sensitiveFields = ["password", "token", "secret", "apiKey"];
  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]";
    }
  });

  return sanitized;
}

/**
 * Check if action is critical and needs special attention
 */
function isCriticalAction(action) {
  const criticalActions = [
    "ban_user",
    "delete_message",
    "end_session",
    "moderate_user",
    "delete_content",
    "update_settings",
  ];

  return criticalActions.includes(action);
}

/**
 * Get audit logs for a looproom
 */
async function getAuditLogs(looproomId, options = {}) {
  const {
    page = 1,
    limit = 50,
    action = null,
    userId = null,
    startDate = null,
    endDate = null,
  } = options;

  const whereClause = { looproomId };

  if (action) whereClause.action = action;
  if (userId) whereClause.moderatorId = userId;
  if (startDate) whereClause.createdAt = { [Op.gte]: startDate };
  if (endDate)
    whereClause.createdAt = { ...whereClause.createdAt, [Op.lte]: endDate };

  const offset = (page - 1) * limit;

  const { count, rows } = await ModerationLog.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        as: "moderator",
        attributes: ["id", "name", "type"],
      },
      {
        model: User,
        as: "targetUser",
        attributes: ["id", "name", "type"],
      },
    ],
  });

  return {
    logs: rows,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit),
    },
  };
}

module.exports = {
  auditLog,
  getAuditLogs,
  logAction,
};
