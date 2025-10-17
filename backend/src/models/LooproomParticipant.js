const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LooproomParticipant = sequelize.define(
  "LooproomParticipant",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      field: "joined_at",
    },
    leftAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "left_at",
    },
    role: {
      type: DataTypes.ENUM("participant", "moderator", "co-host"),
      defaultValue: "participant",
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: "is_active",
    },
    totalTimeSpent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: "total_time_spent",
      comment: "Total time spent in seconds",
    },
    interactionCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: "interaction_count",
      comment: "Number of messages, reactions, etc.",
    },
    lastSeenAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_seen_at",
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "metadata",
      comment: "Additional participant data like mood on join, etc.",
    },
  },
  {
    tableName: "looproom_participants",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["looproom_id", "user_id"],
        name: "unique_looproom_participant",
      },
      {
        fields: ["looproom_id"],
      },
      {
        fields: ["user_id"],
      },
      {
        fields: ["is_active"],
      },
      {
        fields: ["joined_at"],
      },
    ],
  }
);

module.exports = LooproomParticipant;
