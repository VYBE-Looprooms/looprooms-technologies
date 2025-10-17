const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Loopchain = sequelize.define('Loopchain', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null for AI-generated chains
    field: 'creator_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('ai-guided', 'creator-built', 'hybrid'),
    defaultValue: 'creator-built',
    allowNull: false
  },
  rooms: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'rooms',
    comment: 'Array of room configurations with order, transitions, etc.'
  },
  emotionalJourney: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'emotional_journey',
    comment: 'Starting mood, target mood, intermediate states, progress markers'
  },
  estimatedDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'estimated_duration',
    comment: 'Estimated completion time in minutes'
  },
  completionRewards: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'completion_rewards',
    comment: 'Badges, points, or other rewards for completion'
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner',
    allowNull: false
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'tags',
    comment: 'Array of tags for discovery and filtering'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'is_featured'
  },
  completionCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'completion_count'
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    field: 'average_rating'
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
  tableName: 'loopchains',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['creator_id']
    },
    {
      fields: ['difficulty']
    },
    {
      fields: ['completion_count']
    }
  ]
});

module.exports = Loopchain;