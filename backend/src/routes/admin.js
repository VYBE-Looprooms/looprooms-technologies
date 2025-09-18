const express = require("express");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const rateLimit = require("express-rate-limit");
const { Admin, Waitlist, ContactMessage, User } = require("../models");
const { Op } = require("sequelize");

const router = express.Router();

// Rate limiter for admin login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: "Too many login attempts",
    message: "Please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to verify admin JWT token
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findByPk(decoded.id);

    if (!admin || !admin.isActive) {
      return res
        .status(401)
        .json({ error: "Invalid token or admin account disabled." });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
};

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// POST /api/admin/login - Admin login
router.post("/login", loginLimiter, async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details[0].message,
      });
    }

    const { email, password } = value;

    // Find admin by email
    const admin = await Admin.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!admin) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        error: "Account disabled",
        message: "Your admin account has been disabled",
      });
    }

    // Validate password
    const isValidPassword = await admin.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Update last login
    await admin.update({ lastLoginAt: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        admin: admin.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Login failed. Please try again.",
    });
  }
});

// GET /api/admin/me - Get current admin info
router.get("/me", authenticateAdmin, async (req, res) => {
  res.json({
    success: true,
    data: req.admin.toJSON(),
  });
});

// GET /api/admin/dashboard - Dashboard statistics
router.get("/dashboard", authenticateAdmin, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Waitlist statistics
    const waitlistStats = await Waitlist.findAll({
      attributes: [
        [Waitlist.sequelize.fn("COUNT", "*"), "total"],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN type = 'user' THEN 1 END")
          ),
          "users",
        ],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN type = 'creator' THEN 1 END")
          ),
          "creators",
        ],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN created_at >= ? THEN 1 END")
          ),
          "today",
        ],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN created_at >= ? THEN 1 END")
          ),
          "thisWeek",
        ],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN created_at >= ? THEN 1 END")
          ),
          "thisMonth",
        ],
      ],
      replacements: [today, thisWeek, thisMonth],
      raw: true,
    });

    // Contact messages statistics
    const contactStats = await ContactMessage.findAll({
      attributes: [
        [ContactMessage.sequelize.fn("COUNT", "*"), "total"],
        [
          ContactMessage.sequelize.fn(
            "COUNT",
            ContactMessage.sequelize.literal(
              "CASE WHEN status = 'new' THEN 1 END"
            )
          ),
          "new",
        ],
        [
          ContactMessage.sequelize.fn(
            "COUNT",
            ContactMessage.sequelize.literal(
              "CASE WHEN status = 'in_progress' THEN 1 END"
            )
          ),
          "inProgress",
        ],
        [
          ContactMessage.sequelize.fn(
            "COUNT",
            ContactMessage.sequelize.literal(
              "CASE WHEN created_at >= ? THEN 1 END"
            )
          ),
          "today",
        ],
        [
          ContactMessage.sequelize.fn(
            "COUNT",
            ContactMessage.sequelize.literal(
              "CASE WHEN created_at >= ? THEN 1 END"
            )
          ),
          "thisWeek",
        ],
      ],
      replacements: [today, thisWeek],
      raw: true,
    });

    // Recent signups (last 10)
    const recentSignups = await Waitlist.findAll({
      order: [["createdAt", "DESC"]],
      limit: 10,
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "type",
        "location",
        "createdAt",
      ],
    });

    // Recent messages (last 5)
    const recentMessages = await ContactMessage.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
      attributes: [
        "id",
        "name",
        "email",
        "subject",
        "type",
        "status",
        "createdAt",
      ],
    });

    res.json({
      success: true,
      data: {
        waitlist: waitlistStats[0],
        contacts: contactStats[0],
        recentSignups,
        recentMessages,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      error: "Failed to fetch dashboard statistics",
    });
  }
});

// GET /api/admin/waitlist - Get waitlist with pagination and filters
router.get("/waitlist", authenticateAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      search,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filter by type
    if (type && ["user", "creator"].includes(type)) {
      whereClause.type = type;
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: waitlist } = await Waitlist.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    res.json({
      success: true,
      data: {
        waitlist,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Waitlist fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch waitlist",
    });
  }
});

// GET /api/admin/contacts - Get contact messages with pagination and filters
router.get("/contacts", authenticateAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      search,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filter by status
    if (
      status &&
      ["new", "in_progress", "resolved", "closed"].includes(status)
    ) {
      whereClause.status = status;
    }

    // Filter by type
    if (
      type &&
      ["general", "support", "partnership", "creator", "bug"].includes(type)
    ) {
      whereClause.type = type;
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: messages } = await ContactMessage.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Contact messages fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch contact messages",
    });
  }
});

// PUT /api/admin/contacts/:id/status - Update contact message status
router.put("/contacts/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["new", "in_progress", "resolved", "closed"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        message: "Status must be one of: new, in_progress, resolved, closed",
      });
    }

    const message = await ContactMessage.findByPk(id);
    if (!message) {
      return res.status(404).json({
        error: "Message not found",
      });
    }

    await message.update({ status });

    res.json({
      success: true,
      message: "Status updated successfully",
      data: message,
    });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({
      error: "Failed to update status",
    });
  }
});

