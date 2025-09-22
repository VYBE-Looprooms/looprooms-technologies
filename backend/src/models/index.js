const sequelize = require('../config/database');
const Waitlist = require('./Waitlist');
const ContactMessage = require('./ContactMessage');
const User = require('./User');
const CreatorVerification = require('./CreatorVerification');
const Admin = require('./Admin')(sequelize);
const LooproomSuggestion = require('./LooproomSuggestion');

// Define associations
User.hasOne(CreatorVerification, { foreignKey: 'userId', as: 'verification' });
CreatorVerification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

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
  syncDatabase
};