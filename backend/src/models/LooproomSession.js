const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LooproomSession = sequelize.define(
  "LooproomSession",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    looproomId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "looproom_id",
      references: {
        model: "looprooms",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "started_at",
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "ended_at",
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "duration",
      comment: "Session duration in seconds",
    },
    peakParticipants: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: "peak_participants",
    },
    totalMessages: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: "total_messages",
    },
    status: {
      type: DataTypes.ENUM("active", "paused", "ended"),
      defaultValue: "active",
      allowNull: false,
      field: "status",
    },
    streamUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "stream_url",
      comment: "Current stream URL for this session",
    },
    recordingUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "recording_url",
      comment: "URL to session recording if available",
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "metadata",
      comment: "Additional session metadata and statistics",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    tableName: "looproom_sessions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["looproom_id"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["started_at"],
      },
    ],
  }
);

module.exports = LooproomSession;
