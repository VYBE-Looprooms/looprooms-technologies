const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs").promises;
const path = require("path");

class GeminiVerificationService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }

    console.log(
      "Initializing Gemini service with API key:",
      process.env.GEMINI_API_KEY ? "Present" : "Missing"
    );

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent results
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 2048,
      },
    });

    console.log("Gemini service initialized successfully");
  }

  /**
   * Convert file to base64 for Gemini API
   */
  async fileToBase64(filePath) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      return fileBuffer.toString("base64");
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * Analyze document authenticity and extract information
   */
  async analyzeDocument(documentPath, documentType, documentBackPath = null) {
    try {
      const documentBase64 = await this.fileToBase64(documentPath);
      const parts = [
        {
          text: `Analyze this ${documentType} document. Respond with ONLY valid JSON, no other text:

{
  "documentType": "detected_type",
  "isAuthentic": true,
  "authenticityScore": 0.85,
  "extractedData": {
    "name": "extracted_name",
    "dateOfBirth": "YYYY-MM-DD",
    "documentNumber": "doc_number"
  },
  "qualityAssessment": {
    "overallQuality": 0.85
  },
  "faceDetection": {
    "faceFound": true,
    "faceQuality": 0.9
  },
  "overallScore": 0.85,
  "confidence": 0.9,
  "notes": "Analysis complete"
}`,
        },
        {
          inlineData: {
            data: documentBase64,
            mimeType: "image/jpeg",
          },
        },
      ];

      // Add back of ID card if provided
      if (documentBackPath && documentType === "id_card") {
        const backBase64 = await this.fileToBase64(documentBackPath);
        parts.push({
          text: "Also analyze the back of the ID card:",
        });
        parts.push({
          inlineData: {
            data: backBase64,
            mimeType: "image/jpeg",
          },
        });
      }

      console.log("Sending request to Gemini API...");
      const result = await this.model.generateContent(parts);
      console.log("Received response from Gemini API");
      const responseText = result.response.text();

      console.log("Gemini document analysis response:", responseText);

      // Extract JSON from response - try multiple patterns
      let jsonText = null;

      // First try to find JSON between code blocks
      let codeBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      } else {
        // Try to find raw JSON
        let jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0].trim();
        }
      }

      if (!jsonText) {
        // If no JSON found, create a fallback response with higher scores for retry
        console.warn(
          "No JSON found in Gemini response, creating fallback for retry"
        );
        return {
          documentType: "unknown",
          isAuthentic: false,
          authenticityScore: 0.2, // Low enough to trigger retry
          extractedData: {
            name: "Unable to extract",
            dateOfBirth: null,
            documentNumber: null,
          },
          qualityAssessment: {
            overallQuality: 0.2,
          },
          faceDetection: {
            faceFound: false,
            faceQuality: 0.2,
          },
          overallScore: 0.2,
          confidence: 0.2,
          notes: "Analysis failed - Please try again with clearer photos",
        };
      }

      try {
        return JSON.parse(jsonText);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        console.error("Raw response:", responseText);

        // Return fallback response
        return {
          documentType: "unknown",
          isAuthentic: false,
          authenticityScore: 0.2, // Low enough to trigger retry
          extractedData: {
            name: "Parse error",
            dateOfBirth: null,
            documentNumber: null,
            expiryDate: null,
            nationality: null,
            additionalFields: {},
          },
          qualityAssessment: {
            clarity: 0.2,
            lighting: 0.2,
            resolution: 0.2,
            overallQuality: 0.2,
          },
          securityFeatures: {
            watermarks: false,
            holograms: false,
            specialFonts: false,
            microtext: false,
            score: 0.2,
          },
          fraudIndicators: {
            digitalManipulation: false,
            photoReplacement: false,
            textAlteration: false,
            suspiciousElements: ["JSON parsing failed"],
            riskLevel: "high",
          },
          faceDetection: {
            faceFound: false,
            faceQuality: 0.2,
            facePosition: null,
          },
          overallScore: 0.2,
          confidence: 0.2,
          notes: `Please try again with clearer photos - parsing failed: ${parseError.message}`,
        };
      }
    } catch (error) {
      console.error("Document analysis error:", error);
      throw new Error(`Document analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze selfie for liveness detection
   */
  async analyzeSelfie(selfiePath) {
    try {
      const selfieBase64 = await this.fileToBase64(selfiePath);

      const result = await this.model.generateContent([
        {
          text: `Analyze this selfie for liveness. Respond with ONLY valid JSON:

{
  "livenessDetection": {
    "isLive": true,
    "livenessScore": 0.9
  },
  "faceQuality": {
    "faceDetected": true,
    "faceClarity": 0.9
  },
  "imageQuality": {
    "overallQuality": 0.85
  },
  "overallScore": 0.85,
  "confidence": 0.9,
  "notes": "Selfie analysis complete"
}`,
        },
        {
          inlineData: {
            data: selfieBase64,
            mimeType: "image/jpeg",
          },
        },
      ]);

      const responseText = result.response.text();

      console.log("Gemini selfie analysis response:", responseText);

      // Extract JSON from response - try multiple patterns
      let jsonText = null;

      // First try to find JSON between code blocks
      let codeBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      } else {
        // Try to find raw JSON
        let jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0].trim();
        }
      }

      if (!jsonText) {
        console.warn(
          "No JSON found in selfie analysis response, creating fallback"
        );
        return {
          livenessDetection: {
            isLive: false,
            livenessScore: 0.3,
          },
          faceQuality: {
            faceDetected: false,
            faceClarity: 0.3,
          },
          imageQuality: {
            overallQuality: 0.3,
          },
          overallScore: 0.3,
          confidence: 0.3,
          notes:
            "Selfie analysis failed - Gemini API did not return valid JSON response",
        };
      }

      try {
        return JSON.parse(jsonText);
      } catch (parseError) {
        console.error("Selfie JSON parsing error:", parseError);
        console.error("Raw selfie response:", responseText);

        return {
          livenessDetection: {
            isLive: false,
            livenessScore: 0.3,
            indicators: {
              naturalLighting: false,
              eyeReflection: false,
              skinTexture: false,
              facialMovement: false,
            },
          },
          faceQuality: {
            faceDetected: false,
            faceClarity: 0.3,
            facialAngle: "unknown",
            eyesVisible: false,
            mouthVisible: false,
            faceSize: "too_small",
          },
          imageQuality: {
            resolution: 0.5,
            lighting: 0.5,
            blur: 0.5,
            overallQuality: 0.5,
          },
          fraudIndicators: {
            screenReflection: false,
            photoOfPhoto: false,
            digitalManipulation: false,
            maskDetection: false,
            suspiciousElements: ["JSON parsing failed"],
            riskLevel: "high",
          },
          overallScore: 0.3,
          confidence: 0.3,
          notes: `Selfie JSON parsing failed: ${parseError.message}`,
        };
      }
    } catch (error) {
      console.error("Selfie analysis error:", error);
      throw new Error(`Selfie analysis failed: ${error.message}`);
    }
  }

  /**
   * Compare faces between document and selfie
   */
  async compareFaces(documentPath, selfiePath, documentAnalysis) {
    try {
      const documentBase64 = await this.fileToBase64(documentPath);
      const selfieBase64 = await this.fileToBase64(selfiePath);

      const result = await this.model.generateContent([
        {
          text: `Compare faces in ID document and selfie. Respond with ONLY valid JSON:

{
  "faceComparison": {
    "documentFaceFound": true,
    "selfieFaceFound": true,
    "facesMatch": true,
    "matchScore": 0.85,
    "confidence": 0.9
  },
  "overallScore": 0.85,
  "recommendation": "approve",
  "notes": "Face comparison complete"
}`,
        },
        {
          text: "ID Document Image:",
        },
        {
          inlineData: {
            data: documentBase64,
            mimeType: "image/jpeg",
          },
        },
        {
          text: "Selfie Image:",
        },
        {
          inlineData: {
            data: selfieBase64,
            mimeType: "image/jpeg",
          },
        },
      ]);

      const responseText = result.response.text();

      console.log("Gemini face comparison response:", responseText);

      // Extract JSON from response - try multiple patterns
      let jsonText = null;

      // First try to find JSON between code blocks
      let codeBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      } else {
        // Try to find raw JSON
        let jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0].trim();
        }
      }

      if (!jsonText) {
        console.warn(
          "No JSON found in face comparison response, creating fallback"
        );
        return {
          faceComparison: {
            documentFaceFound: false,
            selfieFaceFound: false,
            facesMatch: false,
            matchScore: 0.3,
            confidence: 0.3,
          },
          overallScore: 0.3,
          recommendation: "reject",
          notes:
            "Face comparison failed - Gemini API did not return valid JSON response",
        };
      }

      try {
        return JSON.parse(jsonText);
      } catch (parseError) {
        console.error("Face comparison JSON parsing error:", parseError);
        console.error("Raw face comparison response:", responseText);

        return {
          faceComparison: {
            documentFaceFound: false,
            selfieFaceFound: false,
            facesMatch: false,
            matchScore: 0.3,
            confidence: 0.3,
          },
          featureAnalysis: {
            eyesSimilarity: 0.3,
            noseSimilarity: 0.3,
            mouthSimilarity: 0.3,
            faceShapeSimilarity: 0.3,
            overallSimilarity: 0.3,
          },
          qualityFactors: {
            documentImageQuality: 0.5,
            selfieImageQuality: 0.5,
            lightingConsistency: 0.5,
            angleConsistency: 0.5,
            suitableForComparison: false,
          },
          ageConsistency: {
            apparentAgeDocument: "unknown",
            apparentAgeSelfie: "unknown",
            ageConsistent: false,
            ageScore: 0.3,
          },
          riskFactors: {
            differentPerson: true,
            poorImageQuality: true,
            significantAgeDiscrepancy: false,
            suspiciousElements: ["JSON parsing failed"],
            riskLevel: "high",
          },
          overallScore: 0.3,
          recommendation: "reject",
          notes: `Face comparison JSON parsing failed: ${parseError.message}`,
        };
      }
    } catch (error) {
      console.error("Face comparison error:", error);
      throw new Error(`Face comparison failed: ${error.message}`);
    }
  }

  /**
   * Complete verification process
   */
  async verifyDocuments(
    documentPath,
    selfiePath,
    documentType,
    documentBackPath = null
  ) {
    try {
      console.log("Starting Gemini verification process...");

      // Step 1: Analyze document
      console.log("Analyzing document...");
      const documentAnalysis = await this.analyzeDocument(
        documentPath,
        documentType,
        documentBackPath
      );

      // Step 2: Analyze selfie
      console.log("Analyzing selfie...");
      const selfieAnalysis = await this.analyzeSelfie(selfiePath);

      // Step 3: Compare faces
      console.log("Comparing faces...");
      const faceComparison = await this.compareFaces(
        documentPath,
        selfiePath,
        documentAnalysis
      );

      // Step 4: Calculate overall scores
      const overallScore = this.calculateOverallScore(
        documentAnalysis,
        selfieAnalysis,
        faceComparison
      );

      // Step 5: Make verification decision
      const decision = this.makeVerificationDecision(overallScore);

      const result = {
        documentAnalysis,
        selfieAnalysis,
        faceComparison,
        scores: {
          documentAuthenticity: documentAnalysis.authenticityScore,
          liveness: selfieAnalysis.livenessDetection.livenessScore,
          faceMatch: faceComparison.faceComparison.matchScore,
          overall: overallScore.overall,
        },
        decision,
        timestamp: new Date().toISOString(),
        model: "gemini-2.5-flash",
      };

      console.log("Verification completed:", {
        overall: overallScore.overall,
        decision: decision.status,
        requiresReview: decision.requiresManualReview,
      });

      return result;
    } catch (error) {
      console.error("Complete verification error:", error);
      throw error;
    }
  }

  /**
   * Calculate overall verification score
   */
  calculateOverallScore(documentAnalysis, selfieAnalysis, faceComparison) {
    const weights = {
      documentAuthenticity: 0.35,
      liveness: 0.25,
      faceMatch: 0.3,
      imageQuality: 0.1,
    };

    const scores = {
      documentAuthenticity: documentAnalysis.authenticityScore || 0,
      liveness: selfieAnalysis.livenessDetection?.livenessScore || 0,
      faceMatch: faceComparison.faceComparison?.matchScore || 0,
      imageQuality:
        ((documentAnalysis.qualityAssessment?.overallQuality || 0) +
          (selfieAnalysis.imageQuality?.overallQuality || 0)) /
        2,
    };

    const overall = Object.keys(weights).reduce((sum, key) => {
      return sum + scores[key] * weights[key];
    }, 0);

    return {
      ...scores,
      overall: Math.round(overall * 100) / 100,
      weights,
    };
  }

  /**
   * Make verification decision based on scores
   */
  makeVerificationDecision(scores) {
    const { overall, documentAuthenticity, liveness, faceMatch } = scores;

    console.log("Making verification decision with scores:", {
      overall,
      documentAuthenticity,
      liveness,
      faceMatch,
    });

    // High confidence thresholds - proceed to application questions
    if (
      overall >= 0.65 &&
      documentAuthenticity >= 0.6 &&
      liveness >= 0.6 &&
      faceMatch >= 0.6
    ) {
      return {
        status: "id_confirmed",
        requiresManualReview: false,
        confidence: "high",
        message:
          "Documents verified successfully! Please complete your application.",
      };
    }

    // Medium confidence - still proceed to application questions
    if (
      overall >= 0.45 &&
      documentAuthenticity >= 0.4 &&
      liveness >= 0.4 &&
      faceMatch >= 0.4
    ) {
      return {
        status: "id_confirmed",
        requiresManualReview: false,
        confidence: "medium",
        message: "Documents verified! Please complete your application.",
      };
    }

    // Very low confidence - likely parsing error or very poor quality
    if (
      overall <= 0.35 ||
      documentAuthenticity <= 0.35 ||
      liveness <= 0.35 ||
      faceMatch <= 0.35
    ) {
      return {
        status: "verification_failed",
        requiresManualReview: false,
        confidence: "low",
        message:
          "Document verification failed. Please ensure your photos are clear and well-lit, then try again.",
        canRetry: true,
      };
    }

    // Low-medium confidence - ask to retry with better photos
    return {
      status: "verification_failed",
      requiresManualReview: false,
      confidence: "low",
      message:
        "Document verification needs improvement. Please upload clearer photos with better lighting and try again.",
      canRetry: true,
    };
  }

  /**
   * Validate file before processing
   */
  async validateFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (stats.size > maxSize) {
        throw new Error("File size exceeds 10MB limit");
      }

      if (stats.size < 10000) {
        // 10KB minimum
        throw new Error("File size too small, may be corrupted");
      }

      return true;
    } catch (error) {
      throw new Error(`File validation failed: ${error.message}`);
    }
  }
}

module.exports = GeminiVerificationService;
