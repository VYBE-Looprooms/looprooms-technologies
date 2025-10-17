const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { CreatorVerification, User } = require('../models');
const { authenticateUser } = require('./auth');
const GeminiVerificationService = require('../services/geminiVerificationService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/verification');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileType = file.fieldname; // 'document' or 'selfie'
    cb(null, `${fileType}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG and PNG images are allowed'));
    }
  }
});

// Initialize Gemini verification service
const geminiService = new GeminiVerificationService();

// GET /api/creator/verification-status - Get current verification status
router.get('/verification-status', authenticateUser, async (req, res) => {
  try {
    const verification = await CreatorVerification.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    if (!verification) {
      return res.json({ 
        status: 'not_started', 
        stage: null,
        needsOnboarding: req.user.intendedType === 'creator'
      });
    }

    // Check if can reapply
    const canReapply = verification.canReapplyAt ? new Date() > verification.canReapplyAt : true;

    res.json({
      status: verification.verificationStatus,
      stage: getStageFromStatus(verification.verificationStatus),
      canReapply,
      verification: {
        id: verification.id,
        aiScore: verification.aiVerificationScore,
        faceMatchScore: verification.faceMatchScore,
        documentAuthenticityScore: verification.documentAuthenticityScore,
        livenessScore: verification.livenessScore,
        verificationAttempts: verification.verificationAttempts,
        reviewNotes: verification.reviewNotes,
        rejectionReason: verification.rejectionReason,
        fraudIndicators: verification.fraudIndicators
      }
    });

  } catch (error) {
    console.error('Verification status error:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
});

// POST /api/creator/verify-documents - Upload and verify documents with AI
router.post('/verify-documents', 
  authenticateUser,
  upload.fields([
    { name: 'document', maxCount: 1 },
    { name: 'documentBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { document, documentBack, selfie } = req.files;
      const { documentType } = req.body;

      // Validate required files
      if (!document || !selfie) {
        return res.status(400).json({ 
          error: 'Both document and selfie are required' 
        });
      }

      // Validate document type
      if (!['passport', 'id_card', 'drivers_license'].includes(documentType)) {
        return res.status(400).json({
          error: 'Invalid document type. Must be passport, id_card, or drivers_license'
        });
      }

      // For ID cards, back image is required
      if (documentType === 'id_card' && !documentBack) {
        return res.status(400).json({
          error: 'Back of ID card is required for id_card document type'
        });
      }

      // Check rate limiting - max 3 attempts per hour per user
      const existingVerification = await CreatorVerification.findOne({
        where: { userId: req.user.id },
        order: [['updatedAt', 'DESC']]
      });

      if (existingVerification) {
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (existingVerification.verificationAttempts >= 3 && existingVerification.updatedAt > hourAgo) {
          return res.status(429).json({
            error: 'Too many verification attempts. Please try again in an hour.'
          });
        }
      }

      // File paths
      const documentPath = document[0].path;
      const selfiePath = selfie[0].path;
      const documentBackPath = documentBack ? documentBack[0].path : null;

      // Save file URLs for database
      const documentUrl = `/uploads/verification/${document[0].filename}`;
      const selfieUrl = `/uploads/verification/${selfie[0].filename}`;
      const documentBackUrl = documentBack ? `/uploads/verification/${documentBack[0].filename}` : null;

      console.log('Starting AI verification for user:', req.user.id);

      // Perform AI verification using Gemini
      const verificationResult = await geminiService.verifyDocuments(
        documentPath,
        selfiePath,
        documentType,
        documentBackPath
      );

      // Calculate attempt count
      const attemptCount = existingVerification ? existingVerification.verificationAttempts + 1 : 1;

      // Only save to database if verification was successful or needs manual review
      // For failed verifications that can retry, don't save to avoid blocking retries
      let verification;
      
      if (verificationResult.decision.status === 'id_confirmed') {
        // Success - save the verification
        [verification] = await CreatorVerification.upsert({
          userId: req.user.id,
          idDocumentUrl: documentUrl,
          idDocumentBackUrl: documentBackUrl,
          idDocumentType: documentType,
          selfieUrl: selfieUrl,
          verificationStatus: verificationResult.decision.status,
          aiVerificationScore: verificationResult.scores.overall,
          aiVerificationNotes: JSON.stringify({
            model: 'gemini-2.5-flash',
            timestamp: verificationResult.timestamp,
            confidence: verificationResult.decision.confidence
          }),
          geminiAnalysisResult: verificationResult,
          faceMatchScore: verificationResult.scores.faceMatch,
          documentAuthenticityScore: verificationResult.scores.documentAuthenticity,
          livenessScore: verificationResult.scores.liveness,
          fraudIndicators: {
            documentRisk: verificationResult.documentAnalysis.fraudIndicators?.riskLevel || 'low',
            selfieRisk: verificationResult.selfieAnalysis.fraudIndicators?.riskLevel || 'low',
            faceComparisonRisk: verificationResult.faceComparison.riskFactors?.riskLevel || 'low',
            overallRisk: verificationResult.decision.confidence === 'low' ? 'high' : 
                        verificationResult.decision.confidence === 'medium' ? 'medium' : 'low'
          },
          verificationAttempts: attemptCount
        });
      } else if (verificationResult.decision.status === 'verification_failed') {
        // Failed verification - update attempt count but don't change status
        if (existingVerification) {
          await existingVerification.update({
            verificationAttempts: attemptCount
          });
          verification = existingVerification;
        } else {
          // Create a minimal record to track attempts
          [verification] = await CreatorVerification.upsert({
            userId: req.user.id,
            verificationStatus: 'pending', // Keep as pending so they can retry
            verificationAttempts: attemptCount
          });
        }
      }

      // Clean up uploaded files after processing (optional - keep for audit trail)
      // You might want to move them to secure storage instead
      
      // Handle different response types based on verification result
      if (verificationResult.decision.status === 'id_confirmed') {
        res.json({
          success: true,
          status: verification.verificationStatus,
          scores: {
            overall: verificationResult.scores.overall,
            documentAuthenticity: verificationResult.scores.documentAuthenticity,
            faceMatch: verificationResult.scores.faceMatch,
            liveness: verificationResult.scores.liveness
          },
          confidence: verificationResult.decision.confidence,
          requiresReview: verificationResult.decision.requiresManualReview,
          message: verificationResult.decision.message,
          attemptsRemaining: Math.max(0, 3 - attemptCount)
        });
      } else if (verificationResult.decision.status === 'verification_failed') {
        res.status(400).json({
          success: false,
          error: 'verification_failed',
          status: 'pending', // Keep status as pending so they can retry
          scores: {
            overall: verificationResult.scores.overall,
            documentAuthenticity: verificationResult.scores.documentAuthenticity,
            faceMatch: verificationResult.scores.faceMatch,
            liveness: verificationResult.scores.liveness
          },
          confidence: verificationResult.decision.confidence,
          message: verificationResult.decision.message,
          canRetry: verificationResult.decision.canRetry,
          attemptsRemaining: Math.max(0, 3 - attemptCount),
          suggestions: [
            "Ensure your document is clearly visible and not blurry",
            "Use good lighting without shadows or glare",
            "Make sure your face is clearly visible in the selfie",
            "Hold the camera steady when taking photos"
          ]
        });
      }

    } catch (error) {
      console.error('Enhanced document verification error:', error);
      
      // Handle specific Gemini API errors
      if (error.message.includes('API key')) {
        return res.status(500).json({ 
          error: 'AI verification service unavailable. Please try again later.' 
        });
      }
      
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return res.status(503).json({
          error: 'Verification service temporarily unavailable due to high demand. Please try again in a few minutes.'
        });
      }

      res.status(500).json({ 
        error: 'Document verification failed. Please ensure your images are clear and try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// POST /api/creator/submit-application - Submit creator application
router.post('/submit-application', authenticateUser, async (req, res) => {
  try {
    const { personalInfo, creatorProfile } = req.body;

    // Validate required fields based on frontend form structure
    if (!personalInfo?.phoneNumber || !personalInfo?.instagramHandle || 
        !creatorProfile?.looproomCategory || !creatorProfile?.looproomDescription ||
        !creatorProfile?.contentFrequency || !creatorProfile?.audienceSize ||
        !creatorProfile?.vybeGoals || !creatorProfile?.agreesToGuidelines ||
        !creatorProfile?.signature) {
      return res.status(400).json({
        error: 'Missing required application information'
      });
    }

    // Find existing verification record
    const verification = await CreatorVerification.findOne({
      where: { 
        userId: req.user.id,
        verificationStatus: 'id_confirmed'
      }
    });

    if (!verification) {
      return res.status(400).json({
        error: 'Please complete document verification first'
      });
    }

    // Update with application data
    await verification.update({
      applicationData: {
        personalInfo,
        creatorProfile,
        submittedAt: new Date().toISOString()
      },
      verificationStatus: 'pending_review'
    });

    res.json({
      success: true,
      message: 'Application submitted successfully! Our team will review it within 24-48 hours.',
      status: 'pending_review'
    });

  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({
      error: 'Failed to submit application. Please try again.'
    });
  }
});

// Helper function to determine stage from status
function getStageFromStatus(status) {
  switch (status) {
    case 'pending':
    case 'verification_failed':
      return 'document-verification';
    case 'id_confirmed':
      return 'application-questions';
    case 'pending_review':
      return 'under-review';
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    default:
      return null;
  }
}



module.exports = router;