const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { CreatorVerification, User } = require('../models');
const { authenticateUser } = require('./auth');

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
        reviewNotes: verification.reviewNotes,
        rejectionReason: verification.rejectionReason
      }
    });

  } catch (error) {
    console.error('Verification status error:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
});

// POST /api/creator/verify-documents - Upload and verify documents
router.post('/verify-documents', 
  authenticateUser,
  upload.fields([
    { name: 'document', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { document, selfie } = req.files;
      const { documentType } = req.body;

      if (!document || !selfie) {
        return res.status(400).json({ 
          error: 'Both document and selfie are required' 
        });
      }

      // Save file paths
      const documentPath = `/uploads/verification/${document[0].filename}`;
      const selfiePath = `/uploads/verification/${selfie[0].filename}`;

      // Simple verification score (in production, use AI services)
      const verificationScore = await calculateSimpleVerificationScore(
        document[0].path, 
        selfie[0].path
      );

      // Create or update verification record
      const [verification] = await CreatorVerification.upsert({
        userId: req.user.id,
        idDocumentUrl: documentPath,
        idDocumentType: documentType || 'id_card',
        selfieUrl: selfiePath,
        verificationStatus: verificationScore > 0.7 ? 'id_confirmed' : 'pending',
        aiVerificationScore: verificationScore,
        aiVerificationNotes: JSON.stringify({
          documentProcessed: true,
          selfieProcessed: true,
          timestamp: new Date().toISOString()
        })
      });

      res.json({
        success: true,
        status: verification.verificationStatus,
        score: verificationScore,
        message: verification.verificationStatus === 'id_confirmed' 
          ? 'Documents verified successfully! Please complete your application.'
          : 'Documents uploaded. Manual review required.'
      });

    } catch (error) {
      console.error('Document verification error:', error);
      res.status(500).json({ 
        error: 'Document verification failed. Please try again.' 
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

// Simple verification score calculation (replace with AI in production)
async function calculateSimpleVerificationScore(documentPath, selfiePath) {
  try {
    // Check if files exist and have reasonable sizes
    const documentStats = await fs.stat(documentPath);
    const selfieStats = await fs.stat(selfiePath);
    
    let score = 0.5; // Base score
    
    // File size checks (reasonable document/selfie sizes)
    if (documentStats.size > 100000 && documentStats.size < 5000000) { // 100KB - 5MB
      score += 0.2;
    }
    
    if (selfieStats.size > 50000 && selfieStats.size < 3000000) { // 50KB - 3MB
      score += 0.2;
    }
    
    // Random factor to simulate AI confidence (replace with real AI)
    score += Math.random() * 0.2;
    
    return Math.min(1.0, score);
  } catch (error) {
    console.error('Verification score calculation error:', error);
    return 0.3; // Low score if processing fails
  }
}

module.exports = router;