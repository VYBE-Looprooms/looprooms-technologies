const roomManager = require("../utils/roomManager");

/**
 * Register WebRTC signaling event handlers
 * @param {Object} io - Socket.IO server instance
 * @param {Object} socket - Socket instance
 */
function registerWebRTCHandlers(io, socket) {
  /**
   * Creator starts broadcasting
   */
  socket.on("start-broadcast", async (data) => {
    try {
      const { looproomId, streamConfig } = data;
      const userId = socket.user.id;

      console.log(
        `📹 ${socket.user.name} started broadcasting in room ${looproomId}`
      );
      console.log("Stream config:", streamConfig);

      // Store broadcaster info in room manager
      roomManager.setBroadcaster(looproomId, {
        userId,
        socketId: socket.id,
        streamConfig,
      });

      // Notify all viewers in the room
      socket.to(looproomId).emit("broadcast-started", {
        broadcasterId: userId,
        broadcasterName: socket.user.name,
        streamConfig,
      });
    } catch (error) {
      console.error("Error starting broadcast:", error);
    }
  });

  /**
   * Creator stops broadcasting
   */
  socket.on("stop-broadcast", async (data) => {
    try {
      const { looproomId } = data;

      console.log(
        `🛑 ${socket.user.name} stopped broadcasting in room ${looproomId}`
      );

      // Remove broadcaster info
      roomManager.removeBroadcaster(looproomId);

      // Notify all viewers
      socket.to(looproomId).emit("broadcast-ended", {
        broadcasterId: socket.user.id,
      });
    } catch (error) {
      console.error("Error stopping broadcast:", error);
    }
  });

  /**
   * Viewer requests to join stream
   */
  socket.on("request-stream", async (data) => {
    try {
      const { looproomId } = data;
      const userId = socket.user.id;

      console.log(
        `📺 ${socket.user.name} requesting stream in room ${looproomId}`
      );

      // Get broadcaster info
      const broadcaster = roomManager.getBroadcaster(looproomId);
      if (!broadcaster) {
        console.log("No active broadcaster in room");
        return;
      }

      // Notify broadcaster about new viewer
      io.to(broadcaster.socketId).emit("viewer-joined-stream", {
        userId,
        userName: socket.user.name,
      });
    } catch (error) {
      console.error("Error requesting stream:", error);
    }
  });

  /**
   * WebRTC Offer (Creator -> Viewer)
   */
  socket.on("webrtc-offer", async (data) => {
    try {
      const { looproomId, targetUserId, offer } = data;

      console.log(
        `📤 Sending WebRTC offer to user ${targetUserId} in room ${looproomId}`
      );

      // Find target user's socket
      const sockets = await io.in(looproomId).fetchSockets();
      const targetSocket = sockets.find((s) => s.user.id === targetUserId);

      if (targetSocket) {
        targetSocket.emit("webrtc-offer", {
          offer,
          broadcasterId: socket.user.id,
        });
      } else {
        console.log(`Target user ${targetUserId} not found in room`);
      }
    } catch (error) {
      console.error("Error sending WebRTC offer:", error);
    }
  });

  /**
   * WebRTC Answer (Viewer -> Creator)
   */
  socket.on("webrtc-answer", async (data) => {
    try {
      const { looproomId, answer } = data;
      const userId = socket.user.id;

      console.log(
        `📥 Received WebRTC answer from user ${userId} in room ${looproomId}`
      );

      // Get broadcaster
      const broadcaster = roomManager.getBroadcaster(looproomId);
      if (!broadcaster) {
        console.log("No active broadcaster");
        return;
      }

      // Send answer to broadcaster
      io.to(broadcaster.socketId).emit("webrtc-answer", {
        answer,
        userId,
      });
    } catch (error) {
      console.error("Error sending WebRTC answer:", error);
    }
  });

  /**
   * ICE Candidate exchange
   */
  socket.on("ice-candidate", async (data) => {
    try {
      const { looproomId, candidate, targetUserId } = data;

      console.log(`🧊 ICE candidate exchange in room ${looproomId}`);

      if (targetUserId) {
        // Send to specific user
        const sockets = await io.in(looproomId).fetchSockets();
        const targetSocket = sockets.find((s) => s.user.id === targetUserId);

        if (targetSocket) {
          targetSocket.emit("ice-candidate", {
            candidate,
            userId: socket.user.id,
          });
        }
      } else {
        // Broadcast to room (fallback)
        socket.to(looproomId).emit("ice-candidate", {
          candidate,
          userId: socket.user.id,
        });
      }
    } catch (error) {
      console.error("Error exchanging ICE candidate:", error);
    }
  });

  /**
   * Request quality change
   */
  socket.on("request-quality-change", async (data) => {
    try {
      const { looproomId, quality } = data;

      console.log(
        `🎚️ ${socket.user.name} requested quality change to ${quality}`
      );

      // Get broadcaster
      const broadcaster = roomManager.getBroadcaster(looproomId);
      if (broadcaster) {
        io.to(broadcaster.socketId).emit("quality-change-requested", {
          userId: socket.user.id,
          quality,
        });
      }
    } catch (error) {
      console.error("Error requesting quality change:", error);
    }
  });
}

module.exports = { registerWebRTCHandlers };
