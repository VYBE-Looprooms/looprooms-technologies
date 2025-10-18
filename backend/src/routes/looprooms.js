const express = require("express");
const {
  Looproom,
  LooproomParticipant,
  User,
  AIContent,
  LooproomSession,
  LooproomMessage,
  ModerationLog,
  LooproomContent,
} = require("../models");
const { authenticateUser } = require("./auth");
const {
  checkCreatorPermission,
  checkModeratorPermission,
  checkParticipantPermission,
} = require("../middleware/permissions");
const Joi = require("joi");
const {
  generateAccessCode,
  generateShareableLink,
} = require("../utils/generateCode");

const router = express.Router();

// Validation schemas
const createLooproomSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(1000).optional(),
  category: Joi.string()
    .valid(
      "recovery",
      "meditation",
      "fitness",
      "healthy-living",
      "wellness",
      "music",
      "social",
      "productivity"
    )
    .required(),
  bannerUrl: Joi.string().uri().optional(),
  isAiAssisted: Joi.boolean().default(false),
  aiPersonality: Joi.object().optional(),
  maxParticipants: Joi.number().integer().min(1).max(1000).default(100),
  duration: Joi.number().integer().min(5).max(180).optional(),
  isPrivate: Joi.boolean().default(false),
  musicPlaylist: Joi.array().optional(),
  schedule: Joi.object().optional(),
  settings: Joi.object().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

// GET /api/looprooms - Get all active looprooms with filters
router.get("/", async (req, res) => {
  try {
    const {
      category,
      isLive,
      isAiAssisted,
      page = 1,
      limit = 20,
      sortBy = "participantCount",
      sortOrder = "DESC",
    } = req.query;

    const whereClause = { isActive: true };

    if (category) whereClause.category = category;
    if (isLive !== undefined) whereClause.isLive = isLive === "true";
    if (isAiAssisted !== undefined)
      whereClause.isAiAssisted = isAiAssisted === "true";

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: looprooms } = await Looproom.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "type", "avatarUrl"],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    res.json({
      success: true,
      data: {
        looprooms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get looprooms error:", error);
    res.status(500).json({
      error: "Failed to fetch looprooms",
    });
  }
});

// GET /api/looprooms/categories - Get looprooms grouped by category
router.get("/categories", async (req, res) => {
  try {
    const categories = await Looproom.findAll({
      where: { isActive: true },
      attributes: [
        "category",
        [Looproom.sequelize.fn("COUNT", "*"), "totalRooms"],
        [
          Looproom.sequelize.fn(
            "SUM",
            Looproom.sequelize.col("participant_count")
          ),
          "totalParticipants",
        ],
        [
          Looproom.sequelize.fn(
            "COUNT",
            Looproom.sequelize.literal("CASE WHEN is_live = true THEN 1 END")
          ),
          "liveRooms",
        ],
      ],
      group: ["category"],
      raw: true,
    });

    // Add AI room status for each category
    const categoriesWithAI = categories.map((category) => ({
      ...category,
      hasAIRoom: true, // All categories have AI rooms in our system
      aiRoomActive: true, // AI rooms are always active
    }));

    res.json({
      success: true,
      data: categoriesWithAI,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      error: "Failed to fetch categories",
    });
  }
});

// GET /api/looprooms/:id - Get specific looproom details
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const looproom = await Looproom.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "type", "avatarUrl", "bio"],
        },
        {
          model: LooproomParticipant,
          as: "participants",
          where: { isActive: true },
          required: false,
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name", "avatarUrl"],
            },
          ],
        },
      ],
    });

    if (!looproom) {
      return res.status(404).json({
        error: "Looproom not found",
      });
    }

    res.json({
      success: true,
      data: looproom,
    });
  } catch (error) {
    console.error("Get looproom error:", error);
    res.status(500).json({
      error: "Failed to fetch looproom",
    });
  }
});

