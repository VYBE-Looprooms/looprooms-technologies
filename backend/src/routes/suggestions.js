const express = require("express");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { sendEmail } = require("../config/email");
const { LooproomSuggestion, Admin } = require("../models");
const path = require("path");

const router = express.Router();

// Health check endpoint (no auth required)
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Suggestions API is working",
    timestamp: new Date().toISOString(),
  });
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

// Rate limiter for suggestions
const suggestionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 suggestions per hour per IP
  message: {
    error: "Rate limit exceeded",
    message: "Too many suggestions submitted. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schema
const suggestionSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
  email: Joi.string().email().required(),
  country: Joi.string().min(1).max(100).required(),
  looproomName: Joi.string().min(1).max(100).required(),
  purpose: Joi.string().min(10).max(2000).required(),
});

// POST /api/suggestions - Submit Looproom suggestion
router.post("/", suggestionLimiter, async (req, res) => {
  try {
    // Validate input
    const { error, value } = suggestionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details[0].message,
      });
    }

    const { firstName, lastName, email, country, looproomName, purpose } =
      value;

    console.log("Received suggestion data:", {
      firstName,
      lastName,
      email,
      country,
      looproomName,
      purpose,
    });

    // Check if user has already suggested this Looproom name
    const existingSuggestion = await LooproomSuggestion.findOne({
      where: {
        email,
        looproomName: looproomName.toLowerCase(),
      },
    });

    if (existingSuggestion) {
      return res.status(409).json({
        error: "Duplicate suggestion",
        message: "You have already suggested a Looproom with this name!",
      });
    }

    // Insert into database
    const newSuggestion = await LooproomSuggestion.create({
      firstName,
      lastName,
      email,
      country,
      looproomName,
      purpose,
      status: "new",
    });

    console.log("Created suggestion:", newSuggestion.toJSON());

    // Prepare logo attachment
    const logoPath = path.join(__dirname, "../../assets/Logo_To_Send.png");
    const attachments = [
      {
        filename: "logo.png",
        path: logoPath,
        cid: "logo",
      },
    ];

    // Send confirmation email to user
    try {
      await sendEmail(
        email,
        "suggestionConfirmation",
        {
          name: firstName,
          looproomName,
          purpose:
            purpose.substring(0, 200) + (purpose.length > 200 ? "..." : ""),
        },
        attachments
      );
      console.log("✅ Confirmation email sent successfully");
    } catch (emailError) {
      console.error("❌ Confirmation email failed:", emailError);
    }

    // Send notification email to team
    try {
      const teamEmail = process.env.CONTACT_EMAIL || "contact@vybe.com";

      await sendEmail(teamEmail, "suggestionNotification", {
        firstName,
        lastName,
        email,
        country,
        looproomName,
        purpose,
        id: newSuggestion.id,
        timestamp: newSuggestion.createdAt.toLocaleString(),
      });
      console.log("✅ Team notification email sent successfully");
    } catch (emailError) {
      console.error("❌ Team notification email failed:", emailError);
    }

    res.status(201).json({
      success: true,
      message:
        "Looproom suggestion submitted successfully! We'll review it and get back to you.",
      data: {
        id: newSuggestion.id,
        looproomName: newSuggestion.looproomName,
        status: newSuggestion.status,
        createdAt: newSuggestion.createdAt,
      },
    });
  } catch (error) {
    console.error("Suggestion submission error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to submit suggestion. Please try again.",
    });
  }
});

