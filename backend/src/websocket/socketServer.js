const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * Initialize Socket.IO server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.IO server instance
 */
function initializeSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        console.warn("Socket connection attempt without token");
        return next(new Error("Authentication: Token required"));
      }

      // Verify JWT token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (jwtError) {
        console.error("JWT verification failed:", jwtError.message);
        return next(new Error("Authentication: Invalid token"));
      }

      // Get user from database
      // Support both 'id' and 'userId' for backwards compatibility
      const userId = decoded.userId || decoded.id;

      if (!userId) {
        console.error("No user ID found in token:", decoded);
        return next(new Error("Authentication: Invalid token format"));
      }

      const user = await User.findByPk(userId, {
        attributes: ["id", "name", "email", "type", "verified"],
      });

      if (!user) {
        console.error(`User not found for ID: ${userId}`);
        return next(new Error("Authentication: User not found"));
      }

      // Attach user to socket
      socket.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        verified: user.verified,
      };

      console.log(`✅ Socket authenticated: ${user.name} (${user.id})`);
      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      return next(new Error("Authentication: Failed"));
    }
  });

  // Import handlers
  const { registerLooproomHandlers } = require("./handlers/looproomHandler");
  const { registerCreatorHandlers } = require("./handlers/creatorHandler");

  // Connection handler
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.user.id})`);

    // Store user's socket ID for direct messaging
    socket.userId = socket.user.id;

    // Register event handlers
    registerLooproomHandlers(io, socket);
    registerCreatorHandlers(io, socket);

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(
        `❌ User disconnected: ${socket.user.name} - Reason: ${reason}`
      );
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
}

module.exports = { initializeSocketServer };