// POST /api/looprooms - Create new looproom (creators only)
router.post("/", authenticateUser, async (req, res) => {
  try {
    // Validate input
    const { error, value } = createLooproomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details[0].message,
      });
    }

    // Check if user is a creator
    if (req.user.type !== "creator") {
      return res.status(403).json({
        error: "Only verified creators can create looprooms",
      });
    }

    // Generate access code if private
    let accessCode = null;
    if (value.isPrivate) {
      accessCode = generateAccessCode();
      // Ensure code is unique
      let codeExists = await Looproom.findOne({ where: { accessCode } });
      while (codeExists) {
        accessCode = generateAccessCode();
        codeExists = await Looproom.findOne({ where: { accessCode } });
      }
    }

    const looproom = await Looproom.create({
      ...value,
      creatorId: req.user.id,
      accessCode,
      isLive: false, // Creator needs to start the session
    });

    // Generate shareable link
    const shareableLink = generateShareableLink(looproom.id, accessCode);
    await looproom.update({ shareableLink });

    // Fetch the created looproom with creator info
    const createdLooproom = await Looproom.findByPk(looproom.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "type", "avatarUrl"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Looproom created successfully",
      data: {
        looproom: createdLooproom,
        accessCode: accessCode, // Only returned on creation
        shareableLink: shareableLink,
      },
    });
  } catch (error) {
    console.error("Create looproom error:", error);
    res.status(500).json({
      error: "Failed to create looproom",
    });
  }
});

// POST /api/looprooms/:id/join - Join a looproom
router.post("/:id/join", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { mood } = req.body;

    const looproom = await Looproom.findByPk(id);
    if (!looproom || !looproom.isActive) {
      return res.status(404).json({
        error: "Looproom not found or inactive",
      });
    }

    // Check if room is full
    if (looproom.participantCount >= looproom.maxParticipants) {
      return res.status(400).json({
        error: "Looproom is full",
      });
    }

    // Check if user is already in the room
    const existingParticipant = await LooproomParticipant.findOne({
      where: {
        looproomId: id,
        userId: req.user.id,
        isActive: true,
      },
    });

    if (existingParticipant) {
      return res.json({
        success: true,
        message: "Already in looproom",
        data: existingParticipant,
      });
    }

    // Add user to looproom
    const participant = await LooproomParticipant.create({
      looproomId: id,
      userId: req.user.id,
      metadata: {
        joinMood: mood,
        joinedVia: "direct",
      },
    });

    // Update participant count
    await looproom.increment("participantCount");
    await looproom.update({ lastActivityAt: new Date() });

    res.json({
      success: true,
      message: "Successfully joined looproom",
      data: participant,
    });
  } catch (error) {
    console.error("Join looproom error:", error);
    res.status(500).json({
      error: "Failed to join looproom",
    });
  }
});

// POST /api/looprooms/:id/leave - Leave a looproom
router.post("/:id/leave", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const participant = await LooproomParticipant.findOne({
      where: {
        looproomId: id,
        userId: req.user.id,
        isActive: true,
      },
    });

    if (!participant) {
      return res.status(404).json({
        error: "Not currently in this looproom",
      });
    }

    // Calculate time spent
    const timeSpent = Math.floor((new Date() - participant.joinedAt) / 1000);

    // Update participant record
    await participant.update({
      isActive: false,
      leftAt: new Date(),
      totalTimeSpent: participant.totalTimeSpent + timeSpent,
    });

    // Update looproom participant count
    const looproom = await Looproom.findByPk(id);
    if (looproom) {
      await looproom.decrement("participantCount");
    }

    res.json({
      success: true,
      message: "Successfully left looproom",
      data: {
        timeSpent,
        totalTimeSpent: participant.totalTimeSpent + timeSpent,
      },
    });
  } catch (error) {
    console.error("Leave looproom error:", error);
    res.status(500).json({
      error: "Failed to leave looproom",
    });
  }
});

