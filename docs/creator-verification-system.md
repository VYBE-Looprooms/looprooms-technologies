# Vybe Creator Verification System - Complete Implementation Plan

## 🎯 **System Overview**

The creator verification system is a **3-stage process** that ensures only authentic, qualified creators join the platform:

1. **Stage 1**: ID/Passport + Selfie Verification (Automated)
2. **Stage 2**: Creator Application Questions (User Input)  
3. **Stage 3**: Marketing Director Review (Manual Approval)

---

## 🔄 **Creator Journey Flow**

### **Initial State**
- User signs up with `type: 'creator'`
- User has `verified: true` (email verified) but remains `type: 'user'`
- System detects creator intent and triggers onboarding

### **Stage 1: Document Verification**
```
Creator Login → Onboarding Modal → Document Upload → AI Verification → Status: "id_confirmed"
```

### **Stage 2: Application Questions**
```
ID Confirmed → Application Form → Submit Answers → Status: "pending_review"
```

### **Stage 3: Marketing Review**
```
Pending Review → Marketing Dashboard → Approve/Reject → Status: "approved"/"rejected"
```

### **Final State**
- **Approved**: `type` changes from 'user' to 'creator'
- **Rejected**: Remains 'user', can reapply after 30 days

---

## 📊 **Database Schema Updates**

### **Creator Verification Table**
```sql
CREATE TABLE creator_verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  
  -- Stage 1: Document Verification
  id_document_url VARCHAR(500),
  id_document_type ENUM('passport', 'id_card', 'drivers_license'),
  selfie_url VARCHAR(500),
  verification_status ENUM('pending', 'id_confirmed', 'pending_review', 'approved', 'rejected') DEFAULT 'pending',
  ai_verification_score DECIMAL(3,2), -- 0.00 to 1.00
  ai_verification_notes TEXT,
  
  -- Stage 2: Application Data
  application_data JSONB, -- Stores all application answers
  
  -- Stage 3: Marketing Review
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  can_reapply_at TIMESTAMP -- For rejected creators
);
```

### **Application Questions Schema**
```json
{
  "personalInfo": {
    "fullName": "string",
    "dateOfBirth": "date",
    "location": "string",
    "phoneNumber": "string"
  },
  "creatorProfile": {
    "contentCategory": "enum", // Recovery, Fitness, Music, etc.
    "experience": "string",
    "audience": "string",
    "contentPlan": "text",
    "whyVybe": "text"
  },
  "verification": {
    "socialMediaLinks": ["string"],
    "portfolioUrl": "string",
    "references": "text"
  }
}
```

---

## 🖥️ **Frontend Implementation**

### **1. Onboarding Detection & Modal System**

#### **Login Flow Enhancement**
```typescript
// In login success handler
const handleLoginSuccess = (userData) => {
  localStorage.setItem("userToken", token);
  localStorage.setItem("userInfo", JSON.stringify(userData));
  
  // Check if creator needs onboarding
  if (userData.intendedType === 'creator' && userData.type === 'user') {
    checkCreatorVerificationStatus(userData.id);
  } else {
    router.push('/feed');
  }
};

const checkCreatorVerificationStatus = async (userId) => {
  const response = await fetch(`/api/creator/verification-status/${userId}`);
  const { status, stage } = await response.json();
  
  switch (status) {
    case 'not_started':
      showOnboardingModal('document-verification');
      break;
    case 'id_confirmed':
      showOnboardingModal('application-questions');
      break;
    case 'pending_review':
      showStatusModal('pending');
      break;
    case 'approved':
      // Update user type to creator and redirect
      updateUserType('creator');
      router.push('/creator/dashboard');
      break;
    case 'rejected':
      showStatusModal('rejected');
      break;
  }
};
```

#### **Onboarding Modal System**
```typescript
// OnboardingModal.tsx
const OnboardingModal = ({ stage, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const stages = {
    'document-verification': {
      title: "Creator Verification - Step 1",
      subtitle: "Verify your identity to become a trusted creator",
      steps: ['device-detection', 'document-upload', 'selfie-capture', 'processing']
    },
    'application-questions': {
      title: "Creator Application - Step 2", 
      subtitle: "Tell us about your creator journey",
      steps: ['personal-info', 'creator-profile', 'content-plan', 'review']
    }
  };
  
  return (
    <Modal isOpen={true} className="onboarding-modal">
      <ModalContent>
        {stage === 'document-verification' && (
          <DocumentVerificationFlow onComplete={onComplete} />
        )}
        {stage === 'application-questions' && (
          <ApplicationQuestionsFlow onComplete={onComplete} />
        )}
      </ModalContent>
    </Modal>
  );
};
```

