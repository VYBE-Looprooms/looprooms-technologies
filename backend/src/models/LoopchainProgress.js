const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LoopchainProgress = sequelize.define('LoopchainProgress', {
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
  loopchainId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'loopchain_id',
    references: {
      model: 'loopchains',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  currentRoomIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'current_room_index'
  },
  completedRooms: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: false,
    field: 'completed_rooms',
    comment: 'Array of completed room IDs with completion data'
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
    field: 'started_at'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  totalTimeSpent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'total_time_spent',
    comment: 'Total time spent in seconds'
  },
  currentMood: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'current_mood',
    comment: 'User mood at current stage'
  },
  startingMood: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'starting_mood',
    comment: 'User mood when starting the chain'
  },
  endingMood: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'ending_mood',
    comment: 'User mood when completing the chain'
  },
  progressData: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'progress_data',
    comment: 'Additional progress tracking data, achievements, etc.'
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'is_completed'
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'rating',
    validate: {
      min: 1,
      max: 5
    }
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'feedback'
  },
  lastActiveAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
    field: 'last_active_at'
  }
}, {
  tableName: 'loopchain_progress',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'loopchain_id'],
      name: 'unique_user_loopchain_progress'
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['loopchain_id']
    },
    {
      fields: ['is_completed']
    },
    {
      fields: ['started_at']
    },
    {
      fields: ['last_active_at']
    }
  ]
});

module.exports = LoopchainProgress;