// GET /api/looprooms/ai/:category - Get AI looproom for category
router.get("/ai/:category", async (req, res) => {
  try {
    const { category } = req.params;

    // Find or create AI looproom for this category
    let aiLooproom = await Looproom.findOne({
      where: {
        category,
        isAiAssisted: true,
        creatorId: null, // AI rooms have no creator
      },
    });

    if (!aiLooproom) {
      // Create AI looproom if it doesn't exist
      const aiPersonalities = {
        recovery: { name: "Hope", avatar: "🌱", voice: "supportive" },
        meditation: { name: "Zen", avatar: "🧘", voice: "calm" },
        fitness: { name: "Vigor", avatar: "💪", voice: "energetic" },
        "healthy-living": {
          name: "Nourish",
          avatar: "🥗",
          voice: "supportive",
        },
        wellness: { name: "Harmony", avatar: "✨", voice: "calm" },
      };

      const personality = aiPersonalities[category];
      if (!personality) {
        return res.status(400).json({
          error: "Invalid category for AI looproom",
        });
      }

      aiLooproom = await Looproom.create({
        name: `${personality.name}'s ${
          category.charAt(0).toUpperCase() + category.slice(1)
        } Room`,
        description: `AI-guided ${category} experience with ${personality.name}`,
        category,
        isAiAssisted: true,
        aiPersonality: personality,
        isLive: true, // AI rooms are always live
        maxParticipants: 1000, // AI rooms can handle more participants
        settings: {
          aiEnabled: true,
          autoContent: true,
          musicEnabled: true,
        },
      });
    }

    // Get current AI content for this room
    const currentContent = await AIContent.findOne({
      where: {
        category,
        isActive: true,
      },
      order: [["usageCount", "ASC"]], // Rotate content based on usage
    });

    res.json({
      success: true,
      data: {
        looproom: aiLooproom,
        currentContent,
        isActive: true,
      },
    });
  } catch (error) {
    console.error("Get AI looproom error:", error);
    res.status(500).json({
      error: "Failed to get AI looproom",
    });
  }
});

// POST /api/looprooms/join-private - Join a private looproom with access code
router.post("/join-private", authenticateUser, async (req, res) => {
  try {
    const { accessCode } = req.body;

    if (!accessCode) {
      return res.status(400).json({
        error: "Access code is required",
      });
    }

    // Find looproom by access code
    const looproom = await Looproom.findOne({
      where: {
        accessCode: accessCode.toUpperCase(),
        isActive: true,
        isPrivate: true,
      },
    });

    if (!looproom) {
      return res.status(404).json({
        error: "Invalid access code or room not found",
      });
    }

    res.json({
      success: true,
      looproomId: looproom.id,
      message: "Access granted",
    });
  } catch (error) {
    console.error("Join private looproom error:", error);
    res.status(500).json({
      error: "Failed to join private looproom",
    });
  }
});

// GET /api/looprooms/verify-code/:code - Verify access code
router.get("/verify-code/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const looproom = await Looproom.findOne({
      where: {
        accessCode: code.toUpperCase(),
        isActive: true,
        isPrivate: true,
      },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "type", "avatarUrl"],
        },
      ],
    });

    if (!looproom) {
      return res.status(404).json({
        success: false,
        error: "Invalid access code",
      });
    }

    res.json({
      success: true,
      looproom,
    });
  } catch (error) {
    console.error("Verify code error:", error);
    res.status(500).json({
      error: "Failed to verify code",
    });
  }
});

// ==================== SESSION MANAGEMENT ENDPOINTS ====================

// POST /api/looprooms/:id/start - Start a live session
router.post(
  "/:id/start",
  authenticateUser,
  checkCreatorPermission,
  async (req, res) => {
    try {
      const { streamUrl } = req.body;
      const looproom = req.looproom;

      // Check if room is already live
      if (looproom.isLive) {
        return res.status(400).json({
          error: "Looproom is already live",
        });
      }

      // Create new session
      const session = await LooproomSession.create({
        looproomId: looproom.id,
        startedAt: new Date(),
        status: "active",
        peakParticipants: looproom.participantCount || 0,
        totalMessages: 0,
      });

      // Update looproom
      await looproom.update({
        isLive: true,
        currentSessionId: session.id,
        streamUrl: streamUrl || looproom.streamUrl,
        lastActivityAt: new Date(),
      });

      // Emit socket event to all participants
      const io = req.app.get("io");
      if (io) {
        io.to(looproom.id).emit("session-started", {
          sessionId: session.id,
          startedAt: session.startedAt,
          streamUrl: looproom.streamUrl,
          message: `${req.user.name} has started the session!`,
        });
      }

      res.json({
        success: true,
        message: "Session started successfully",
        data: {
          session: {
            id: session.id,
            startedAt: session.startedAt,
            status: session.status,
          },
          looproom: {
            id: looproom.id,
            isLive: looproom.isLive,
            streamUrl: looproom.streamUrl,
          },
        },
      });
    } catch (error) {
      console.error("Start session error:", error);
      res.status(500).json({
        error: "Failed to start session",
      });
    }
  }
);