// GET /api/suggestions/stats - Get suggestion statistics (admin only)
router.get("/stats", authenticateAdmin, async (req, res) => {
  try {
    console.log("Stats endpoint called by admin:", req.admin?.email);
    const sequelize = require("../config/database");

    // Check if table exists and has data
    const tableExists = await LooproomSuggestion.findOne().catch(() => null);
    console.log("Table check result:", tableExists ? "exists" : "not found");

    // Get basic counts by status
    const totalCount = await LooproomSuggestion.count();
    const newCount = await LooproomSuggestion.count({
      where: { status: "new" },
    });
    const reviewingCount = await LooproomSuggestion.count({
      where: { status: "reviewing" },
    });
    const approvedCount = await LooproomSuggestion.count({
      where: { status: "approved" },
    });
    const rejectedCount = await LooproomSuggestion.count({
      where: { status: "rejected" },
    });
    const implementedCount = await LooproomSuggestion.count({
      where: { status: "implemented" },
    });

    // Get time-based counts
    const { Op } = require("sequelize");
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayCount = await LooproomSuggestion.count({
      where: {
        createdAt: {
          [Op.gte]: oneDayAgo,
        },
      },
    });

    const thisWeekCount = await LooproomSuggestion.count({
      where: {
        createdAt: {
          [Op.gte]: oneWeekAgo,
        },
      },
    });

    const stats = [
      {
        total: totalCount,
        new: newCount,
        reviewing: reviewingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        implemented: implementedCount,
        today: todayCount,
        thisWeek: thisWeekCount,
      },
    ];

    console.log("Stats query result:", stats[0]);

    res.json({
      success: true,
      data: stats[0] || {
        total: 0,
        new: 0,
        reviewing: 0,
        approved: 0,
        rejected: 0,
        implemented: 0,
        today: 0,
        thisWeek: 0,
      },
    });
  } catch (error) {
    console.error("Suggestion stats error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Failed to fetch suggestion statistics",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/suggestions - Get all suggestions (admin only)
router.get("/", authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;

    // Search functionality
    if (search) {
      const { Op } = require("sequelize");
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { looproomName: { [Op.iLike]: `%${search}%` } },
        { country: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: suggestions } =
      await LooproomSuggestion.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
      });

    res.json({
      success: true,
      data: {
        suggestions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Suggestions fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch suggestions",
    });
  }
});

// PUT /api/suggestions/:id/status - Update suggestion status (admin only)
router.put("/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = [
      "new",
      "reviewing",
      "approved",
      "rejected",
      "implemented",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        message: "Status must be one of: " + validStatuses.join(", "),
      });
    }

    const suggestion = await LooproomSuggestion.findByPk(id);
    if (!suggestion) {
      return res.status(404).json({
        error: "Suggestion not found",
      });
    }

    await suggestion.update({
      status,
      adminNotes: adminNotes || suggestion.adminNotes,
    });

    // Send status update email to user for all status changes except 'new'
    if (status !== "new") {
      try {
        const logoPath = path.join(__dirname, "../../assets/Logo_To_Send.png");
        const attachments = [
          {
            filename: "logo.png",
            path: logoPath,
            cid: "logo",
          },
        ];

        const statusConfig = {
          reviewing: {
            message:
              "Your Looproom suggestion is now under review by our team. We'll keep you updated on the progress!",
            title: "👀 Under Review",
            bgColor: "#F59E0B",
            bgGradient: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
            extraContent:
              "Our team is carefully reviewing your suggestion. We'll update you soon with our decision!",
          },
          approved: {
            message:
              "Great news! Your Looproom suggestion has been approved and is now in development!",
            title: "🎉 Your Looproom is in Development!",
            bgColor: "#10B981",
            bgGradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
            extraContent:
              "We're excited to bring your vision to life! You'll be notified when your Looproom goes live and you'll earn your exclusive Founder's Badge.",
          },
          rejected: {
            message:
              "Thank you for your suggestion. After careful review, we've decided not to move forward with this Looproom at this time. We appreciate your contribution and encourage you to submit other ideas!",
            title: "Thank You for Your Suggestion",
            bgColor: "#6B7280",
            bgGradient: "linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)",
            extraContent:
              "While this particular idea won't be moving forward, we value your creativity and encourage you to submit other Looproom ideas in the future!",
          },
          implemented: {
            message:
              "Congratulations! Your Looproom suggestion has been implemented and is now live on Vybe! You've earned your Founder's Badge!",
            title: "🏆 Congratulations! Your Founder's Badge Awaits!",
            bgColor: "#8B5CF6",
            bgGradient: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
            extraContent:
              "Your Looproom is now live on Vybe! As the founder, you've earned an exclusive Founder's Badge with special recognition, early creator perks, and priority visibility in our ecosystem!",
          },
        };

        const config = statusConfig[status];

        await sendEmail(
          suggestion.email,
          "suggestionStatusUpdate",
          {
            name: suggestion.firstName,
            looproomName: suggestion.looproomName,
            status: status,
            statusMessage: config.message,
            statusTitle: config.title,
            statusBgGradient: config.bgGradient,
            statusExtraContent: config.extraContent,
            adminNotes: adminNotes || "",
          },
          attachments
        );
      } catch (emailError) {
        console.error("Status update email failed:", emailError);
      }
    }

    res.json({
      success: true,
      message: "Suggestion status updated successfully",
      data: suggestion,
    });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({
      error: "Failed to update suggestion status",
    });
  }
});

module.exports = router;