### **2. Document Verification Flow**

#### **Device Detection & QR Code System**
```typescript
// DocumentVerificationFlow.tsx
const DocumentVerificationFlow = ({ onComplete }) => {
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile'>('desktop');
  const [verificationMethod, setVerificationMethod] = useState<'camera' | 'qr' | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  
  useEffect(() => {
    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setDeviceType(isMobile ? 'mobile' : 'desktop');
  }, []);
  
  const generateQRCode = async () => {
    // Generate unique session ID for mobile verification
    const sessionId = generateUniqueId();
    const mobileUrl = `${window.location.origin}/creator/verify-mobile?session=${sessionId}`;
    
    // Store session in backend for verification
    await fetch('/api/creator/verification-session', {
      method: 'POST',
      body: JSON.stringify({ sessionId, userId: user.id })
    });
    
    setQrCode(mobileUrl);
    
    // Poll for completion
    pollVerificationStatus(sessionId);
  };
  
  return (
    <div className="verification-flow">
      {/* Step 1: Choose Method */}
      {!verificationMethod && (
        <MethodSelection 
          deviceType={deviceType}
          onSelectCamera={() => setVerificationMethod('camera')}
          onSelectQR={() => {
            setVerificationMethod('qr');
            generateQRCode();
          }}
        />
      )}
      
      {/* Step 2: Camera Verification */}
      {verificationMethod === 'camera' && (
        <CameraVerification onComplete={onComplete} />
      )}
      
      {/* Step 3: QR Code Display */}
      {verificationMethod === 'qr' && qrCode && (
        <QRCodeVerification qrCode={qrCode} onComplete={onComplete} />
      )}
    </div>
  );
};
```

#### **Camera Verification Component**
```typescript
// CameraVerification.tsx
const CameraVerification = ({ onComplete }) => {
  const [step, setStep] = useState<'document' | 'selfie' | 'processing'>('document');
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const captureDocument = async (imageData: string) => {
    setDocumentImage(imageData);
    setStep('selfie');
  };
  
  const captureSelfie = async (imageData: string) => {
    setSelfieImage(imageData);
    setStep('processing');
    await processVerification();
  };
  
  const processVerification = async () => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('document', dataURLtoBlob(documentImage));
      formData.append('selfie', dataURLtoBlob(selfieImage));
      
      const response = await fetch('/api/creator/verify-documents', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        onComplete('id_confirmed');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Verification failed:', error);
      // Show error and retry option
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="camera-verification">
      {step === 'document' && (
        <DocumentCapture onCapture={captureDocument} />
      )}
      {step === 'selfie' && (
        <SelfieCapture onCapture={captureSelfie} />
      )}
      {step === 'processing' && (
        <ProcessingScreen isProcessing={isProcessing} />
      )}
    </div>
  );
};
```

### **3. Application Questions Flow**

#### **Multi-Step Application Form**
```typescript
// ApplicationQuestionsFlow.tsx
const ApplicationQuestionsFlow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    personalInfo: {},
    creatorProfile: {},
    contentPlan: {},
    verification: {}
  });
  
  const steps = [
    {
      id: 'personal-info',
      title: 'Personal Information',
      component: PersonalInfoStep
    },
    {
      id: 'creator-profile', 
      title: 'Creator Profile',
      component: CreatorProfileStep
    },
    {
      id: 'content-plan',
      title: 'Content Strategy',
      component: ContentPlanStep
    },
    {
      id: 'review',
      title: 'Review & Submit',
      component: ReviewStep
    }
  ];
  
  const handleStepComplete = (stepData: any) => {
    const stepId = steps[currentStep].id;
    setFormData(prev => ({
      ...prev,
      [stepId]: stepData
    }));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitApplication();
    }
  };
  
  const submitApplication = async () => {
    try {
      const response = await fetch('/api/creator/submit-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        onComplete('pending_review');
      }
    } catch (error) {
      console.error('Application submission failed:', error);
    }
  };
  
  const CurrentStepComponent = steps[currentStep].component;
  
  return (
    <div className="application-flow">
      <StepIndicator currentStep={currentStep} totalSteps={steps.length} />
      <CurrentStepComponent 
        data={formData[steps[currentStep].id]}
        onComplete={handleStepComplete}
        onBack={() => setCurrentStep(prev => Math.max(0, prev - 1))}
      />
    </div>
  );
};
```