// POST /api/looprooms/:id/end - End the live session
router.post(
  "/:id/end",
  authenticateUser,
  checkCreatorPermission,
  async (req, res) => {
    try {
      const looproom = req.looproom;

      // Check if room is live
      if (!looproom.isLive) {
        return res.status(400).json({
          error: "Looproom is not currently live",
        });
      }

      // Get current session
      const session = await LooproomSession.findByPk(looproom.currentSessionId);

      if (!session) {
        return res.status(404).json({
          error: "Active session not found",
        });
      }

      // Calculate duration
      const endedAt = new Date();
      const duration = Math.floor(
        (endedAt - new Date(session.startedAt)) / 1000
      );

      // Update session
      await session.update({
        endedAt,
        duration,
        status: "ended",
      });

      // Update looproom
      await looproom.update({
        isLive: false,
        currentSessionId: null,
        lastActivityAt: new Date(),
      });

      // Emit socket event to all participants
      const io = req.app.get("io");
      if (io) {
        io.to(looproom.id).emit("session-ended", {
          sessionId: session.id,
          endedAt,
          duration,
          message: "The session has ended. Thank you for participating!",
        });

        // Disconnect all participants
        const sockets = await io.in(looproom.id).fetchSockets();
        sockets.forEach((socket) => {
          socket.leave(looproom.id);
        });
      }

      res.json({
        success: true,
        message: "Session ended successfully",
        data: {
          session: {
            id: session.id,
            startedAt: session.startedAt,
            endedAt: session.endedAt,
            duration: session.duration,
            peakParticipants: session.peakParticipants,
            totalMessages: session.totalMessages,
          },
        },
      });
    } catch (error) {
      console.error("End session error:", error);
      res.status(500).json({
        error: "Failed to end session",
      });
    }
  }
);

// POST /api/looprooms/:id/pause - Pause the session
router.post(
  "/:id/pause",
  authenticateUser,
  checkCreatorPermission,
  async (req, res) => {
    try {
      const looproom = req.looproom;

      if (!looproom.isLive) {
        return res.status(400).json({
          error: "Looproom is not currently live",
        });
      }

      const session = await LooproomSession.findByPk(looproom.currentSessionId);

      if (!session) {
        return res.status(404).json({
          error: "Active session not found",
        });
      }

      await session.update({ status: "paused" });

      // Emit socket event
      const io = req.app.get("io");
      if (io) {
        io.to(looproom.id).emit("session-paused", {
          message: "The session has been paused",
        });
      }

      res.json({
        success: true,
        message: "Session paused",
        data: { status: "paused" },
      });
    } catch (error) {
      console.error("Pause session error:", error);
      res.status(500).json({
        error: "Failed to pause session",
      });
    }
  }
);

// POST /api/looprooms/:id/resume - Resume the session
router.post(
  "/:id/resume",
  authenticateUser,
  checkCreatorPermission,
  async (req, res) => {
    try {
      const looproom = req.looproom;

      if (!looproom.isLive) {
        return res.status(400).json({
          error: "Looproom is not currently live",
        });
      }

      const session = await LooproomSession.findByPk(looproom.currentSessionId);

      if (!session) {
        return res.status(404).json({
          error: "Active session not found",
        });
      }

      await session.update({ status: "active" });

      // Emit socket event
      const io = req.app.get("io");
      if (io) {
        io.to(looproom.id).emit("session-resumed", {
          message: "The session has resumed",
        });
      }

      res.json({
        success: true,
        message: "Session resumed",
        data: { status: "active" },
      });
    } catch (error) {
      console.error("Resume session error:", error);
      res.status(500).json({
        error: "Failed to resume session",
      });
    }
  }
);

