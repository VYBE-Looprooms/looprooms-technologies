const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CreatorVerification = sequelize.define('CreatorVerification', {
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
  // Stage 1: Document Verification
  idDocumentUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'id_document_url'
  },
  idDocumentBackUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'id_document_back_url'
  },
  idDocumentType: {
    type: DataTypes.ENUM('passport', 'id_card', 'drivers_license'),
    allowNull: true,
    field: 'id_document_type'
  },
  selfieUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'selfie_url'
  },
  verificationStatus: {
    type: DataTypes.ENUM('pending', 'verification_failed', 'id_confirmed', 'pending_review', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
    field: 'verification_status'
  },
  aiVerificationScore: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    field: 'ai_verification_score'
  },
  aiVerificationNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'ai_verification_notes'
  },
  // Enhanced AI Verification Fields
  geminiAnalysisResult: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'gemini_analysis_result'
  },
  faceMatchScore: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    field: 'face_match_score'
  },
  documentAuthenticityScore: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    field: 'document_authenticity_score'
  },
  livenessScore: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    field: 'liveness_score'
  },
  fraudIndicators: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'fraud_indicators'
  },
  verificationAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'verification_attempts'
  },
  // Stage 2: Application Data
  applicationData: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'application_data'
  },
  // Stage 3: Marketing Review
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'reviewed_by',
    references: {
      model: 'admins',
      key: 'id'
    }
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reviewed_at'
  },
  reviewNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'review_notes'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason'
  },
  canReapplyAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'can_reapply_at'
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
  tableName: 'creator_verifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CreatorVerification;