const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  mediaUrls: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'media_urls',
    comment: 'Array of image/video URLs attached to the post'
  },
  mood: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'User mood when creating the post'
  },
  looproomId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'looproom_id',
    references: {
      model: 'looprooms',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Associated looproom if post was created from a room'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_public'
  },
  reactionCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'reaction_count'
  },
  commentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'comment_count'
  },
  shareCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'share_count'
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of hashtags and mentions'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional post metadata like location, device info, etc.'
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'is_edited'
  },
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'edited_at'
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
  tableName: 'posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['is_public']
    },
    {
      fields: ['looproom_id']
    },
    {
      fields: ['mood']
    }
  ]
});

module.exports = Post;