// GET /api/looprooms/:id/session - Get current session data
router.get("/:id/session", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const looproom = await Looproom.findByPk(id);

    if (!looproom) {
      return res.status(404).json({
        error: "Looproom not found",
      });
    }

    if (!looproom.currentSessionId) {
      return res.json({
        success: true,
        data: null,
        message: "No active session",
      });
    }

    const session = await LooproomSession.findByPk(looproom.currentSessionId);

    res.json({
      success: true,
      data: {
        id: session.id,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        duration: session.duration,
        status: session.status,
        peakParticipants: session.peakParticipants,
        totalMessages: session.totalMessages,
        isLive: looproom.isLive,
      },
    });
  } catch (error) {
    console.error("Get session error:", error);
    res.status(500).json({
      error: "Failed to get session data",
    });
  }
});

// ==================== CHAT MANAGEMENT ENDPOINTS ====================

// GET /api/looprooms/:id/messages - Get chat messages
router.get("/:id/messages", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, sessionId } = req.query;

    const looproom = await Looproom.findByPk(id);

    if (!looproom) {
      return res.status(404).json({
        error: "Looproom not found",
      });
    }

    const whereClause = { looproomId: id };

    // Filter by session if provided
    if (sessionId) {
      whereClause.sessionId = sessionId;
    }

    // Check if user is creator - they can see deleted messages
    const isCreator = looproom.creatorId === req.user.id;
    if (!isCreator) {
      whereClause.isDeleted = false;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: messages } = await LooproomMessage.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "type", "avatarUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      error: "Failed to get messages",
    });
  }
});

// DELETE /api/looprooms/:id/messages/:messageId - Delete a message
router.delete(
  "/:id/messages/:messageId",
  authenticateUser,
  checkModeratorPermission,
  async (req, res) => {
    try {
      const { messageId } = req.params;
      const looproom = req.looproom;

      const message = await LooproomMessage.findByPk(messageId);

      if (!message) {
        return res.status(404).json({
          error: "Message not found",
        });
      }

      if (message.looproomId !== looproom.id) {
        return res.status(403).json({
          error: "Message does not belong to this looproom",
        });
      }

      // Mark as deleted
      await message.update({
        isDeleted: true,
        deletedBy: req.user.id,
        deletedAt: new Date(),
      });

      // Log moderation action
      await ModerationLog.create({
        looproomId: looproom.id,
        moderatorId: req.user.id,
        targetUserId: message.userId,
        action: "delete_message",
        reason: "Message deleted by moderator",
        metadata: { messageId: message.id, content: message.content },
      });

      // Emit socket event
      const io = req.app.get("io");
      if (io) {
        io.to(looproom.id).emit("message-deleted", {
          messageId: message.id,
          deletedBy: req.user.id,
        });
      }

      res.json({
        success: true,
        message: "Message deleted successfully",
      });
    } catch (error) {
      console.error("Delete message error:", error);
      res.status(500).json({
        error: "Failed to delete message",
      });
    }
  }
);

// POST /api/looprooms/:id/messages/:messageId/pin - Pin a message
router.post(
  "/:id/messages/:messageId/pin",
  authenticateUser,
  checkCreatorPermission,
  async (req, res) => {
    try {
      const { messageId } = req.params;
      const looproom = req.looproom;

      const message = await LooproomMessage.findByPk(messageId);

      if (!message) {
        return res.status(404).json({
          error: "Message not found",
        });
      }

      if (message.looproomId !== looproom.id) {
        return res.status(403).json({
          error: "Message does not belong to this looproom",
        });
      }

      // Unpin previous pinned message
      await LooproomMessage.update(
        { isPinned: false },
        { where: { looproomId: looproom.id, isPinned: true } }
      );

      // Pin new message
      await message.update({ isPinned: true });

      // Emit socket event
      const io = req.app.get("io");
      if (io) {
        io.to(looproom.id).emit("message-pinned", {
          messageId: message.id,
          content: message.content,
          userId: message.userId,
          pinnedBy: req.user.id,
        });
      }

      res.json({
        success: true,
        message: "Message pinned successfully",
        data: message,
      });
    } catch (error) {
      console.error("Pin message error:", error);
      res.status(500).json({
        error: "Failed to pin message",
      });
    }
  }
);

module.exports = router;