// POST /api/admin/export/waitlist - Export waitlist to Excel
router.post("/export/waitlist", authenticateAdmin, async (req, res) => {
  try {
    const ExcelJS = require("exceljs");
    const { type, search } = req.body;
    const whereClause = {};

    if (type && ["user", "creator"].includes(type)) {
      whereClause.type = type;
    }

    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const waitlist = await Waitlist.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Vybe Admin";
    workbook.created = new Date();

    // Create worksheet
    const worksheet = workbook.addWorksheet("Waitlist", {
      properties: { tabColor: { argb: "FF3366CC" } },
    });

    // Define columns
    worksheet.columns = [
      { header: "First Name", key: "firstName", width: 15 },
      { header: "Last Name", key: "lastName", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "Type", key: "type", width: 10 },
      { header: "Location", key: "location", width: 20 },
      { header: "Signup Date", key: "createdAt", width: 20 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3366CC" },
    };

    // Add data rows
    waitlist.forEach((entry) => {
      worksheet.addRow({
        firstName: entry.firstName || "",
        lastName: entry.lastName || "",
        email: entry.email,
        type: entry.type,
        location: entry.location || "",
        createdAt: entry.createdAt.toISOString().split("T")[0],
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (column.eachCell) {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength > 50 ? 50 : maxLength;
      }
    });

    // Set response headers
    const filename = `vybe-waitlist-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({
      error: "Failed to export waitlist",
    });
  }
});

// POST /api/admin/export/contacts - Export contacts to Excel
router.post("/export/contacts", authenticateAdmin, async (req, res) => {
  try {
    const ExcelJS = require("exceljs");
    const {
      status,
      type,
      search,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.body;
    const whereClause = {};

    // Apply filters
    if (
      status &&
      ["new", "in_progress", "resolved", "closed"].includes(status)
    ) {
      whereClause.status = status;
    }

    if (
      type &&
      ["general", "support", "partnership", "creator", "bug"].includes(type)
    ) {
      whereClause.type = type;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const contacts = await ContactMessage.findAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Vybe Admin";
    workbook.created = new Date();

    // Create worksheet
    const worksheet = workbook.addWorksheet("Contact Messages", {
      properties: { tabColor: { argb: "FF9933CC" } },
    });

    // Define columns
    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Subject", key: "subject", width: 30 },
      { header: "Type", key: "type", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Message", key: "message", width: 50 },
      { header: "Date", key: "createdAt", width: 20 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF9933CC" },
    };

    // Add data rows
    contacts.forEach((contact) => {
      worksheet.addRow({
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        type: contact.type,
        status: contact.status,
        message: contact.message,
        createdAt: contact.createdAt.toISOString().split("T")[0],
      });
    });

    // Auto-fit columns (with max width limit)
    worksheet.columns.forEach((column) => {
      if (column.eachCell) {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength > 50 ? 50 : maxLength;
      }
    });

    // Set response headers
    const filename = `vybe-contacts-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export contacts error:", error);
    res.status(500).json({
      error: "Failed to export contacts",
    });
  }
});

// GET /api/admin/analytics - Advanced analytics data
router.get("/analytics", authenticateAdmin, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    // Growth metrics
    const waitlistGrowth = await Waitlist.findAll({
      attributes: [
        [
          Waitlist.sequelize.fn("DATE", Waitlist.sequelize.col("created_at")),
          "date",
        ],
        [Waitlist.sequelize.fn("COUNT", "*"), "signups"],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN type = 'user' THEN 1 END")
          ),
          "users",
        ],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN type = 'creator' THEN 1 END")
          ),
          "creators",
        ],
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      group: [
        Waitlist.sequelize.fn("DATE", Waitlist.sequelize.col("created_at")),
      ],
      order: [
        [
          Waitlist.sequelize.fn("DATE", Waitlist.sequelize.col("created_at")),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Contact message trends
    const contactTrends = await ContactMessage.findAll({
      attributes: [
        [
          ContactMessage.sequelize.fn(
            "DATE",
            ContactMessage.sequelize.col("created_at")
          ),
          "date",
        ],
        [ContactMessage.sequelize.fn("COUNT", "*"), "messages"],
        [
          ContactMessage.sequelize.fn(
            "COUNT",
            ContactMessage.sequelize.literal(
              "CASE WHEN type = 'support' THEN 1 END"
            )
          ),
          "support",
        ],
        [
          ContactMessage.sequelize.fn(
            "COUNT",
            ContactMessage.sequelize.literal(
              "CASE WHEN type = 'partnership' THEN 1 END"
            )
          ),
          "partnership",
        ],
        [
          ContactMessage.sequelize.fn(
            "COUNT",
            ContactMessage.sequelize.literal(
              "CASE WHEN type = 'creator' THEN 1 END"
            )
          ),
          "creator",
        ],
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      group: [
        ContactMessage.sequelize.fn(
          "DATE",
          ContactMessage.sequelize.col("created_at")
        ),
      ],
      order: [
        [
          ContactMessage.sequelize.fn(
            "DATE",
            ContactMessage.sequelize.col("created_at")
          ),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Geographic distribution
    const locationStats = await Waitlist.findAll({
      attributes: ["location", [Waitlist.sequelize.fn("COUNT", "*"), "count"]],
      where: {
        location: {
          [Op.ne]: null,
          [Op.ne]: "",
        },
      },
      group: ["location"],
      order: [[Waitlist.sequelize.fn("COUNT", "*"), "DESC"]],
      limit: 10,
      raw: true,
    });

    // User type distribution over time
    const typeDistribution = await Waitlist.findAll({
      attributes: [
        [
          Waitlist.sequelize.fn(
            "DATE_TRUNC",
            "week",
            Waitlist.sequelize.col("created_at")
          ),
          "week",
        ],
        "type",
        [Waitlist.sequelize.fn("COUNT", "*"), "count"],
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        },
      },
      group: [
        Waitlist.sequelize.fn(
          "DATE_TRUNC",
          "week",
          Waitlist.sequelize.col("created_at")
        ),
        "type",
      ],
      order: [
        [
          Waitlist.sequelize.fn(
            "DATE_TRUNC",
            "week",
            Waitlist.sequelize.col("created_at")
          ),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Contact message type distribution
    const messageTypeStats = await ContactMessage.findAll({
      attributes: [
        "type",
        [ContactMessage.sequelize.fn("COUNT", "*"), "count"],
        [
          ContactMessage.sequelize.fn(
            "COUNT",
            ContactMessage.sequelize.literal(
              "CASE WHEN status = 'resolved' THEN 1 END"
            )
          ),
          "resolved",
        ],
      ],
      group: ["type"],
      order: [[ContactMessage.sequelize.fn("COUNT", "*"), "DESC"]],
      raw: true,
    });

    // Response time analytics
    const responseTimeStats = await ContactMessage.findAll({
      attributes: [
        "type",
        [
          ContactMessage.sequelize.fn(
            "AVG",
            ContactMessage.sequelize.literal(
              "EXTRACT(EPOCH FROM (updated_at - created_at))/3600"
            )
          ),
          "avgResponseHours",
        ],
        [ContactMessage.sequelize.fn("COUNT", "*"), "totalMessages"],
      ],
      where: {
        status: {
          [Op.in]: ["resolved", "closed"],
        },
        updatedAt: {
          [Op.gt]: Waitlist.sequelize.col("created_at"),
        },
      },
      group: ["type"],
      raw: true,
    });

    // Conversion metrics (waitlist to different types)
    const conversionMetrics = await Waitlist.findAll({
      attributes: [
        [
          Waitlist.sequelize.fn(
            "DATE_TRUNC",
            "month",
            Waitlist.sequelize.col("created_at")
          ),
          "month",
        ],
        [Waitlist.sequelize.fn("COUNT", "*"), "total"],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN type = 'creator' THEN 1 END")
          ),
          "creators",
        ],
        [
          Waitlist.sequelize.literal(
            "ROUND((COUNT(CASE WHEN type = 'creator' THEN 1 END) * 100.0 / COUNT(*)), 2)"
          ),
          "creatorConversionRate",
        ],
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
        },
      },
      group: [
        Waitlist.sequelize.fn(
          "DATE_TRUNC",
          "month",
          Waitlist.sequelize.col("created_at")
        ),
      ],
      order: [
        [
          Waitlist.sequelize.fn(
            "DATE_TRUNC",
            "month",
            Waitlist.sequelize.col("created_at")
          ),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Peak activity hours
    const activityHours = await Waitlist.findAll({
      attributes: [
        [
          Waitlist.sequelize.fn(
            "EXTRACT",
            Waitlist.sequelize.literal("HOUR FROM created_at")
          ),
          "hour",
        ],
        [Waitlist.sequelize.fn("COUNT", "*"), "signups"],
      ],
      where: {
        createdAt: {
          [Op.gte]: thisMonth,
        },
      },
      group: [
        Waitlist.sequelize.fn(
          "EXTRACT",
          Waitlist.sequelize.literal("HOUR FROM created_at")
        ),
      ],
      order: [
        [
          Waitlist.sequelize.fn(
            "EXTRACT",
            Waitlist.sequelize.literal("HOUR FROM created_at")
          ),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Summary statistics with comparisons
    const currentStats = await Waitlist.findAll({
      attributes: [
        [Waitlist.sequelize.fn("COUNT", "*"), "totalSignups"],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN type = 'user' THEN 1 END")
          ),
          "totalUsers",
        ],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN type = 'creator' THEN 1 END")
          ),
          "totalCreators",
        ],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN created_at >= ? THEN 1 END")
          ),
          "todaySignups",
        ],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN created_at >= ? THEN 1 END")
          ),
          "weekSignups",
        ],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN created_at >= ? THEN 1 END")
          ),
          "monthSignups",
        ],
      ],
      replacements: [today, thisWeek, thisMonth],
      raw: true,
    });

    const previousStats = await Waitlist.findAll({
      attributes: [
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal(
              "CASE WHEN created_at >= ? AND created_at < ? THEN 1 END"
            )
          ),
          "yesterdaySignups",
        ],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal(
              "CASE WHEN created_at >= ? AND created_at < ? THEN 1 END"
            )
          ),
          "lastWeekSignups",
        ],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal(
              "CASE WHEN created_at >= ? AND created_at < ? THEN 1 END"
            )
          ),
          "lastMonthSignups",
        ],
      ],
      replacements: [
        yesterday,
        today,
        lastWeek,
        thisWeek,
        lastMonth,
        thisMonth,
      ],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        summary: {
          ...currentStats[0],
          ...previousStats[0],
        },
        growth: waitlistGrowth,
        contactTrends,
        locationStats,
        typeDistribution,
        messageTypeStats,
        responseTimeStats,
        conversionMetrics,
        activityHours,
      },
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch analytics data",
    });
  }
});

