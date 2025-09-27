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

// Sync database
const syncDatabase = async () => {
  try {
    // Force alter in production to fix missing columns
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
  syncDatabase
};