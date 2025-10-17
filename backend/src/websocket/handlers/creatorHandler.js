const {
  Looproom,
  LooproomSession,
  LooproomMessage,
  LooproomParticipant,
  ModerationLog,
  User,
} = require("../../models");
const roomManager = require("../utils/roomManager");

/**
 * Check if user is creator of the looproom
 */
async function isCreator(userId, looproomId) {
  const looproom = await Looproom.findByPk(looproomId);
  return looproom && looproom.creatorId === userId;
}

/**
 * Check if user is moderator in the looproom
 */
async function isModerator(userId, looproomId) {
  const participant = await LooproomParticipant.findOne({
    where: { looproomId, userId },
  });
  return participant && participant.role === "moderator";
}

/**
 * Register creator-specific socket event handlers
 * @param {Object} io - Socket.IO server instance
 * @param {Object} socket - Socket instance
 */
function registerCreatorHandlers(io, socket) {
  /**
   * Start a looproom session
   */
  socket.on("start-session", async (data, callback) => {
    try {
      const { looproomId, streamUrl } = data;
      const userId = socket.user.id;

      // Verify user is creator
      if (!(await isCreator(userId, looproomId))) {
        return callback({
          success: false,
          error: "Only the creator can start a session",
        });
      }

      // Get looproom
      const looproom = await Looproom.findByPk(looproomId);
      if (!looproom) {
        return callback({
          success: false,
          error: "Looproom not found",
        });
      }

      // Check if already live
      if (looproom.isLive) {
        return callback({
          success: false,
          error: "Session is already active",
        });
      }

      // Create new session
      const session = await LooproomSession.create({
        looproomId,
        startedAt: new Date(),
        status: "active",
        streamUrl: streamUrl || null,
      });

      // Update looproom
      await looproom.update({
        isLive: true,
        currentSessionId: session.id,
        streamUrl: streamUrl || looproom.streamUrl,
        lastActivityAt: new Date(),
      });

      // Broadcast to all participants
      io.to(looproomId).emit("session-started", {
        sessionId: session.id,
        startedAt: session.startedAt,
        streamUrl: looproom.streamUrl,
        creatorName: socket.user.name,
      });

      // Send system message
      const systemMessage = await LooproomMessage.create({
        looproomId,
        sessionId: session.id,
        userId: socket.user.id,
        content: `${socket.user.name} started the session`,
        type: "system",
      });

      io.to(looproomId).emit("new-message", {
        id: systemMessage.id,
        content: systemMessage.content,
        type: "system",
        timestamp: systemMessage.createdAt,
      });

      callback({
        success: true,
        data: {
          sessionId: session.id,
          startedAt: session.startedAt,
        },
      });

      console.log(`🎬 Session started for looproom: ${looproom.name}`);
    } catch (error) {
      console.error("Error starting session:", error);
      callback({
        success: false,
        error: "Failed to start session",
      });
    }
  });

  /**
   * End a looproom session
   */
  socket.on("end-session", async (data, callback) => {
    try {
      const { looproomId } = data;
      const userId = socket.user.id;

      // Verify user is creator
      if (!(await isCreator(userId, looproomId))) {
        return callback({
          success: false,
          error: "Only the creator can end a session",
        });
      }

      // Get looproom and session
      const looproom = await Looproom.findByPk(looproomId);
      if (!looproom || !looproom.isLive) {
        return callback({
          success: false,
          error: "No active session found",
        });
      }

      const session = await LooproomSession.findByPk(looproom.currentSessionId);
      if (!session) {
        return callback({
          success: false,
          error: "Session not found",
        });
      }

      // Calculate duration
      const duration = Math.floor(
        (Date.now() - new Date(session.startedAt).getTime()) / 1000
      );

      // Get room stats
      const stats = roomManager.getRoomStats(looproomId);

      // Update session
      await session.update({
        endedAt: new Date(),
        duration,
        status: "ended",
        peakParticipants: stats ? stats.peakParticipants : 0,
        totalMessages: stats ? stats.messageCount : 0,
      });

      // Update looproom
      await looproom.update({
        isLive: false,
        currentSessionId: null,
        lastActivityAt: new Date(),
      });

      // Broadcast to all participants
      io.to(looproomId).emit("session-ended", {
        sessionId: session.id,
        endedAt: session.endedAt,
        duration,
        stats: {
          peakParticipants: session.peakParticipants,
          totalMessages: session.totalMessages,
        },
      });

      // Send system message
      const systemMessage = await LooproomMessage.create({
        looproomId,
        sessionId: session.id,
        userId: socket.user.id,
        content: `${socket.user.name} ended the session`,
        type: "system",
      });

      io.to(looproomId).emit("new-message", {
        id: systemMessage.id,
        content: systemMessage.content,
        type: "system",
        timestamp: systemMessage.createdAt,
      });

      callback({
        success: true,
        data: {
          sessionId: session.id,
          duration,
          stats: {
            peakParticipants: session.peakParticipants,
            totalMessages: session.totalMessages,
          },
        },
      });

      console.log(`🛑 Session ended for looproom: ${looproom.name}`);
    } catch (error) {
      console.error("Error ending session:", error);
      callback({
        success: false,
        error: "Failed to end session",
      });
    }
  });

  /**
   * Pause a session
   */
  socket.on("pause-session", async (data, callback) => {
    try {
      const { looproomId } = data;
      const userId = socket.user.id;

      if (!(await isCreator(userId, looproomId))) {
        return callback({
          success: false,
          error: "Only the creator can pause a session",
        });
      }

      const looproom = await Looproom.findByPk(looproomId);
      const session = await LooproomSession.findByPk(looproom.currentSessionId);

      if (!session || session.status !== "active") {
        return callback({
          success: false,
          error: "No active session to pause",
        });
      }

      await session.update({ status: "paused" });

      io.to(looproomId).emit("session-paused", {
        sessionId: session.id,
        timestamp: new Date(),
      });

      callback({ success: true });
    } catch (error) {
      console.error("Error pausing session:", error);
      callback({ success: false, error: "Failed to pause session" });
    }
  });

  /**
   * Resume a session
   */
  socket.on("resume-session", async (data, callback) => {
    try {
      const { looproomId } = data;
      const userId = socket.user.id;

      if (!(await isCreator(userId, looproomId))) {
        return callback({
          success: false,
          error: "Only the creator can resume a session",
        });
      }

      const looproom = await Looproom.findByPk(looproomId);
      const session = await LooproomSession.findByPk(looproom.currentSessionId);

      if (!session || session.status !== "paused") {
        return callback({
          success: false,
          error: "No paused session to resume",
        });
      }

      await session.update({ status: "active" });

      io.to(looproomId).emit("session-resumed", {
        sessionId: session.id,
        timestamp: new Date(),
      });

      callback({ success: true });
    } catch (error) {
      console.error("Error resuming session:", error);
      callback({ success: false, error: "Failed to resume session" });
    }
  });

  /**
   * Update stream URL
   */
  socket.on("update-stream", async (data, callback) => {
    try {
      const { looproomId, streamUrl } = data;
      const userId = socket.user.id;

      if (!(await isCreator(userId, looproomId))) {
        return callback({
          success: false,
          error: "Only the creator can update stream",
        });
      }

      const looproom = await Looproom.findByPk(looproomId);
      await looproom.update({ streamUrl });

      io.to(looproomId).emit("stream-updated", {
        streamUrl,
        timestamp: new Date(),
      });

      callback({ success: true });
    } catch (error) {
      console.error("Error updating stream:", error);
      callback({ success: false, error: "Failed to update stream" });
    }
  });

  /**
   * Moderate a user (mute, kick, ban)
   */
  socket.on("moderate-user", async (data, callback) => {
    try {
      const { looproomId, targetUserId, action, reason, duration } = data;
      const userId = socket.user.id;

      // Verify permissions
      const hasPermission =
        (await isCreator(userId, looproomId)) ||
        (await isModerator(userId, looproomId));

      if (!hasPermission) {
        return callback({
          success: false,
          error: "You do not have permission to moderate",
        });
      }

      // Get target participant
      const participant = await LooproomParticipant.findOne({
        where: { looproomId, userId: targetUserId },
      });

      if (!participant) {
        return callback({
          success: false,
          error: "Participant not found",
        });
      }

      // Calculate expiry if duration provided
      let expiresAt = null;
      if (duration) {
        expiresAt = new Date(Date.now() + duration * 60 * 1000);
      }

      // Execute moderation action
      switch (action) {
        case "mute":
          await participant.update({
            isMuted: true,
            mutedUntil: expiresAt,
          });
          break;

        case "unmute":
          await participant.update({
            isMuted: false,
            mutedUntil: null,
          });
          break;

        case "kick":
          await participant.update({ isActive: false });
          // Force disconnect user's socket
          const targetSockets = await io.in(looproomId).fetchSockets();
          for (const targetSocket of targetSockets) {
            if (targetSocket.user.id === targetUserId) {
              targetSocket.leave(looproomId);
              targetSocket.emit("kicked-from-room", { looproomId, reason });
            }
          }
          break;

        case "ban":
          await participant.update({
            isBanned: true,
            bannedUntil: expiresAt,
            isActive: false,
          });
          // Force disconnect
          const bannedSockets = await io.in(looproomId).fetchSockets();
          for (const targetSocket of bannedSockets) {
            if (targetSocket.user.id === targetUserId) {
              targetSocket.leave(looproomId);
              targetSocket.emit("banned-from-room", {
                looproomId,
                reason,
                expiresAt,
              });
            }
          }
          break;

        case "unban":
          await participant.update({
            isBanned: false,
            bannedUntil: null,
          });
          break;

        default:
          return callback({
            success: false,
            error: "Invalid moderation action",
          });
      }

      // Log moderation action
      await ModerationLog.create({
        looproomId,
        moderatorId: userId,
        targetUserId,
        action,
        reason,
        duration,
        expiresAt,
      });

      // Broadcast moderation action
      io.to(looproomId).emit("user-moderated", {
        targetUserId,
        action,
        moderatorName: socket.user.name,
        timestamp: new Date(),
      });

      callback({ success: true });

      console.log(
        `⚖️ ${socket.user.name} ${action} user ${targetUserId} in looproom`
      );
    } catch (error) {
      console.error("Error moderating user:", error);
      callback({
        success: false,
        error: "Failed to moderate user",
      });
    }
  });

  /**
   * Delete a message
   */
  socket.on("delete-message", async (data, callback) => {
    try {
      const { messageId, looproomId } = data;
      const userId = socket.user.id;

      // Verify permissions
      const hasPermission =
        (await isCreator(userId, looproomId)) ||
        (await isModerator(userId, looproomId));

      if (!hasPermission) {
        return callback({
          success: false,
          error: "You do not have permission to delete messages",
        });
      }

      // Get and update message
      const message = await LooproomMessage.findByPk(messageId);
      if (!message) {
        return callback({
          success: false,
          error: "Message not found",
        });
      }

      await message.update({
        isDeleted: true,
        deletedBy: userId,
        deletedAt: new Date(),
      });

      // Log moderation action
      await ModerationLog.create({
        looproomId,
        moderatorId: userId,
        targetUserId: message.userId,
        action: "delete_message",
        metadata: { messageId, content: message.content },
      });

      // Broadcast message deletion
      io.to(looproomId).emit("message-deleted", {
        messageId,
        deletedBy: userId,
        timestamp: new Date(),
      });

      callback({ success: true });
    } catch (error) {
      console.error("Error deleting message:", error);
      callback({
        success: false,
        error: "Failed to delete message",
      });
    }
  });

  /**
   * Pin a message
   */
  socket.on("pin-message", async (data, callback) => {
    try {
      const { messageId, looproomId } = data;
      const userId = socket.user.id;

      if (!(await isCreator(userId, looproomId))) {
        return callback({
          success: false,
          error: "Only the creator can pin messages",
        });
      }

      // Unpin previous pinned message
      await LooproomMessage.update(
        { isPinned: false },
        { where: { looproomId, isPinned: true } }
      );

      // Pin new message
      const message = await LooproomMessage.findByPk(messageId);
      if (!message) {
        return callback({
          success: false,
          error: "Message not found",
        });
      }

      await message.update({ isPinned: true });

      // Broadcast pinned message
      io.to(looproomId).emit("message-pinned", {
        messageId,
        content: message.content,
        userId: message.userId,
        timestamp: new Date(),
      });

      callback({ success: true });
    } catch (error) {
      console.error("Error pinning message:", error);
      callback({ success: false, error: "Failed to pin message" });
    }
  });

  /**
   * Send announcement
   */
  socket.on("send-announcement", async (data, callback) => {
    try {
      const { looproomId, content } = data;
      const userId = socket.user.id;

      if (!(await isCreator(userId, looproomId))) {
        return callback({
          success: false,
          error: "Only the creator can send announcements",
        });
      }

      const looproom = await Looproom.findByPk(looproomId);
      const session = await LooproomSession.findByPk(looproom.currentSessionId);

      const announcement = await LooproomMessage.create({
        looproomId,
        sessionId: session ? session.id : null,
        userId,
        content,
        type: "announcement",
      });

      io.to(looproomId).emit("new-message", {
        id: announcement.id,
        content: announcement.content,
        userId,
        userName: socket.user.name,
        type: "announcement",
        timestamp: announcement.createdAt,
      });

      callback({ success: true });
    } catch (error) {
      console.error("Error sending announcement:", error);
      callback({ success: false, error: "Failed to send announcement" });
    }
  });
}

module.exports = { registerCreatorHandlers };