// POST /api/admin/forgot-password - Request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!admin) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message:
          "If an admin account with this email exists, a password reset code has been sent.",
      });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset code and expiration
    await admin.update({
      resetCode,
      resetExpires,
    });

    // Send reset email
    try {
      const { sendEmail } = require("../config/email");
      await sendEmail(email, "adminPasswordReset", {
        name: admin.name,
        resetCode,
        resetLink: `${
          process.env.FRONTEND_URL
        }/admin/reset-password?token=${resetCode}&email=${encodeURIComponent(
          email
        )}`,
      });
    } catch (emailError) {
      console.error("Password reset email failed:", emailError);
      return res.status(500).json({
        error: "Failed to send reset email",
      });
    }

    res.json({
      success: true,
      message:
        "If an admin account with this email exists, a password reset code has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// POST /api/admin/reset-password - Reset password with code
router.post("/reset-password", async (req, res) => {
  try {
    const { email, resetCode, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!email || !resetCode || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Find admin with valid reset code
    const admin = await Admin.findOne({
      where: {
        email: email.toLowerCase(),
        resetCode,
        resetExpires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!admin) {
      return res.status(400).json({
        error: "Invalid or expired reset code",
      });
    }

    // Update password and clear reset fields
    await admin.update({
      passwordHash: newPassword, // Will be hashed by the model hook
      resetCode: null,
      resetExpires: null,
    });

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// POST /api/admin/export/analytics - Export analytics report to Excel
router.post("/export/analytics", authenticateAdmin, async (req, res) => {
  try {
    const ExcelJS = require("exceljs");

    // Get analytics data (reuse the same logic from /analytics endpoint)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    // Growth metrics
    const waitlistGrowth = await Waitlist.findAll({
      attributes: [
        [
          Waitlist.sequelize.fn("DATE", Waitlist.sequelize.col("created_at")),
          "date",
        ],
        [Waitlist.sequelize.fn("COUNT", "*"), "signups"],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN type = 'user' THEN 1 END")
          ),
          "users",
        ],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN type = 'creator' THEN 1 END")
          ),
          "creators",
        ],
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
      group: [
        Waitlist.sequelize.fn("DATE", Waitlist.sequelize.col("created_at")),
      ],
      order: [
        [
          Waitlist.sequelize.fn("DATE", Waitlist.sequelize.col("created_at")),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Geographic distribution
    const locationStats = await Waitlist.findAll({
      attributes: ["location", [Waitlist.sequelize.fn("COUNT", "*"), "count"]],
      where: {
        location: {
          [Op.ne]: null,
          [Op.ne]: "",
        },
      },
      group: ["location"],
      order: [[Waitlist.sequelize.fn("COUNT", "*"), "DESC"]],
      raw: true,
    });

    // Contact message type distribution
    const messageTypeStats = await ContactMessage.findAll({
      attributes: [
        "type",
        [ContactMessage.sequelize.fn("COUNT", "*"), "count"],
        [
          ContactMessage.sequelize.fn(
            "COUNT",
            ContactMessage.sequelize.literal(
              "CASE WHEN status = 'resolved' THEN 1 END"
            )
          ),
          "resolved",
        ],
      ],
      group: ["type"],
      order: [[ContactMessage.sequelize.fn("COUNT", "*"), "DESC"]],
      raw: true,
    });

    // Summary statistics
    const currentStats = await Waitlist.findAll({
      attributes: [
        [Waitlist.sequelize.fn("COUNT", "*"), "totalSignups"],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN type = 'user' THEN 1 END")
          ),
          "totalUsers",
        ],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN type = 'creator' THEN 1 END")
          ),
          "totalCreators",
        ],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN created_at >= ? THEN 1 END")
          ),
          "todaySignups",
        ],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN created_at >= ? THEN 1 END")
          ),
          "weekSignups",
        ],
        [
          Waitlist.sequelize.fn(
            "COUNT",
            Waitlist.sequelize.literal("CASE WHEN created_at >= ? THEN 1 END")
          ),
          "monthSignups",
        ],
      ],
      replacements: [today, thisWeek, thisMonth],
      raw: true,
    });

    const contactStats = await ContactMessage.findAll({
      attributes: [
        [ContactMessage.sequelize.fn("COUNT", "*"), "totalMessages"],
        [
          ContactMessage.sequelize.fn(
            "COUNT",
            ContactMessage.sequelize.literal(
              "CASE WHEN status = 'new' THEN 1 END"
            )
          ),
          "newMessages",
        ],
        [
          ContactMessage.sequelize.fn(
            "COUNT",
            ContactMessage.sequelize.literal(
              "CASE WHEN status = 'resolved' THEN 1 END"
            )
          ),
          "resolvedMessages",
        ],
      ],
      raw: true,
    });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Vybe Analytics";
    workbook.created = new Date();

    // Overview Dashboard Sheet
    const overviewSheet = workbook.addWorksheet("📊 Dashboard", {
      properties: { tabColor: { argb: "FF1F2937" } },
    });

    // Create a visual dashboard layout
    overviewSheet.mergeCells("A1:H3");
    overviewSheet.getCell("A1").value = "🚀 VYBE PLATFORM ANALYTICS DASHBOARD";
    overviewSheet.getCell("A1").font = {
      bold: true,
      size: 24,
      color: { argb: "FFFFFFFF" },
    };
    overviewSheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    overviewSheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F2937" },
    };
    overviewSheet.getRow(1).height = 60;

    // Add report generation info
    overviewSheet.mergeCells("A4:H4");
    overviewSheet.getCell(
      "A4"
    ).value = `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    overviewSheet.getCell("A4").font = {
      italic: true,
      size: 12,
      color: { argb: "FF6B7280" },
    };
    overviewSheet.getCell("A4").alignment = { horizontal: "center" };

    // Key metrics cards layout
    const overviewStats = currentStats[0];
    const overviewContacts = contactStats[0];

    // Row 6-8: Key Metrics Cards
    const metricsData = [
      {
        label: "👥 Total Signups",
        value: overviewStats.totalSignups,
        color: "FF3B82F6",
        row: 6,
        col: 1,
      },
      {
        label: "🎨 Creators",
        value: overviewStats.totalCreators,
        color: "FF8B5CF6",
        row: 6,
        col: 3,
      },
      {
        label: "📈 This Month",
        value: overviewStats.monthSignups,
        color: "FF10B981",
        row: 6,
        col: 5,
      },
      {
        label: "💬 Messages",
        value: overviewContacts.totalMessages,
        color: "FFF59E0B",
        row: 6,
        col: 7,
      },
    ];

    metricsData.forEach((metric) => {
      // Merge cells for each metric card
      overviewSheet.mergeCells(
        metric.row,
        metric.col,
        metric.row + 2,
        metric.col + 1
      );
      const cell = overviewSheet.getCell(metric.row, metric.col);
      cell.value = `${metric.label}\n${metric.value}`;
      cell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: metric.color },
      };
      overviewSheet.getRow(metric.row).height = 25;
      overviewSheet.getRow(metric.row + 1).height = 25;
      overviewSheet.getRow(metric.row + 2).height = 25;
    });

    // Add conversion rate highlight
    overviewSheet.mergeCells("A10:H11");
    const conversionRate = Math.round(
      (overviewStats.totalCreators / overviewStats.totalSignups) * 100
    );
    overviewSheet.getCell(
      "A10"
    ).value = `🎯 Creator Conversion Rate: ${conversionRate}%`;
    overviewSheet.getCell("A10").font = {
      bold: true,
      size: 16,
      color: { argb: "FFFFFFFF" },
    };
    overviewSheet.getCell("A10").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    overviewSheet.getCell("A10").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb:
          conversionRate > 15
            ? "FF10B981"
            : conversionRate > 10
            ? "FFF59E0B"
            : "FFEF4444",
      },
    };
    overviewSheet.getRow(10).height = 30;

    // Add navigation guide
    overviewSheet.mergeCells("A13:H15");
    overviewSheet.getCell("A13").value =
      "📋 Report Sections:\n• Growth Trends - Daily signup patterns\n• Geographic Distribution - User locations\n• Message Analysis - Contact form insights";
    overviewSheet.getCell("A13").font = {
      size: 12,
      color: { argb: "FF374151" },
    };
    overviewSheet.getCell("A13").alignment = {
      horizontal: "left",
      vertical: "top",
      wrapText: true,
    };
    overviewSheet.getCell("A13").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF9FAFB" },
    };
    overviewSheet.getRow(13).height = 60;

    // Summary Sheet
    const summarySheet = workbook.addWorksheet("Summary", {
      properties: { tabColor: { argb: "FF4F46E5" } },
    });

    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 25 },
      { header: "Value", key: "value", width: 15 },
      { header: "Description", key: "description", width: 40 },
    ];

    // Style header
    summarySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    summarySheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };

    // Add summary data
    const summaryStats = currentStats[0];
    const summaryContacts = contactStats[0];

    summarySheet.addRows([
      {
        metric: "Total Signups",
        value: summaryStats.totalSignups,
        description: "All waitlist signups to date",
      },
      {
        metric: "Total Users",
        value: summaryStats.totalUsers,
        description: "Regular user signups",
      },
      {
        metric: "Total Creators",
        value: summaryStats.totalCreators,
        description: "Creator program signups",
      },
      {
        metric: "Creator Conversion Rate",
        value: `${Math.round(
          (summaryStats.totalCreators / summaryStats.totalSignups) * 100
        )}%`,
        description: "Percentage of signups choosing creator type",
      },
      {
        metric: "This Month Signups",
        value: summaryStats.monthSignups,
        description: "Signups in current month",
      },
      {
        metric: "This Week Signups",
        value: summaryStats.weekSignups,
        description: "Signups in current week",
      },
      {
        metric: "Today Signups",
        value: summaryStats.todaySignups,
        description: "Signups today",
      },
      {
        metric: "Total Messages",
        value: summaryContacts.totalMessages,
        description: "All contact form submissions",
      },
      {
        metric: "New Messages",
        value: summaryContacts.newMessages,
        description: "Unresolved contact messages",
      },
      {
        metric: "Resolved Messages",
        value: summaryContacts.resolvedMessages,
        description: "Successfully resolved messages",
      },
    ]);

    // Growth Trends Sheet
    const growthSheet = workbook.addWorksheet("Growth Trends", {
      properties: { tabColor: { argb: "FF10B981" } },
    });

    growthSheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Total Signups", key: "signups", width: 15 },
      { header: "Users", key: "users", width: 12 },
      { header: "Creators", key: "creators", width: 12 },
    ];

    // Style header
    growthSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    growthSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF10B981" },
    };

    // Add growth data
    waitlistGrowth.forEach((day) => {
      growthSheet.addRow({
        date: day.date,
        signups: day.signups,
        users: day.users,
        creators: day.creators,
      });
    });

    // Geographic Distribution Sheet
    const locationSheet = workbook.addWorksheet("Geographic Distribution", {
      properties: { tabColor: { argb: "FFF59E0B" } },
    });

    locationSheet.columns = [
      { header: "Location", key: "location", width: 30 },
      { header: "Signups", key: "count", width: 15 },
      { header: "Percentage", key: "percentage", width: 15 },
    ];

    // Style header
    locationSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    locationSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF59E0B" },
    };

    // Add location data with percentages
    const totalLocationSignups = locationStats.reduce(
      (sum, loc) => sum + parseInt(loc.count),
      0
    );
    locationStats.forEach((location) => {
      const percentage = Math.round(
        (location.count / totalLocationSignups) * 100
      );
      locationSheet.addRow({
        location: location.location,
        count: location.count,
        percentage: `${percentage}%`,
      });
    });

    // Message Types Sheet
    const messageSheet = workbook.addWorksheet("Message Types", {
      properties: { tabColor: { argb: "FF8B5CF6" } },
    });

    messageSheet.columns = [
      { header: "Message Type", key: "type", width: 20 },
      { header: "Total Messages", key: "count", width: 18 },
      { header: "Resolved", key: "resolved", width: 15 },
      { header: "Resolution Rate", key: "resolutionRate", width: 18 },
    ];

    // Style header
    messageSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    messageSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF8B5CF6" },
    };

    // Add message type data
    messageTypeStats.forEach((type) => {
      const resolutionRate =
        type.count > 0 ? Math.round((type.resolved / type.count) * 100) : 0;
      messageSheet.addRow({
        type: type.type.charAt(0).toUpperCase() + type.type.slice(1),
        count: type.count,
        resolved: type.resolved,
        resolutionRate: `${resolutionRate}%`,
      });
    });

    // Add visual enhancements and formatting
    [summarySheet, growthSheet, locationSheet, messageSheet].forEach(
      (sheet) => {
        // Auto-fit columns
        sheet.columns.forEach((column) => {
          if (column.eachCell) {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
              const columnLength = cell.value
                ? cell.value.toString().length
                : 10;
              if (columnLength > maxLength) {
                maxLength = columnLength;
              }
            });
            column.width =
              maxLength < 10 ? 10 : maxLength > 50 ? 50 : maxLength;
          }
        });

        // Add borders to all cells with data
        const lastRow = sheet.lastRow;
        if (lastRow) {
          for (let rowNum = 1; rowNum <= lastRow.number; rowNum++) {
            for (let colNum = 1; colNum <= sheet.columns.length; colNum++) {
              const cell = sheet.getCell(rowNum, colNum);
              cell.border = {
                top: { style: "thin", color: { argb: "FFE5E7EB" } },
                left: { style: "thin", color: { argb: "FFE5E7EB" } },
                bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
                right: { style: "thin", color: { argb: "FFE5E7EB" } },
              };
            }
          }
        }
      }
    );

    // Add visual indicators to Summary Sheet
    summarySheet.getCell("A1").value = "📊 VYBE ANALYTICS SUMMARY";
    summarySheet.mergeCells("A1:C1");
    summarySheet.getCell("A1").font = {
      bold: true,
      size: 16,
      color: { argb: "FFFFFFFF" },
    };
    summarySheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    summarySheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };
    summarySheet.getRow(1).height = 30;

    // Add headers row
    summarySheet.insertRow(2, ["Metric", "Value", "Description"]);
    summarySheet.getRow(2).font = { bold: true, color: { argb: "FFFFFFFF" } };
    summarySheet.getRow(2).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };

    // Add conditional formatting for values
    const valueColumn = summarySheet.getColumn("B");
    valueColumn.eachCell((cell, rowNumber) => {
      if (rowNumber > 2 && cell.value && typeof cell.value === "number") {
        if (cell.value > 100) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD1FAE5" }, // Light green
          };
        } else if (cell.value > 50) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFEF3C7" }, // Light yellow
          };
        }
      }
    });

    // Add growth trend chart data preparation
    if (waitlistGrowth.length > 0) {
      // Add a chart title row
      growthSheet.insertRow(1, ["📈 GROWTH TRENDS - LAST 90 DAYS"]);
      growthSheet.mergeCells("A1:D1");
      growthSheet.getCell("A1").font = {
        bold: true,
        size: 16,
        color: { argb: "FFFFFFFF" },
      };
      growthSheet.getCell("A1").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      growthSheet.getCell("A1").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF10B981" },
      };
      growthSheet.getRow(1).height = 30;

      // Update header row
      growthSheet.getRow(2).font = { bold: true, color: { argb: "FFFFFFFF" } };
      growthSheet.getRow(2).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF10B981" },
      };

      // Add data bars for visual representation
      const signupsColumn = growthSheet.getColumn("B");
      const maxSignups = Math.max(
        ...waitlistGrowth.map((d) => parseInt(d.signups))
      );

      signupsColumn.eachCell((cell, rowNumber) => {
        if (rowNumber > 2 && cell.value && typeof cell.value === "number") {
          const intensity = cell.value / maxSignups;
          if (intensity > 0.7) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FF10B981" }, // Green
            };
            cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
          } else if (intensity > 0.4) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FF84CC16" }, // Light green
            };
          } else if (intensity > 0.2) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFBBF24" }, // Yellow
            };
          }
        }
      });
    }

    // Add location chart enhancements
    if (locationStats.length > 0) {
      locationSheet.insertRow(1, ["🌍 GEOGRAPHIC DISTRIBUTION"]);
      locationSheet.mergeCells("A1:C1");
      locationSheet.getCell("A1").font = {
        bold: true,
        size: 16,
        color: { argb: "FFFFFFFF" },
      };
      locationSheet.getCell("A1").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      locationSheet.getCell("A1").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF59E0B" },
      };
      locationSheet.getRow(1).height = 30;

      // Update header row
      locationSheet.getRow(2).font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      locationSheet.getRow(2).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF59E0B" },
      };

      // Add visual bars for location data
      const maxLocationCount = Math.max(
        ...locationStats.map((l) => parseInt(l.count))
      );
      locationSheet.getColumn("B").eachCell((cell, rowNumber) => {
        if (rowNumber > 2 && cell.value && typeof cell.value === "number") {
          const intensity = cell.value / maxLocationCount;
          if (intensity > 0.8) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFDC2626" }, // Red
            };
            cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
          } else if (intensity > 0.6) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFEA580C" }, // Orange
            };
          } else if (intensity > 0.4) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF59E0B" }, // Yellow
            };
          } else if (intensity > 0.2) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: "FFFBBF24", // Light yellow
            };
          }
        }
      });
    }

    // Add message type enhancements
    if (messageTypeStats.length > 0) {
      messageSheet.insertRow(1, ["💬 MESSAGE TYPE ANALYSIS"]);
      messageSheet.mergeCells("A1:D1");
      messageSheet.getCell("A1").font = {
        bold: true,
        size: 16,
        color: { argb: "FFFFFFFF" },
      };
      messageSheet.getCell("A1").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      messageSheet.getCell("A1").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF8B5CF6" },
      };
      messageSheet.getRow(1).height = 30;

      // Update header row
      messageSheet.getRow(2).font = { bold: true, color: { argb: "FFFFFFFF" } };
      messageSheet.getRow(2).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF8B5CF6" },
      };

      // Add resolution rate visual indicators
      messageSheet.getColumn("D").eachCell((cell, rowNumber) => {
        if (
          rowNumber > 2 &&
          cell.value &&
          typeof cell.value === "string" &&
          cell.value.includes("%")
        ) {
          const percentage = parseInt(cell.value.replace("%", ""));
          if (percentage >= 80) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFD1FAE5" }, // Light green
            };
            cell.font = { color: { argb: "FF065F46" }, bold: true };
          } else if (percentage >= 60) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFEF3C7" }, // Light yellow
            };
          } else if (percentage < 40) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFECACA" }, // Light red
            };
          }
        }
      });
    }

    // Set response headers
    const filename = `vybe-analytics-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Analytics export error:", error);
    res.status(500).json({
      error: "Failed to export analytics report",
    });
  }
});