---

## 🔧 **Backend Implementation**

### **1. Verification Status API**
```javascript
// /api/creator/verification-status/:userId
router.get('/verification-status/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is requesting their own status
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const verification = await CreatorVerification.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    
    if (!verification) {
      return res.json({ status: 'not_started', stage: null });
    }
    
    res.json({
      status: verification.verificationStatus,
      stage: getStageFromStatus(verification.verificationStatus),
      canReapply: verification.canReapplyAt ? new Date() > verification.canReapplyAt : true
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to get verification status' });
  }
});
```

### **2. Document Processing API**
```javascript
// /api/creator/verify-documents
const multer = require('multer');
const sharp = require('sharp'); // For image processing
const { analyzeDocument, compareFaces } = require('../services/ai-verification');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

router.post('/verify-documents', 
  authenticateUser, 
  upload.fields([
    { name: 'document', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
  ]), 
  async (req, res) => {
    try {
      const { document, selfie } = req.files;
      
      if (!document || !selfie) {
        return res.status(400).json({ error: 'Both document and selfie required' });
      }
      
      // Process and save images
      const documentPath = await saveProcessedImage(document[0], 'documents');
      const selfiePath = await saveProcessedImage(selfie[0], 'selfies');
      
      // AI Verification
      const documentAnalysis = await analyzeDocument(documentPath);
      const faceComparison = await compareFaces(documentPath, selfiePath);
      
      // Calculate verification score
      const verificationScore = calculateVerificationScore(documentAnalysis, faceComparison);
      
      // Save verification record
      const verification = await CreatorVerification.create({
        userId: req.user.id,
        idDocumentUrl: documentPath,
        selfieUrl: selfiePath,
        verificationStatus: verificationScore > 0.8 ? 'id_confirmed' : 'pending',
        aiVerificationScore: verificationScore,
        aiVerificationNotes: JSON.stringify({
          documentAnalysis,
          faceComparison
        })
      });
      
      res.json({
        success: true,
        status: verification.verificationStatus,
        score: verificationScore
      });
      
    } catch (error) {
      console.error('Document verification error:', error);
      res.status(500).json({ error: 'Verification processing failed' });
    }
  }
);
```

### **3. AI Verification Services**
```javascript
// services/ai-verification.js
const vision = require('@google-cloud/vision'); // Or AWS Rekognition
const client = new vision.ImageAnnotatorClient();

const analyzeDocument = async (imagePath) => {
  try {
    // Detect text in document
    const [textDetection] = await client.textDetection(imagePath);
    const detections = textDetection.textAnnotations;
    
    // Detect document type and validity
    const documentType = detectDocumentType(detections);
    const isValidDocument = validateDocumentStructure(detections, documentType);
    
    // Extract key information
    const extractedInfo = extractDocumentInfo(detections, documentType);
    
    return {
      documentType,
      isValid: isValidDocument,
      confidence: calculateDocumentConfidence(detections),
      extractedInfo
    };
  } catch (error) {
    console.error('Document analysis error:', error);
    return { isValid: false, confidence: 0 };
  }
};

const compareFaces = async (documentPath, selfiePath) => {
  try {
    // Extract face from document
    const [documentFaces] = await client.faceDetection(documentPath);
    const [selfieFaces] = await client.faceDetection(selfiePath);
    
    if (!documentFaces.faceAnnotations?.length || !selfieFaces.faceAnnotations?.length) {
      return { match: false, confidence: 0 };
    }
    
    // Compare facial features (simplified - in production use specialized face recognition)
    const similarity = calculateFaceSimilarity(
      documentFaces.faceAnnotations[0],
      selfieFaces.faceAnnotations[0]
    );
    
    return {
      match: similarity > 0.7,
      confidence: similarity,
      documentFaceDetected: true,
      selfieFaceDetected: true
    };
  } catch (error) {
    console.error('Face comparison error:', error);
    return { match: false, confidence: 0 };
  }
};

const calculateVerificationScore = (documentAnalysis, faceComparison) => {
  let score = 0;
  
  // Document validity (40% weight)
  if (documentAnalysis.isValid) {
    score += 0.4 * documentAnalysis.confidence;
  }
  
  // Face match (40% weight)
  if (faceComparison.match) {
    score += 0.4 * faceComparison.confidence;
  }
  
  // Additional checks (20% weight)
  const additionalScore = 0.2 * (
    (documentAnalysis.extractedInfo ? 0.5 : 0) +
    (faceComparison.documentFaceDetected && faceComparison.selfieFaceDetected ? 0.5 : 0)
  );
  
  score += additionalScore;
  
  return Math.min(1.0, Math.max(0.0, score));
};
```

