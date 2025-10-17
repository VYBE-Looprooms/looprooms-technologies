const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AIContent = sequelize.define('AIContent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category: {
    type: DataTypes.ENUM('recovery', 'meditation', 'fitness', 'healthy-living', 'wellness', 'music', 'social', 'productivity'),
    allowNull: false
  },
  contentType: {
    type: DataTypes.ENUM('prompt', 'exercise', 'meditation', 'challenge', 'affirmation', 'tip', 'quote', 'script'),
    allowNull: false,
    field: 'content_type'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  aiPersonality: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'ai_personality'
  },
  timeOfDay: {
    type: DataTypes.STRING(20),
    defaultValue: 'any',
    allowNull: false,
    field: 'time_of_day'
  },
  targetMood: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'target_mood',
    comment: 'Array of moods this content is designed for'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'duration',
    comment: 'Duration in seconds for timed content'
  },
  backgroundMusic: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'background_music'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'metadata',
    comment: 'Additional content metadata like instructions, follow-up actions, etc.'
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'usage_count'
  },
  effectivenessScore: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    field: 'effectiveness_score',
    comment: 'Score based on user engagement and feedback'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active'
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'tags',
    comment: 'Array of tags for content filtering and discovery'
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
  tableName: 'ai_content',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['content_type']
    },
    {
      fields: ['ai_personality']
    },
    {
      fields: ['time_of_day']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['effectiveness_score']
    },
    {
      fields: ['usage_count']
    }
  ]
});

module.exports = AIContent;