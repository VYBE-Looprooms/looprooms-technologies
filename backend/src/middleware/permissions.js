const { Looproom, LooproomParticipant } = require("../models");

/**
 * Check if user is the creator of the looproom
 */
const checkCreatorPermission = async (req, res, next) => {
  try {
    const { id } = req.params;

    const looproom = await Looproom.findByPk(id);

    if (!looproom) {
      return res.status(404).json({
        error: "Looproom not found",
      });
    }

    if (looproom.creatorId !== req.user.id) {
      return res.status(403).json({
        error: "Only the creator can perform this action",
      });
    }

    // Attach looproom to request for use in route handler
    req.looproom = looproom;
    next();
  } catch (error) {
    console.error("Creator permission check error:", error);
    res.status(500).json({
      error: "Failed to verify permissions",
    });
  }
};

/**
 * Check if user is creator or moderator of the looproom
 */
const checkModeratorPermission = async (req, res, next) => {
  try {
    const { id } = req.params;

    const looproom = await Looproom.findByPk(id);

    if (!looproom) {
      return res.status(404).json({
        error: "Looproom not found",
      });
    }

    // Check if user is creator
    if (looproom.creatorId === req.user.id) {
      req.looproom = looproom;
      req.isModerator = true;
      return next();
    }

    // Check if user is a moderator
    const participant = await LooproomParticipant.findOne({
      where: {
        looproomId: id,
        userId: req.user.id,
      },
    });

    if (participant && participant.isModerator) {
      req.looproom = looproom;
      req.isModerator = true;
      return next();
    }

    return res.status(403).json({
      error: "Only creators and moderators can perform this action",
    });
  } catch (error) {
    console.error("Moderator permission check error:", error);
    res.status(500).json({
      error: "Failed to verify permissions",
    });
  }
};

/**
 * Check if user is a participant in the looproom
 */
const checkParticipantPermission = async (req, res, next) => {
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
      return res.status(403).json({
        error: "You must be a participant to perform this action",
      });
    }

    // Check if user is banned
    if (participant.isBanned) {
      const isBanActive =
        !participant.bannedUntil ||
        new Date(participant.bannedUntil) > new Date();
      if (isBanActive) {
        return res.status(403).json({
          error: "You are banned from this looproom",
        });
      }
    }

    req.participant = participant;
    next();
  } catch (error) {
    console.error("Participant permission check error:", error);
    res.status(500).json({
      error: "Failed to verify permissions",
    });
  }
};

module.exports = {
  checkCreatorPermission,
  checkModeratorPermission,
  checkParticipantPermission,
};