// POST /api/admin/export/all - Export all data to Excel with multiple sheets
router.post("/export/all", authenticateAdmin, async (req, res) => {
  try {
    const ExcelJS = require("exceljs");
    const { waitlistFilters = {}, contactFilters = {} } = req.body;

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // Set workbook properties
    workbook.creator = "Vybe Admin";
    workbook.lastModifiedBy = "Vybe Admin";
    workbook.created = new Date();
    workbook.modified = new Date();

    // Fetch waitlist data
    const waitlistWhereClause = {};
    if (
      waitlistFilters.type &&
      ["user", "creator"].includes(waitlistFilters.type)
    ) {
      waitlistWhereClause.type = waitlistFilters.type;
    }
    if (waitlistFilters.search) {
      waitlistWhereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${waitlistFilters.search}%` } },
        { lastName: { [Op.iLike]: `%${waitlistFilters.search}%` } },
        { email: { [Op.iLike]: `%${waitlistFilters.search}%` } },
        { location: { [Op.iLike]: `%${waitlistFilters.search}%` } },
      ];
    }

    const waitlist = await Waitlist.findAll({
      where: waitlistWhereClause,
      order: [["createdAt", "DESC"]],
    });

    // Fetch contact data
    const contactWhereClause = {};
    if (
      contactFilters.status &&
      ["new", "in_progress", "resolved", "closed"].includes(
        contactFilters.status
      )
    ) {
      contactWhereClause.status = contactFilters.status;
    }
    if (
      contactFilters.type &&
      ["general", "support", "partnership", "creator", "bug"].includes(
        contactFilters.type
      )
    ) {
      contactWhereClause.type = contactFilters.type;
    }
    if (contactFilters.search) {
      contactWhereClause[Op.or] = [
        { name: { [Op.iLike]: `%${contactFilters.search}%` } },
        { email: { [Op.iLike]: `%${contactFilters.search}%` } },
        { subject: { [Op.iLike]: `%${contactFilters.search}%` } },
        { message: { [Op.iLike]: `%${contactFilters.search}%` } },
      ];
    }

    const contacts = await ContactMessage.findAll({
      where: contactWhereClause,
      order: [["createdAt", "DESC"]],
    });

    // Create Waitlist sheet
    const waitlistSheet = workbook.addWorksheet("Waitlist", {
      properties: { tabColor: { argb: "FF3366CC" } },
    });

    // Add waitlist headers
    waitlistSheet.columns = [
      { header: "First Name", key: "firstName", width: 15 },
      { header: "Last Name", key: "lastName", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "Type", key: "type", width: 10 },
      { header: "Location", key: "location", width: 20 },
      { header: "Signup Date", key: "createdAt", width: 20 },
    ];

    // Style the header row
    waitlistSheet.getRow(1).font = { bold: true };
    waitlistSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3366CC" },
    };
    waitlistSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Add waitlist data
    waitlist.forEach((entry) => {
      waitlistSheet.addRow({
        firstName: entry.firstName || "",
        lastName: entry.lastName || "",
        email: entry.email,
        type: entry.type,
        location: entry.location || "",
        createdAt: entry.createdAt.toISOString().split("T")[0],
      });
    });

    // Create Contacts sheet
    const contactsSheet = workbook.addWorksheet("Contacts", {
      properties: { tabColor: { argb: "FF9933CC" } },
    });

    // Add contacts headers
    contactsSheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Subject", key: "subject", width: 30 },
      { header: "Type", key: "type", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Message", key: "message", width: 50 },
      { header: "Date", key: "createdAt", width: 20 },
    ];

    // Style the header row
    contactsSheet.getRow(1).font = { bold: true };
    contactsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF9933CC" },
    };
    contactsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Add contacts data
    contacts.forEach((contact) => {
      contactsSheet.addRow({
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        type: contact.type,
        status: contact.status,
        message: contact.message,
        createdAt: contact.createdAt.toISOString().split("T")[0],
      });
    });

    // Auto-fit columns
    waitlistSheet.columns.forEach((column) => {
      if (column.eachCell) {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength;
      }
    });

    contactsSheet.columns.forEach((column) => {
      if (column.eachCell) {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength > 50 ? 50 : maxLength;
      }
    });

    // Set response headers
    const filename = `vybe-data-${new Date().toISOString().split("T")[0]}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export all error:", error);
    res.status(500).json({
      error: "Failed to export data",
    });
  }
});

// PUT /api/admin/profile - Update admin profile
router.put("/profile", authenticateAdmin, async (req, res) => {
  try {
    const { name, email } = req.body;
    const admin = req.admin;

    const updates = {};
    
    if (name && name.trim()) {
      updates.name = name.trim();
    }

    if (email && email.trim()) {
      const emailLower = email.toLowerCase().trim();
      
      // Check if email is already taken by another admin
      if (emailLower !== admin.email) {
        const existingAdmin = await Admin.findOne({
          where: { 
            email: emailLower,
            id: { [Op.ne]: admin.id }
          }
        });
        
        if (existingAdmin) {
          return res.status(400).json({
            error: "Email already in use",
            message: "This email is already associated with another admin account"
          });
        }
        
        updates.email = emailLower;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "No valid updates provided"
      });
    }

    await admin.update(updates);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: admin.toJSON()
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Profile update failed. Please try again."
    });
  }
});