---

## 🎨 **Marketing Director Dashboard**

### **Creator Review Interface**
```typescript
// /admin/creator-verification/page.tsx
const CreatorVerificationDashboard = () => {
  const [pendingCreators, setPendingCreators] = useState([]);
  const [selectedCreator, setSelectedCreator] = useState(null);
  
  useEffect(() => {
    fetchPendingCreators();
  }, []);
  
  const fetchPendingCreators = async () => {
    const response = await fetch('/api/admin/creator-verifications/pending');
    const data = await response.json();
    setPendingCreators(data);
  };
  
  return (
    <div className="verification-dashboard">
      <div className="pending-list">
        <h2>Pending Creator Verifications</h2>
        {pendingCreators.map(creator => (
          <CreatorCard 
            key={creator.id}
            creator={creator}
            onClick={() => setSelectedCreator(creator)}
          />
        ))}
      </div>
      
      {selectedCreator && (
        <CreatorReviewPanel 
          creator={selectedCreator}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setSelectedCreator(null)}
        />
      )}
    </div>
  );
};

const CreatorReviewPanel = ({ creator, onApprove, onReject }) => {
  return (
    <div className="review-panel">
      {/* Document Verification Results */}
      <DocumentReview 
        documentUrl={creator.idDocumentUrl}
        selfieUrl={creator.selfieUrl}
        aiScore={creator.aiVerificationScore}
        aiNotes={creator.aiVerificationNotes}
      />
      
      {/* Application Answers */}
      <ApplicationReview 
        applicationData={creator.applicationData}
      />
      
      {/* Review Actions */}
      <ReviewActions 
        onApprove={() => onApprove(creator.id)}
        onReject={(reason) => onReject(creator.id, reason)}
      />
    </div>
  );
};
```

---

## 📱 **Mobile QR Code Flow**

### **Mobile Verification Page**
```typescript
// /creator/verify-mobile/page.tsx
const MobileVerificationPage = () => {
  const [sessionId] = useSearchParams();
  const [step, setStep] = useState<'document' | 'selfie' | 'complete'>('document');
  
  const handleDocumentCapture = async (imageData: string) => {
    await uploadToSession(sessionId, 'document', imageData);
    setStep('selfie');
  };
  
  const handleSelfieCapture = async (imageData: string) => {
    await uploadToSession(sessionId, 'selfie', imageData);
    setStep('complete');
    
    // Notify desktop session
    await notifyDesktopCompletion(sessionId);
  };
  
  return (
    <div className="mobile-verification">
      {step === 'document' && (
        <MobileDocumentCapture onCapture={handleDocumentCapture} />
      )}
      {step === 'selfie' && (
        <MobileSelfieCapture onCapture={handleSelfieCapture} />
      )}
      {step === 'complete' && (
        <CompletionMessage />
      )}
    </div>
  );
};
```

---

## 🚀 **Implementation Timeline**

### **Week 1: Core Infrastructure**
- ✅ Database schema updates
- ✅ Basic API endpoints
- ✅ File upload system
- ✅ Onboarding modal system

### **Week 2: Document Verification**
- ✅ Camera integration
- ✅ QR code system
- ✅ AI verification service
- ✅ Mobile verification flow

### **Week 3: Application System**
- ✅ Multi-step application form
- ✅ Question validation
- ✅ Application submission
- ✅ Status tracking

### **Week 4: Marketing Dashboard**
- ✅ Creator review interface
- ✅ Document viewer
- ✅ Approval workflow
- ✅ Communication system

---

This comprehensive system ensures **authentic creator verification** while providing a **smooth user experience** across desktop and mobile devices. The **AI-powered document verification** combined with **human review** creates a robust trust layer for the Vybe platform.