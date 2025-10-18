const {
  Looproom,
  LooproomParticipant,
  LooproomMessage,
  LooproomSession,
  User,
} = require("../../models");
const roomManager = require("../utils/roomManager");

/**
 * Register looproom-related socket event handlers
 * @param {Object} io - Socket.IO server instance
 * @param {Object} socket - Socket instance
 */
function registerLooproomHandlers(io, socket) {
  /**
   * Join a looproom
   */
  socket.on("join-looproom", async (data, callback) => {
    try {
      const { looproomId, mood } = data;
      const userId = socket.user.id;

      // Verify looproom exists and is active
      const looproom = await Looproom.findByPk(looproomId);
      if (!looproom || !looproom.isActive) {
        return callback({
          success: false,
          error: "Looproom not found or inactive",
        });
      }

      // Check if user is banned
      const participant = await LooproomParticipant.findOne({
        where: { looproomId, userId },
      });

      if (participant && participant.isBanned) {
        const isBanActive =
          !participant.bannedUntil ||
          new Date(participant.bannedUntil) > new Date();
        if (isBanActive) {
          return callback({
            success: false,
            error: "You are banned from this looproom",
          });
        }
      }

      // Join socket room
      socket.join(looproomId);

      // Add to room manager
      const stats = roomManager.joinRoom(looproomId, socket.id, {
        userId,
        name: socket.user.name,
        mood,
      });

      // Update or create participant record
      await LooproomParticipant.upsert({
        looproomId,
        userId,
        isActive: true,
        joinedAt: new Date(),
        leftAt: null,
        metadata: { mood, lastJoinedAt: new Date() },
      });

      // Update looproom participant count
      await looproom.update({
        participantCount: stats.participantCount,
        lastActivityAt: new Date(),
      });

      // Get current session if exists
      const currentSession = await LooproomSession.findOne({
        where: {
          looproomId,
          status: "active",
        },
      });

      // Get all participants for broadcast
      const allParticipants = roomManager.getRoomParticipants(looproomId);

      // Broadcast to room that user joined
      io.to(looproomId).emit("user-joined", {
        userId,
        name: socket.user.name,
        mood,
        participantCount: stats.participantCount,
        timestamp: new Date(),
      });

      // Broadcast updated participant list to all users in room
      io.to(looproomId).emit("participants-updated", {
        participants: allParticipants,
        participantCount: stats.participantCount,
      });

      // Send success response
      callback({
        success: true,
        data: {
          looproom: {
            id: looproom.id,
            name: looproom.name,
            isLive: looproom.isLive,
            streamUrl: looproom.streamUrl,
            chatEnabled: looproom.chatEnabled,
            slowModeSeconds: looproom.slowModeSeconds,
          },
          session: currentSession
            ? {
                id: currentSession.id,
                startedAt: currentSession.startedAt,
                status: currentSession.status,
              }
            : null,
          participantCount: stats.participantCount,
          participants: allParticipants,
        },
      });

      console.log(`✅ ${socket.user.name} joined looproom: ${looproom.name}`);
    } catch (error) {
      console.error("Error joining looproom:", error);
      callback({
        success: false,
        error: "Failed to join looproom",
      });
    }
  });

  /**
   * Leave a looproom
   */
  socket.on("leave-looproom", async (data, callback) => {
    try {
      const { looproomId } = data;
      const userId = socket.user.id;

      // Leave socket room
      socket.leave(looproomId);

      // Remove from room manager
      const userData = roomManager.leaveRoom(looproomId, socket.id);

      if (userData) {
        // Calculate time spent
        const timeSpent = Math.floor((Date.now() - userData.joinedAt) / 1000);

        // Update participant record
        const participant = await LooproomParticipant.findOne({
          where: { looproomId, userId },
        });

        if (participant) {
          await participant.update({
            isActive: false,
            leftAt: new Date(),
            totalTimeSpent: participant.totalTimeSpent + timeSpent,
          });
        }

        // Update looproom participant count
        const looproom = await Looproom.findByPk(looproomId);
        if (looproom) {
          const newCount = roomManager.getParticipantCount(looproomId);
          await looproom.update({
            participantCount: newCount,
            lastActivityAt: new Date(),
          });

          // Get updated participant list
          const updatedParticipants =
            roomManager.getRoomParticipants(looproomId);

          // Broadcast to room that user left
          io.to(looproomId).emit("user-left", {
            userId,
            name: socket.user.name,
            participantCount: newCount,
            timestamp: new Date(),
          });

          // Broadcast updated participant list
          io.to(looproomId).emit("participants-updated", {
            participants: updatedParticipants,
            participantCount: newCount,
          });
        }
      }

      if (callback) {
        callback({ success: true });
      }

      console.log(`❌ ${socket.user.name} left looproom`);
    } catch (error) {
      console.error("Error leaving looproom:", error);
      if (callback) {
        callback({
          success: false,
          error: "Failed to leave looproom",
        });
      }
    }
  });

  /**
   * Send a message in looproom chat
   */
  socket.on("send-message", async (data, callback) => {
    try {
      const { looproomId, content } = data;
      const userId = socket.user.id;

      // Verify user is in room
      if (!roomManager.isUserInRoom(looproomId, socket.id)) {
        return callback({
          success: false,
          error: "You are not in this looproom",
        });
      }

      // Check if user is muted
      const participant = await LooproomParticipant.findOne({
        where: { looproomId, userId },
      });

      if (participant && participant.isMuted) {
        const isMuteActive =
          !participant.mutedUntil ||
          new Date(participant.mutedUntil) > new Date();
        if (isMuteActive) {
          return callback({
            success: false,
            error: "You are muted in this looproom",
          });
        }
      }

      // Get looproom and check chat settings
      const looproom = await Looproom.findByPk(looproomId);
      if (!looproom || !looproom.chatEnabled) {
        return callback({
          success: false,
          error: "Chat is disabled in this looproom",
        });
      }

      // Get current session
      const session = await LooproomSession.findOne({
        where: { looproomId, status: "active" },
      });

      // Create message
      const message = await LooproomMessage.create({
        looproomId,
        sessionId: session ? session.id : null,
        userId,
        content: content.trim(),
        type: "message",
      });

      // Increment message count
      roomManager.incrementMessageCount(looproomId);
      if (session) {
        await session.increment("totalMessages");
      }

      // Update participant interaction count
      if (participant) {
        await participant.increment("interactionCount");
      }

      // Prepare message data
      const messageData = {
        id: message.id,
        content: message.content,
        userId,
        userName: socket.user.name,
        userType: socket.user.type,
        timestamp: message.createdAt,
        type: "message",
      };

      // Broadcast message to room
      io.to(looproomId).emit("new-message", messageData);

      // Send success response
      callback({
        success: true,
        data: messageData,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      callback({
        success: false,
        error: "Failed to send message",
      });
    }
  });

  /**
   * Typing indicator
   */
  socket.on("typing", (data) => {
    const { looproomId, isTyping } = data;

    // Broadcast typing status to room (except sender)
    socket.to(looproomId).emit("user-typing", {
      userId: socket.user.id,
      name: socket.user.name,
      isTyping,
    });
  });

  /**
   * React to a message
   */
  socket.on("react-to-message", async (data, callback) => {
    try {
      const { messageId, emoji } = data;
      const userId = socket.user.id;

      // Get message
      const message = await LooproomMessage.findByPk(messageId);
      if (!message) {
        return callback({
          success: false,
          error: "Message not found",
        });
      }

      // Update reactions
      const reactions = message.reactions || {};
      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }

      // Toggle reaction
      const userIndex = reactions[emoji].indexOf(userId);
      if (userIndex > -1) {
        reactions[emoji].splice(userIndex, 1);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      } else {
        reactions[emoji].push(userId);
      }

      await message.update({ reactions });

      // Broadcast reaction update
      io.to(message.looproomId).emit("message-reaction-updated", {
        messageId,
        reactions,
        userId,
        emoji,
      });

      callback({ success: true, data: { reactions } });
    } catch (error) {
      console.error("Error reacting to message:", error);
      callback({
        success: false,
        error: "Failed to react to message",
      });
    }
  });

  /**
   * Handle disconnect - clean up user from all rooms
   */
  socket.on("disconnecting", async () => {
    try {
      const rooms = Array.from(socket.rooms);

      for (const looproomId of rooms) {
        // Skip the socket's own room
        if (looproomId === socket.id) continue;

        // Leave the room
        const userData = roomManager.leaveRoom(looproomId, socket.id);

        if (userData) {
          const timeSpent = Math.floor((Date.now() - userData.joinedAt) / 1000);

          // Update participant
          const participant = await LooproomParticipant.findOne({
            where: { looproomId, userId: socket.user.id },
          });

          if (participant) {
            await participant.update({
              isActive: false,
              leftAt: new Date(),
              totalTimeSpent: participant.totalTimeSpent + timeSpent,
            });
          }

          // Update looproom count
          const looproom = await Looproom.findByPk(looproomId);
          if (looproom) {
            const newCount = roomManager.getParticipantCount(looproomId);
            await looproom.update({ participantCount: newCount });

            // Get updated participant list
            const updatedParticipants =
              roomManager.getRoomParticipants(looproomId);

            // Notify room
            io.to(looproomId).emit("user-left", {
              userId: socket.user.id,
              name: socket.user.name,
              participantCount: newCount,
              timestamp: new Date(),
            });

            // Broadcast updated participant list
            io.to(looproomId).emit("participants-updated", {
              participants: updatedParticipants,
              participantCount: newCount,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });
}

module.exports = { registerLooproomHandlers };

module.exports = { registerLooproomHandlers };