// PUT /api/admin/change-password - Change password
router.put("/change-password", authenticateAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const admin = req.admin;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: "All password fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: "New passwords do not match"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long"
      });
    }

    // Verify current password
    const isValidPassword = await admin.validatePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        error: "Current password is incorrect"
      });
    }

    // Update password
    await admin.update({
      passwordHash: newPassword // Will be hashed by the hook
    });

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Password change failed. Please try again."
    });
  }
});

// GET /api/admin/users - Get all users with pagination
router.get("/users", authenticateAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      search,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filter by type
    if (type && ["user", "creator", "admin"].includes(type)) {
      whereClause.type = type;
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: { exclude: ['passwordHash'] }
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch users",
    });
  }
});

// GET /api/admin/admins - Get all admins
router.get("/admins", authenticateAdmin, async (req, res) => {
  try {
    // Only super_admin can view all admins
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({
        error: "Access denied",
        message: "Only super admins can view admin accounts"
      });
    }

    const admins = await Admin.findAll({
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['passwordHash', 'resetCode'] }
    });

    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error("Admins fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch admins"
    });
  }
});

// POST /api/admin/forgot-password - Request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required"
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!admin) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: "If an admin account with this email exists, a password reset code has been sent."
      });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset code and expiration
    await admin.update({
      resetCode,
      resetExpires
    });

    // Send reset email
    try {
      const { sendEmail } = require("../config/email");
      const path = require("path");
      
      // Prepare logo attachment
      const logoPath = path.join(__dirname, '../../assets/Logo_To_Send.png');
      const attachments = [{
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo'
      }];
      
      await sendEmail(email, "adminPasswordReset", {
        name: admin.name,
        resetCode,
        resetLink: `${process.env.FRONTEND_URL}/admin/reset-password?token=${resetCode}&email=${encodeURIComponent(email)}`
      }, attachments);
    } catch (emailError) {
      console.error("Password reset email failed:", emailError);
      // Don't fail the request if email fails, for security
    }

    res.json({
      success: true,
      message: "If an admin account with this email exists, a password reset code has been sent."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Password reset request failed. Please try again."
    });
  }
});

