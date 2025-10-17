"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  UserCheck,
  Upload,
  FileText,
  Camera,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface ApplicationData {
  personalInfo: {
    phoneNumber: string;
    instagramHandle: string;
    dateOfBirth: string;
    country: string;
  };
  creatorProfile: {
    looproomCategory: string;
    looproomDescription: string;
    contentFrequency: string;
    audienceSize: string;
    vybeGoals: string;
    agreesToGuidelines: boolean;
    signature: string;
  };
}

export default function CreatorApplication() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    personalInfo: {
      phoneNumber: "",
      instagramHandle: "",
      dateOfBirth: "",
      country: "",
    },
    creatorProfile: {
      looproomCategory: "",
      looproomDescription: "",
      contentFrequency: "",
      audienceSize: "",
      vybeGoals: "",
      agreesToGuidelines: false,
      signature: "",
    },
  });

  useEffect(() => {
    // Check authentication and verification status
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          router.push("/login?redirect=/creator/apply");
          return;
        }

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
          }/creator/verification-status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          setVerificationStatus(result.status);
          
          // Redirect based on status
          if (result.status === 'approved') {
            router.push('/creator/dashboard');
          } else if (result.status === 'pending_review') {
            router.push('/creator/status');
          }
        }
      } catch (error) {
        console.error("Status check error:", error);
      }
    };

    checkStatus();
  }, [router]);

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
    }
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfieFile(file);
    }
  };

  const handleDocumentVerification = async () => {
    if (!documentFile || !selfieFile || !documentType) {
      alert("Please upload both documents and select document type.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("userToken");
      const formData = new FormData();
      formData.append("document", documentFile);
      formData.append("selfie", selfieFile);
      formData.append("documentType", documentType);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/creator/verify-documents`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Verification successful - proceed to step 2
        if (result.status === 'id_confirmed') {
          setCurrentStep(2);
        } else {
          alert("Document verification is pending manual review. Please check back later.");
        }
      } else if (result.error === 'verification_failed') {
        // Verification failed but can retry
        alert(`${result.message}\n\nSuggestions:\n${result.suggestions?.join('\n') || 'Please try again with clearer photos.'}\n\nAttempts remaining: ${result.attemptsRemaining}`);
        
        // Clear the uploaded files so user can try again
        setDocumentFile(null);
        setSelfieFile(null);
        
        // Reset file inputs
        const documentInput = document.getElementById('document-upload') as HTMLInputElement;
        const selfieInput = document.getElementById('selfie-upload') as HTMLInputElement;
        if (documentInput) documentInput.value = '';
        if (selfieInput) selfieInput.value = '';
      } else {
        // Other errors
        const errorMessage = result.error || result.message || "Document verification failed. Please try again.";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Document verification error:", error);
      alert("Document verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmit = async () => {
    // Validate required fields
    const { personalInfo, creatorProfile } = applicationData;
    
    if (!personalInfo.phoneNumber || !personalInfo.instagramHandle || 
        !personalInfo.dateOfBirth || !personalInfo.country ||
        !creatorProfile.looproomCategory || !creatorProfile.looproomDescription ||
        !creatorProfile.contentFrequency || !creatorProfile.audienceSize ||
        !creatorProfile.vybeGoals || !creatorProfile.agreesToGuidelines ||
        !creatorProfile.signature) {
      alert("Please fill in all required fields and agree to the guidelines.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/creator/submit-application`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData),
        }
      );

      if (response.ok) {
        router.push("/creator/status");
      } else {
        const error = await response.json();
        alert(error.error || "Application submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Application submission error:", error);
      alert("Application submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setApplicationData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const updateCreatorProfile = (field: string, value: string | boolean) => {
    setApplicationData(prev => ({
      ...prev,
      creatorProfile: {
        ...prev.creatorProfile,
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Become a Vybe Creator
          </h1>
          <p className="text-muted-foreground">
            Join our community of verified creators and start building Looprooms
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Step 1: Document Verification */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="w-5 h-5 mr-2" />
                Step 1: Identity Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  To ensure trust and safety in our community, we need to verify your identity. 
                  Please upload a clear photo of your government-issued ID and a selfie.
                </p>
              </div>

              {/* Document Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Document Type *
                </label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="id_card">National ID Card</SelectItem>
                    <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Government ID Document *
                </label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="document-upload"
                  />
                  <label htmlFor="document-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {documentFile ? documentFile.name : "Click to upload your ID document"}
                    </p>
                  </label>
                </div>
              </div>

              {/* Selfie Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Camera className="w-4 h-4 inline mr-1" />
                  Selfie Verification *
                </label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSelfieUpload}
                    className="hidden"
                    id="selfie-upload"
                  />
                  <label htmlFor="selfie-upload" className="cursor-pointer">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {selfieFile ? selfieFile.name : "Click to upload your selfie"}
                    </p>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleDocumentVerification}
                disabled={loading || !documentFile || !selfieFile || !documentType}
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify Documents"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Application Form */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      value={applicationData.personalInfo.phoneNumber}
                      onChange={(e) => updatePersonalInfo('phoneNumber', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Instagram Handle *
                    </label>
                    <Input
                      value={applicationData.personalInfo.instagramHandle}
                      onChange={(e) => updatePersonalInfo('instagramHandle', e.target.value)}
                      placeholder="@yourusername"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Date of Birth *
                    </label>
                    <Input
                      type="date"
                      value={applicationData.personalInfo.dateOfBirth}
                      onChange={(e) => updatePersonalInfo('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Country *
                    </label>
                    <Input
                      value={applicationData.personalInfo.country}
                      onChange={(e) => updatePersonalInfo('country', e.target.value)}
                      placeholder="United States"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creator Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Creator Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Looproom Category *
                  </label>
                  <Select 
                    value={applicationData.creatorProfile.looproomCategory} 
                    onValueChange={(value) => updateCreatorProfile('looproomCategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your main category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wellness">Wellness & Mental Health</SelectItem>
                      <SelectItem value="fitness">Fitness & Physical Health</SelectItem>
                      <SelectItem value="productivity">Productivity & Focus</SelectItem>
                      <SelectItem value="creativity">Creativity & Arts</SelectItem>
                      <SelectItem value="learning">Learning & Education</SelectItem>
                      <SelectItem value="relationships">Relationships & Social</SelectItem>
                      <SelectItem value="spirituality">Spirituality & Mindfulness</SelectItem>
                      <SelectItem value="recovery">Recovery & Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Looproom Description *
                  </label>
                  <Textarea
                    value={applicationData.creatorProfile.looproomDescription}
                    onChange={(e) => updateCreatorProfile('looproomDescription', e.target.value)}
                    placeholder="Describe what your Looproom will be about and how it will help users..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Content Frequency *
                    </label>
                    <Select 
                      value={applicationData.creatorProfile.contentFrequency} 
                      onValueChange={(value) => updateCreatorProfile('contentFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How often will you create content?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="few-times-week">Few times a week</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Current Audience Size *
                    </label>
                    <Select 
                      value={applicationData.creatorProfile.audienceSize} 
                      onValueChange={(value) => updateCreatorProfile('audienceSize', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your audience size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-100">0-100 followers</SelectItem>
                        <SelectItem value="100-1k">100-1K followers</SelectItem>
                        <SelectItem value="1k-10k">1K-10K followers</SelectItem>
                        <SelectItem value="10k-100k">10K-100K followers</SelectItem>
                        <SelectItem value="100k+">100K+ followers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Goals with Vybe *
                  </label>
                  <Textarea
                    value={applicationData.creatorProfile.vybeGoals}
                    onChange={(e) => updateCreatorProfile('vybeGoals', e.target.value)}
                    placeholder="What do you hope to achieve as a Vybe creator? How will you help users feel better?"
                    rows={4}
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="guidelines"
                    checked={applicationData.creatorProfile.agreesToGuidelines}
                    onChange={(e) => updateCreatorProfile('agreesToGuidelines', e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="guidelines" className="text-sm">
                    I agree to follow Vybe looptoom&apos;s creator guidelines and community standards. I understand that my content will be reviewed and I commit to creating positive, supportive experiences for users. *
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Digital Signature *
                  </label>
                  <Input
                    value={applicationData.creatorProfile.signature}
                    onChange={(e) => updateCreatorProfile('signature', e.target.value)}
                    placeholder="Type your full name as digital signature"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleApplicationSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Submitting..." : "Submit Application"}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}