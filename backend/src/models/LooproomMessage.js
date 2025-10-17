const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LooproomMessage = sequelize.define(
  "LooproomMessage",
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
    sessionId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "session_id",
      references: {
        model: "looproom_sessions",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("message", "system", "ai", "announcement"),
      defaultValue: "message",
      allowNull: false,
      field: "type",
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: "is_deleted",
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: "is_pinned",
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "deleted_by",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "deleted_at",
    },
    reactions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      field: "reactions",
      comment: "Message reactions as { emoji: [userId1, userId2] }",
    },
    replyTo: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "reply_to",
      references: {
        model: "looproom_messages",
        key: "id",
      },
      onDelete: "SET NULL",
      comment: "ID of message being replied to",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "looproom_messages",
    timestamps: false,
    indexes: [
      {
        fields: ["looproom_id"],
      },
      {
        fields: ["session_id"],
      },
      {
        fields: ["user_id"],
      },
      {
        fields: ["created_at"],
      },
      {
        fields: ["is_deleted"],
      },
      {
        fields: ["is_pinned"],
      },
    ],
  }
);

module.exports = LooproomMessage;
