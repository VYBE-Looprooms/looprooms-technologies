const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ModerationLog = sequelize.define(
  "ModerationLog",
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
    moderatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "moderator_id",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    targetUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "target_user_id",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    action: {
      type: DataTypes.ENUM(
        "mute",
        "unmute",
        "kick",
        "ban",
        "unban",
        "delete_message",
        "pin_message",
        "unpin_message",
        "warn",
        "promote_moderator",
        "demote_moderator",
        "slow_mode",
        "clear_chat"
      ),
      allowNull: false,
      field: "action",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "duration",
      comment: "Duration in minutes for temporary actions (mute, ban)",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "expires_at",
      comment: "When the moderation action expires",
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "metadata",
      comment: "Additional context like message ID, previous state, etc.",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "looproom_moderation_logs",
    timestamps: false,
    indexes: [
      {
        fields: ["looproom_id"],
      },
      {
        fields: ["moderator_id"],
      },
      {
        fields: ["target_user_id"],
      },
      {
        fields: ["action"],
      },
      {
        fields: ["created_at"],
      },
      {
        fields: ["expires_at"],
      },
    ],
  }
);

module.exports = ModerationLog;
