const sequelize = require("../config/database");
const Waitlist = require("./Waitlist");
const ContactMessage = require("./ContactMessage");
const User = require("./User");
const CreatorVerification = require("./CreatorVerification");
const Admin = require("./Admin")(sequelize);
const LooproomSuggestion = require("./LooproomSuggestion");
const Looproom = require("./Looproom");
const LooproomParticipant = require("./LooproomParticipant");
const LooproomSession = require("./LooproomSession");
const LooproomMessage = require("./LooproomMessage");
const LooproomContent = require("./LooproomContent");
const ModerationLog = require("./ModerationLog");
const Loopchain = require("./Loopchain");
const LoopchainProgress = require("./LoopchainProgress");
const AIContent = require("./AIContent");
const Post = require("./Post");
const Reaction = require("./Reaction");
const Comment = require("./Comment");

// Define associations

// User associations
User.hasOne(CreatorVerification, { foreignKey: "userId", as: "verification" });
CreatorVerification.belongsTo(User, { foreignKey: "userId", as: "user" });

// Admin associations
CreatorVerification.belongsTo(Admin, {
  foreignKey: "reviewedBy",
  as: "reviewer",
});

// Looproom associations
User.hasMany(Looproom, { foreignKey: "creatorId", as: "createdLooprooms" });
Looproom.belongsTo(User, { foreignKey: "creatorId", as: "creator" });

// Looproom participant associations
Looproom.hasMany(LooproomParticipant, {
  foreignKey: "looproomId",
  as: "participants",
});
LooproomParticipant.belongsTo(Looproom, {
  foreignKey: "looproomId",
  as: "looproom",
});
User.hasMany(LooproomParticipant, {
  foreignKey: "userId",
  as: "looproomParticipations",
});
LooproomParticipant.belongsTo(User, { foreignKey: "userId", as: "user" });

// Loopchain associations
User.hasMany(Loopchain, { foreignKey: "creatorId", as: "createdLoopchains" });
Loopchain.belongsTo(User, { foreignKey: "creatorId", as: "creator" });

// Loopchain progress associations
User.hasMany(LoopchainProgress, {
  foreignKey: "userId",
  as: "loopchainProgress",
});
LoopchainProgress.belongsTo(User, { foreignKey: "userId", as: "user" });
Loopchain.hasMany(LoopchainProgress, {
  foreignKey: "loopchainId",
  as: "userProgress",
});
LoopchainProgress.belongsTo(Loopchain, {
  foreignKey: "loopchainId",
  as: "loopchain",
});

// Post associations
User.hasMany(Post, { foreignKey: "userId", as: "posts" });
Post.belongsTo(User, { foreignKey: "userId", as: "author" });
Looproom.hasMany(Post, { foreignKey: "looproomId", as: "posts" });
Post.belongsTo(Looproom, { foreignKey: "looproomId", as: "looproom" });

// Reaction associations
User.hasMany(Reaction, { foreignKey: "userId", as: "reactions" });
Reaction.belongsTo(User, { foreignKey: "userId", as: "user" });
Post.hasMany(Reaction, { foreignKey: "postId", as: "reactions" });
Reaction.belongsTo(Post, { foreignKey: "postId", as: "post" });

// Comment associations
User.hasMany(Comment, { foreignKey: "userId", as: "comments" });
Comment.belongsTo(User, { foreignKey: "userId", as: "author" });
Post.hasMany(Comment, { foreignKey: "postId", as: "comments" });
Comment.belongsTo(Post, { foreignKey: "postId", as: "post" });
Comment.hasMany(Comment, { foreignKey: "parentId", as: "replies" });
Comment.belongsTo(Comment, { foreignKey: "parentId", as: "parent" });

// Looproom Session associations
Looproom.hasMany(LooproomSession, { foreignKey: "looproomId", as: "sessions" });
LooproomSession.belongsTo(Looproom, {
  foreignKey: "looproomId",
  as: "looproom",
});
// Note: currentSessionId is stored but not enforced as FK to avoid circular dependency

// Looproom Message associations
Looproom.hasMany(LooproomMessage, { foreignKey: "looproomId", as: "messages" });
LooproomMessage.belongsTo(Looproom, {
  foreignKey: "looproomId",
  as: "looproom",
});
LooproomSession.hasMany(LooproomMessage, {
  foreignKey: "sessionId",
  as: "messages",
});
LooproomMessage.belongsTo(LooproomSession, {
  foreignKey: "sessionId",
  as: "session",
});
User.hasMany(LooproomMessage, { foreignKey: "userId", as: "looproomMessages" });
LooproomMessage.belongsTo(User, { foreignKey: "userId", as: "user" });
LooproomMessage.belongsTo(User, {
  foreignKey: "deletedBy",
  as: "deletedByUser",
});
LooproomMessage.belongsTo(LooproomMessage, {
  foreignKey: "replyTo",
  as: "parentMessage",
});

// Looproom Content associations
Looproom.hasMany(LooproomContent, { foreignKey: "looproomId", as: "content" });
LooproomContent.belongsTo(Looproom, {
  foreignKey: "looproomId",
  as: "looproom",
});
User.hasMany(LooproomContent, {
  foreignKey: "creatorId",
  as: "uploadedContent",
});
LooproomContent.belongsTo(User, { foreignKey: "creatorId", as: "creator" });

// Moderation Log associations
Looproom.hasMany(ModerationLog, {
  foreignKey: "looproomId",
  as: "moderationLogs",
});
ModerationLog.belongsTo(Looproom, { foreignKey: "looproomId", as: "looproom" });
User.hasMany(ModerationLog, {
  foreignKey: "moderatorId",
  as: "moderationActions",
});
ModerationLog.belongsTo(User, { foreignKey: "moderatorId", as: "moderator" });
User.hasMany(ModerationLog, {
  foreignKey: "targetUserId",
  as: "moderationReceived",
});
ModerationLog.belongsTo(User, { foreignKey: "targetUserId", as: "targetUser" });

// Sync database
const syncDatabase = async () => {
  try {
    // Use alter: true for safe schema updates
    await sequelize.sync({ alter: true });
    console.log("✅ Database synchronized successfully");
  } catch (error) {
    console.error("❌ Database sync error:", error);
  }
};

module.exports = {
  sequelize,
  Waitlist,
  ContactMessage,
  User,
  CreatorVerification,
  Admin,
  LooproomSuggestion,
  Looproom,
  LooproomParticipant,
  LooproomSession,
  LooproomMessage,
  LooproomContent,
  ModerationLog,
  Loopchain,
  LoopchainProgress,
  AIContent,
  Post,
  Reaction,
  Comment,
  syncDatabase,
};
