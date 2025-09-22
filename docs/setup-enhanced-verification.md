# Enhanced AI Verification System Setup Guide

## Overview

This guide will help you set up the enhanced document verification system using Google Gemini AI for Vybe's creator onboarding process.

## Prerequisites

- Node.js 16+ installed
- PostgreSQL database running
- Google AI Studio account (free)

## Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" in the left sidebar
4. Create a new API key
5. Copy the API key (keep it secure)

## Step 2: Environment Setup

1. Add the Gemini API key to your backend `.env` file:

```bash
# AI Verification Services
GEMINI_API_KEY=your-gemini-api-key-here
```

2. Make sure all other environment variables are set:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/vybe_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Step 3: Database Migration

The enhanced verification system adds new fields to the `creator_verifications` table. These will be automatically created when you start the server due to Sequelize sync.

New fields added:

- `id_document_back_url` - For ID card back images
- `gemini_analysis_result` - Complete AI analysis results
- `face_match_score` - Face matching confidence score
- `document_authenticity_score` - Document authenticity score
- `liveness_score` - Selfie liveness detection score
- `fraud_indicators` - Fraud detection results
- `verification_attempts` - Number of verification attempts

## Step 4: Install Dependencies

Backend:

```bash
cd backend
npm install
```

The `@google/generative-ai` package is already added to package.json.

Frontend:

```bash
cd frontend
npm install
```

No additional frontend dependencies needed.

## Step 5: Start the Services

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. Start the frontend:

```bash
cd frontend
npm run dev
```

## Step 6: Test the System

1. Go to `http://localhost:3000`
2. Sign up as a creator
3. Go through the verification process:
   - Select document type (Passport, ID Card, or Driver's License)
   - Upload document(s) - ID cards require front and back
   - Upload selfie
   - Submit for AI verification

## Features Implemented

### Document Types Supported

- **Passport**: Single image upload
- **ID Card**: Front and back images required
- **Driver's License**: Single image upload

### AI Analysis Features

- **Document Authenticity**: Verifies security features, fonts, layouts
- **Text Extraction**: OCR to extract name, DOB, document number
- **Face Detection**: Locates face in ID document
- **Liveness Detection**: Ensures selfie is from live person
- **Face Matching**: Compares ID photo with selfie
- **Fraud Detection**: Identifies tampering, editing, spoofing

### Security Features

- **Rate Limiting**: 3 attempts per hour per user
- **File Validation**: Size limits, format checks
- **Secure Storage**: Files stored with UUID names
- **Comprehensive Logging**: All verification steps logged

### Verification Scores

- **Overall Score**: Weighted combination of all checks
- **Document Authenticity**: 0.0-1.0 confidence score
- **Face Match**: 0.0-1.0 similarity score
- **Liveness**: 0.0-1.0 liveness confidence
- **Risk Assessment**: Low/Medium/High risk levels

### Automated Decisions

- **High Confidence (≥85%)**: Auto-approve → `id_confirmed`
- **Medium Confidence (65-84%)**: Manual review → `pending_review`
- **Low Confidence (<65%)**: Reject → `rejected`

## API Endpoints

### POST /api/creator/verify-documents

Upload and verify documents with AI analysis.

**Request:**

- `document`: Document image file
- `documentBack`: Back of ID card (required for ID cards)
- `selfie`: Selfie image file
- `documentType`: 'passport' | 'id_card' | 'drivers_license'

**Response:**

```json
{
  "success": true,
  "status": "id_confirmed",
  "scores": {
    "overall": 0.92,
    "documentAuthenticity": 0.89,
    "faceMatch": 0.95,
    "liveness": 0.91
  },
  "confidence": "high",
  "requiresReview": false,
  "message": "Documents verified successfully!",
  "attemptsRemaining": 2
}
```

### GET /api/creator/verification-status

Get current verification status with detailed scores.

**Response:**

```json
{
  "status": "id_confirmed",
  "stage": "application-questions",
  "canReapply": true,
  "verification": {
    "id": 123,
    "aiScore": 0.92,
    "faceMatchScore": 0.95,
    "documentAuthenticityScore": 0.89,
    "livenessScore": 0.91,
    "verificationAttempts": 1,
    "fraudIndicators": {
      "overallRisk": "low"
    }
  }
}
```

## Gemini API Usage & Limits

### Free Tier Limits

- **Requests per minute**: 15
- **Requests per day**: 1,500
- **Tokens per minute**: 1M
- **Cost**: Free

### Usage Optimization

- Images are resized and compressed before sending
- Efficient prompts to minimize token usage
- Error handling for rate limits
- Automatic retry logic

### Expected Usage

- ~3-5 API calls per verification (document analysis, selfie analysis, face comparison)
- ~500-1000 tokens per call
- Daily capacity: ~300-500 verifications on free tier

## Monitoring & Maintenance

### Logs to Monitor

- Verification success/failure rates
- AI confidence scores distribution
- Rate limit hits
- Error patterns

### Key Metrics

- **Verification Accuracy**: Target >95%
- **Processing Time**: Target <60 seconds
- **False Positive Rate**: Target <2%
- **User Satisfaction**: Target >90%

### Maintenance Tasks

- Monitor API usage against limits
- Review and update AI prompts
- Analyze fraud patterns
- Update security measures

## Troubleshooting

### Common Issues

**1. "AI verification service unavailable"**

- Check GEMINI_API_KEY is set correctly
- Verify API key is active in Google AI Studio
- Check internet connectivity

**2. "Rate limit exceeded"**

- Wait for rate limit reset (1 minute for RPM, 24 hours for daily)
- Consider upgrading to paid tier for higher limits
- Implement request queuing

**3. "Document verification failed"**

- Check image quality (not blurry, good lighting)
- Ensure document is fully visible
- Try different image format (JPEG recommended)

**4. Low verification scores**

- Improve image quality
- Use better lighting
- Ensure document is authentic and not damaged
- Take clearer selfie

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages and AI analysis results.

## Security Considerations

### Data Protection

- All uploaded images are stored securely
- Sensitive data is encrypted at rest
- API keys are stored in environment variables
- Regular security audits recommended

### Privacy Compliance

- Images can be automatically deleted after verification
- User consent required for data processing
- GDPR compliance built-in
- Audit trail maintained

### Fraud Prevention

- Multiple verification layers
- Behavioral analysis
- Device fingerprinting
- Suspicious pattern detection

## Scaling Considerations

### High Volume Handling

- Implement request queuing for rate limits
- Consider multiple API keys for load distribution
- Add caching for repeated verifications
- Monitor and optimize performance

### Cost Management

- Track API usage and costs
- Implement usage alerts
- Consider paid tier for high volume
- Optimize prompts to reduce token usage

## Support

For technical issues:

1. Check the logs for detailed error messages
2. Verify all environment variables are set
3. Test with sample images
4. Contact support with specific error details

---

**Next Steps:**

1. Test the system with various document types
2. Monitor verification accuracy and adjust thresholds
3. Implement additional security measures as needed
4. Scale up based on usage patterns
