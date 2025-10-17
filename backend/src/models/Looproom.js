const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Looproom = sequelize.define(
  "Looproom",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for AI-generated rooms
      field: "creator_id",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(
        "recovery",
        "meditation",
        "fitness",
        "healthy-living",
        "wellness",
        "music",
        "social",
        "productivity"
      ),
      allowNull: false,
    },
    bannerUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "banner_url",
    },
    isAiAssisted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: "is_ai_assisted",
    },
    aiPersonality: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "ai_personality",
      comment: "AI personality configuration for AI-assisted rooms",
    },
    isLive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: "is_live",
    },
    participantCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: "participant_count",
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      allowNull: false,
      field: "max_participants",
    },
    musicPlaylist: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "music_playlist",
      comment: "Array of music tracks for the room",
    },
    schedule: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "schedule",
      comment: "Scheduled sessions and recurring events",
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "settings",
      comment: "Room-specific settings and configurations",
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "tags",
      comment: "Array of tags for discovery and filtering",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: "is_active",
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: "is_private",
      comment: "Whether the room is private (requires access code)",
    },
    accessCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "access_code",
      comment: "Code for joining private rooms",
    },
    shareableLink: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "shareable_link",
      comment: "Unique shareable link for the room",
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "duration",
      comment: "Duration of the session in minutes",
    },
    currentSessionId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "current_session_id",
      references: {
        model: "looproom_sessions",
        key: "id",
      },
      onDelete: "SET NULL",
      comment: "Current active session ID",
    },
    streamUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "stream_url",
      comment: "Live stream URL",
    },
    streamKey: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "stream_key",
      comment: "Stream key for broadcasting",
    },
    chatEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: "chat_enabled",
      comment: "Whether chat is enabled for this room",
    },
    slowModeSeconds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: "slow_mode_seconds",
      comment: "Seconds between messages (0 = disabled)",
    },
    lastActivityAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_activity_at",
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
    tableName: "looprooms",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["category"],
      },
      {
        fields: ["is_live"],
      },
      {
        fields: ["is_active"],
      },
      {
        fields: ["creator_id"],
      },
      {
        fields: ["is_ai_assisted"],
      },
      {
        unique: true,
        fields: ["access_code"],
        where: {
          access_code: { [require("sequelize").Op.ne]: null },
        },
      },
    ],
  }
);

module.exports = Looproom;