// POST /api/admin/reset-password - Reset password with code
router.post("/reset-password", async (req, res) => {
  try {
    const { email, resetCode, newPassword, confirmPassword } = req.body;

    if (!email || !resetCode || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long"
      });
    }

    // Find admin with valid reset code
    const admin = await Admin.findOne({
      where: {
        email: email.toLowerCase(),
        resetCode,
        resetExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!admin) {
      return res.status(400).json({
        error: "Invalid or expired reset code"
      });
    }

    // Update password and clear reset fields
    await admin.update({
      passwordHash: newPassword, // Will be hashed by the model hook
      resetCode: null,
      resetExpires: null
    });

    res.json({
      success: true,
      message: "Password has been reset successfully"
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Password reset failed. Please try again."
    });
  }
});

// POST /api/admin/create-admin - Create new admin account
router.post("/create-admin", authenticateAdmin, async (req, res) => {
  try {
    // Only super_admin can create new admins
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({
        error: "Access denied",
        message: "Only super admins can create admin accounts"
      });
    }

    const { email, name, role = 'admin' } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        error: "Email and name are required"
      });
    }

    if (!['admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        error: "Invalid role. Must be 'admin' or 'moderator'"
      });
    }

    const emailLower = email.toLowerCase().trim();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: { email: emailLower }
    });

    if (existingAdmin) {
      return res.status(400).json({
        error: "Admin already exists",
        message: "An admin with this email already exists"
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    
    // Create admin account
    const newAdmin = await Admin.create({
      email: emailLower,
      name: name.trim(),
      role,
      passwordHash: tempPassword,
      isActive: true
    });

    // Send welcome email with login credentials
    try {
      const { sendEmail } = require("../config/email");
      const path = require("path");
      
      // Prepare logo attachment
      const logoPath = path.join(__dirname, '../../assets/Logo_To_Send.png');
      const attachments = [{
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo'
      }];
      
      const rolePermissions = {
        admin: `
          <li>Manage waitlist and contact messages</li>
          <li>View analytics and generate reports</li>
          <li>Export data and manage users</li>
          <li>Access all admin features</li>
        `,
        moderator: `
          <li>Manage waitlist and contact messages</li>
          <li>View basic analytics</li>
          <li>Moderate user content</li>
          <li>Limited admin access</li>
        `
      };

      await sendEmail(emailLower, "adminAccountCreated", {
        name: name.trim(),
        email: emailLower,
        role: role,
        roleLabel: role === 'admin' ? 'Admin' : 'Moderator',
        tempPassword: tempPassword,
        loginLink: `${process.env.FRONTEND_URL}/admin/login`,
        permissions: rolePermissions[role]
      }, attachments);

      console.log(`✅ Admin welcome email sent to ${emailLower}`);
    } catch (emailError) {
      console.error("Admin welcome email failed:", emailError);
      // Don't fail the request if email fails
    }
    
    res.json({
      success: true,
      message: "Admin account created successfully and welcome email sent",
      data: {
        admin: newAdmin.toJSON(),
        // Only return temp password if email failed (for development)
        ...(process.env.NODE_ENV === 'development' && { tempPassword })
      }
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create admin account"
    });
  }
});

// PUT /api/admin/admins/:id/status - Toggle admin status
router.put("/admins/:id/status", authenticateAdmin, async (req, res) => {
  try {
    // Only super_admin can modify admin status
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({
        error: "Access denied",
        message: "Only super admins can modify admin accounts"
      });
    }

    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        error: "isActive must be a boolean value"
      });
    }

    // Prevent deactivating self
    if (id === req.admin.id) {
      return res.status(400).json({
        error: "Cannot modify your own account status"
      });
    }

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({
        error: "Admin not found"
      });
    }

    // Prevent deactivating other super_admins
    if (admin.role === 'super_admin' && !isActive) {
      return res.status(400).json({
        error: "Cannot deactivate super admin accounts"
      });
    }

    await admin.update({ isActive });

    res.json({
      success: true,
      message: `Admin account ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: admin.toJSON()
    });
  } catch (error) {
    console.error("Admin status update error:", error);
    res.status(500).json({
      error: "Failed to update admin status"
    });
  }
});

module.exports = router;
