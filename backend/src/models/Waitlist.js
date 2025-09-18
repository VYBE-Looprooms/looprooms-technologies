const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Waitlist = sequelize.define('Waitlist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  type: {
    type: DataTypes.ENUM('user', 'creator'),
    defaultValue: 'user',
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'last_name'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  interests: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'waitlist',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['type']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Waitlist;