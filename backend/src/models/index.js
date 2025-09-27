const sequelize = require('../config/database');
const Waitlist = require('./Waitlist');
const ContactMessage = require('./ContactMessage');
const User = require('./User');
const CreatorVerification = require('./CreatorVerification');
const Admin = require('./Admin')(sequelize);
const LooproomSuggestion = require('./LooproomSuggestion');
const Looproom = require('./Looproom');
const LooproomParticipant = require('./LooproomParticipant');
const Loopchain = require('./Loopchain');
const LoopchainProgress = require('./LoopchainProgress');
const AIContent = require('./AIContent');
const Post = require('./Post');
const Reaction = require('./Reaction');
const Comment = require('./Comment');

// Define associations

// User associations
User.hasOne(CreatorVerification, { foreignKey: 'userId', as: 'verification' });
CreatorVerification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Admin associations
CreatorVerification.belongsTo(Admin, { foreignKey: 'reviewedBy', as: 'reviewer' });

// Looproom associations
User.hasMany(Looproom, { foreignKey: 'creatorId', as: 'createdLooprooms' });
Looproom.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

// Looproom participant associations
Looproom.hasMany(LooproomParticipant, { foreignKey: 'looproomId', as: 'participants' });
LooproomParticipant.belongsTo(Looproom, { foreignKey: 'looproomId', as: 'looproom' });
User.hasMany(LooproomParticipant, { foreignKey: 'userId', as: 'looproomParticipations' });
LooproomParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Loopchain associations
User.hasMany(Loopchain, { foreignKey: 'creatorId', as: 'createdLoopchains' });
Loopchain.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

// Loopchain progress associations
User.hasMany(LoopchainProgress, { foreignKey: 'userId', as: 'loopchainProgress' });
LoopchainProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Loopchain.hasMany(LoopchainProgress, { foreignKey: 'loopchainId', as: 'userProgress' });
LoopchainProgress.belongsTo(Loopchain, { foreignKey: 'loopchainId', as: 'loopchain' });

// Post associations
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Looproom.hasMany(Post, { foreignKey: 'looproomId', as: 'posts' });
Post.belongsTo(Looproom, { foreignKey: 'looproomId', as: 'looproom' });

// Reaction associations
User.hasMany(Reaction, { foreignKey: 'userId', as: 'reactions' });
Reaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Post.hasMany(Reaction, { foreignKey: 'postId', as: 'reactions' });
Reaction.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Comment associations
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });

// Sync database
const syncDatabase = async () => {
  try {
    // Use alter: true for safe schema updates
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Database sync error:', error);
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
  Loopchain,
  LoopchainProgress,
  AIContent,
  Post,
  Reaction,
  Comment,
  syncDatabase
};