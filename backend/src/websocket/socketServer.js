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
        return next(new Error("Authentication token required"));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return next(new Error("User not found"));
      }

      // Attach user to socket
      socket.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        verified: user.verified,
      };

      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
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
