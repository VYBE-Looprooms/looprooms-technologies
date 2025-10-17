const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LooproomContent = sequelize.define(
  "LooproomContent",
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
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "creator_id",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("video", "audio", "stream", "document", "image"),
      allowNull: false,
      field: "type",
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "URL to the content file or stream",
    },
    thumbnailUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "thumbnail_url",
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "duration",
      comment: "Duration in seconds for video/audio content",
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: "file_size",
      comment: "File size in bytes",
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "mime_type",
    },
    status: {
      type: DataTypes.ENUM("active", "processing", "deleted", "failed"),
      defaultValue: "active",
      allowNull: false,
      field: "status",
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: "view_count",
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: "order",
      comment: "Order in content queue",
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "metadata",
      comment: "Additional metadata like resolution, bitrate, etc.",
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
    tableName: "looproom_content",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["looproom_id"],
      },
      {
        fields: ["creator_id"],
      },
      {
        fields: ["type"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["order"],
      },
    ],
  }
);

module.exports = LooproomContent;
