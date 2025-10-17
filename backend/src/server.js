const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Initialize database
const { syncDatabase } = require("./models");

// Initialize Socket.IO
const { initializeSocketServer } = require("./websocket/socketServer");

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Trust proxy configuration - more secure than 'true'
// Configure based on hosting environment
const trustProxy =
  process.env.TRUST_PROXY ||
  (process.env.NODE_ENV === "production" ? "1" : "false");
app.set(
  "trust proxy",
  trustProxy === "false" ? false : parseInt(trustProxy) || trustProxy
);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://www.feelyourvybe.com",
      "https://feelyourvybe.com",
    ],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: "Too many requests, please try again later." },
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", require("./routes/auth").router);
app.use("/api/creator", require("./routes/creator-verification"));
app.use("/api/waitlist", require("./routes/waitlist"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/suggestions", require("./routes/suggestions"));
app.use("/api/health", require("./routes/health"));
app.use("/api/admin", require("./routes/admin"));

// Social features
app.use("/api/posts", require("./routes/posts"));

// New MVP routes
app.use("/api/looprooms", require("./routes/looprooms"));
app.use("/api/loopchains", require("./routes/loopchains"));
app.use("/api/ai", require("./routes/ai"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Initialize Socket.IO server
const io = initializeSocketServer(httpServer);

// Make io accessible to routes
app.set("io", io);

httpServer.listen(PORT, async () => {
  console.log(`🚀 Vybe Backend running on port ${PORT}`);
  console.log(`🔌 WebSocket server initialized`);
  console.log(
    `📧 Email service: ${process.env.SMTP_HOST ? "SMTP" : "SendGrid"}`
  );
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);

  // Initialize database
  await syncDatabase();

  // Initialize AI system in production
  if (process.env.NODE_ENV === "production" || process.env.INIT_AI === "true") {
    try {
      const { main: initializeAI } = require("./scripts/initializeAI");
      await initializeAI();
      console.log("✨ AI system initialized successfully");
    } catch (error) {
      console.error("⚠️  AI initialization failed:", error.message);
      // Don't crash the server if AI init fails
    }
  }
});
