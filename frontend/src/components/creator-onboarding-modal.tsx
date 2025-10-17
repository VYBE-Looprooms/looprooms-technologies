"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Camera, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  User,
  FileText,
  Eye,
  Clock
} from "lucide-react"

interface OnboardingModalProps {
  isOpen: boolean
  stage: 'document-verification' | 'application-questions' | 'under-review' | 'approved' | 'rejected'
  onComplete: (newStage: string) => void
  onClose: () => void
}

export default function CreatorOnboardingModal({ isOpen, stage, onComplete, onClose }: OnboardingModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {stage === 'document-verification' && (
          <DocumentVerificationFlow onComplete={onComplete} onClose={onClose} />
        )}
        {stage === 'application-questions' && (
          <ApplicationQuestionsFlow onComplete={onComplete} onClose={onClose} />
        )}
        {stage === 'under-review' && (
          <UnderReviewStatus onClose={onClose} />
        )}
        {stage === 'approved' && (
          <ApprovedStatus onComplete={onComplete} onClose={onClose} />
        )}
        {stage === 'rejected' && (
          <RejectedStatus onClose={onClose} />
        )}
      </div>
    </div>
  )
}

// Document Verification Flow
function DocumentVerificationFlow({ onComplete, onClose }: { onComplete: (stage: string) => void, onClose: () => void }) {
  const [step, setStep] = useState<'intro' | 'method' | 'upload' | 'processing'>('intro')
  const [method, setMethod] = useState<'camera' | 'upload' | null>(null)
  const [files, setFiles] = useState<{ 
    document: File | null, 
    documentBack: File | null, 
    selfie: File | null 
  }>({ document: null, documentBack: null, selfie: null })
  const [documentType, setDocumentType] = useState<'passport' | 'id_card' | 'drivers_license' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (type: 'document' | 'documentBack' | 'selfie', file: File) => {
    setFiles(prev => ({ ...prev, [type]: file }))
  }

  const handleSubmit = async () => {
    if (!files.document || !files.selfie || !documentType) {
      alert('Please upload all required documents and select document type')
      return
    }

    // For ID cards, back is required
    if (documentType === 'id_card' && !files.documentBack) {
      alert('Please upload both front and back of your ID card')
      return
    }

    setIsProcessing(true)
    setStep('processing')

    try {
      const formData = new FormData()
      formData.append('document', files.document)
      if (files.documentBack) {
        formData.append('documentBack', files.documentBack)
      }
      formData.append('selfie', files.selfie)
      formData.append('documentType', documentType)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/creator/verify-documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: formData
      })

      const result = await response.json()

      if (result.success && result.status === 'id_confirmed') {
        setTimeout(() => {
          onComplete('application-questions')
        }, 2000)
      } else if (result.error === 'verification_failed') {
        // Verification failed but can retry
        alert(`${result.message}\n\nSuggestions:\n${result.suggestions?.join('\n') || 'Please try again with clearer photos.'}\n\nAttempts remaining: ${result.attemptsRemaining}`)
        
        // Reset to upload step so user can try again
        setFiles({ document: null, documentBack: null, selfie: null })
        setStep('upload')
      } else {
        throw new Error(result.error || result.message || 'Verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Verification failed: ${errorMessage}. Please try again.`)
      setStep('upload')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold">Creator Verification - Step 1</CardTitle>
        <p className="text-muted-foreground">Verify your identity to become a trusted Vybe creator</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'intro' && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Identity Verification Required</h3>
              <p className="text-muted-foreground mb-4">
                To maintain trust and safety, all creators must verify their identity with a government-issued ID and selfie.
              </p>
              <div className="bg-primary/5 rounded-lg p-4 text-sm">
                <p><strong>What you&apos;ll need:</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Government-issued ID (passport, driver&apos;s license, or national ID)</li>
                  <li>Clear selfie photo</li>
                  <li>Good lighting and stable internet connection</li>
                </ul>
              </div>
            </div>
            <Button onClick={() => setStep('method')} className="w-full">
              Start Verification
            </Button>
          </div>
        )}

        {step === 'method' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Choose Verification Method</h3>
              <p className="text-muted-foreground">Select how you&apos;d like to upload your documents</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${method === 'upload' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setMethod('upload')}
              >
                <CardContent className="p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h4 className="font-semibold mb-2">Upload Files</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload photos of your ID and take a selfie
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${method === 'camera' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setMethod('camera')}
              >
                <CardContent className="p-6 text-center">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="font-semibold mb-2">Use Camera</h4>
                  <p className="text-sm text-muted-foreground">
                    Coming soon - Direct camera capture
                  </p>
                </CardContent>
              </Card>
            </div>

            {method && (
              <Button 
                onClick={() => setStep('upload')} 
                className="w-full"
                disabled={method === 'camera'}
              >
                Continue with {method === 'upload' ? 'File Upload' : 'Camera'}
              </Button>
            )}
          </div>
        )}

        {step === 'upload' && (
          <>
            <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Upload Your Documents</h3>
              <p className="text-muted-foreground">Please upload clear, well-lit photos</p>
            </div>

            {/* Document Type Selection */}
            <div className="space-y-4">
              <h4 className="font-semibold">Select Document Type</h4>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDocumentType('passport')}
                  className={`p-3 border rounded-lg text-center transition-all ${documentType === 'passport' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                >
                  <div className="text-sm font-medium">Passport</div>
                  <div className="text-xs text-muted-foreground">Single page</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDocumentType('id_card')}
                  className={`p-3 border rounded-lg text-center transition-all ${documentType === 'id_card' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                >
                  <div className="text-sm font-medium">ID Card</div>
                  <div className="text-xs text-muted-foreground">Front & back</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDocumentType('drivers_license')}
                  className={`p-3 border rounded-lg text-center transition-all ${documentType === 'drivers_license' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                >
                  <div className="text-sm font-medium">Driver&apos;s License</div>
                  <div className="text-xs text-muted-foreground">Single page</div>
                </button>
              </div>
            </div>

            {documentType && (
              <div className="grid gap-6">
                {/* Document Front Upload */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    {documentType === 'passport' ? 'Passport' :
                      documentType === 'id_card' ? 'ID Card (Front)' :
                        'Driver\'s License'}
                  </h4>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {files.document ? (
                      <div className="space-y-2">
                        <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
                        <p className="text-sm font-medium">{files.document.name}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('document-upload')?.click()}
                        >
                          Change File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Upload {documentType === 'passport' ? 'your passport' :
                            documentType === 'id_card' ? 'front of your ID card' :
                              'your driver\'s license'}
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload('document', e.target.files[0])}
                          className="hidden"
                          id="document-upload" />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('document-upload')?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ID Card Back Upload (only for ID cards) */}
                {documentType === 'id_card' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      ID Card (Back)
                    </h4>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      {files.documentBack ? (
                        <div className="space-y-2">
                          <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
                          <p className="text-sm font-medium">{files.documentBack.name}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('document-back-upload')?.click()}
                          >
                            Change File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Upload back of your ID card
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload('documentBack', e.target.files[0])}
                            className="hidden"
                            id="document-back-upload" />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('document-back-upload')?.click()}
                          >
                            Choose File
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Selfie Upload */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Selfie Photo
                  </h4>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {files.selfie ? (
                      <div className="space-y-2">
                        <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
                        <p className="text-sm font-medium">{files.selfie.name}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('selfie-upload')?.click()}
                        >
                          Change File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Camera className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Take a clear selfie photo
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          capture="user"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload('selfie', e.target.files[0])}
                          className="hidden"
                          id="selfie-upload" />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('selfie-upload')?.click()}
                        >
                          Take Selfie
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Important Tips:</p>
                  <ul className="mt-1 text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Ensure your {documentType === 'passport' ? 'passport' : 'ID'} is clearly visible and not blurry</li>
                    <li>• Your selfie should clearly show your face</li>
                    <li>• Use good lighting and avoid shadows</li>
                    <li>• Make sure all text on your document is readable</li>
                    {documentType === 'id_card' && <li>• Upload both front and back of your ID card</li>}
                  </ul>
                </div>
              </div>
            </div>
            
          </div><div className="flex space-x-4">
              <Button variant="outline" onClick={() => setStep('method')} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!files.document ||
                  !files.selfie ||
                  !documentType ||
                  (documentType === 'id_card' && !files.documentBack)}
                className="flex-1"
              >
                Submit for Verification
              </Button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              {isProcessing ? (
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              ) : (
                <CheckCircle className="w-10 h-10 text-green-500" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {isProcessing ? 'Processing Your Documents...' : 'Documents Verified!'}
              </h3>
              <p className="text-muted-foreground">
                {isProcessing 
                  ? 'Please wait while we verify your identity. This usually takes a few seconds.'
                  : 'Your identity has been verified. Proceeding to the next step...'
                }
              </p>
            </div>
          </div>
        )}

        {step !== 'processing' && (
          <div className="flex justify-end pt-4 border-t">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Application Questions Flow - Complete Implementation
function ApplicationQuestionsFlow({ onComplete, onClose }: { onComplete: (stage: string) => void, onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    personalInfo: {
      phoneNumber: '',
      instagramHandle: '',
    },
    creatorProfile: {
      looproomCategory: '',
      looproomDescription: '',
      hasHostedBefore: '',
      hostingExperience: '',
      contentFrequency: '',
      audienceSize: '',
      currentlyMonetizing: '',
      monetizationDescription: '',
      vybeGoals: '',
      portfolioLinks: '',
      agreesToGuidelines: false,
      signature: ''
    }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps = [
    { title: 'Personal Information', id: 'personal' },
    { title: 'Creator Profile', id: 'profile' },
    { title: 'Content & Audience', id: 'content' },
    { title: 'Goals & Agreement', id: 'agreement' }
  ]

  const looproomCategories = [
    'Recovery & Wellness',
    'Fitness & Health', 
    'Mindfulness & Meditation',
    'Music & Arts',
    'Social & Community',
    'Productivity & Learning',
    'Other'
  ]

  const handleInputChange = (section: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/creator/submit-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        onComplete('under-review')
      } else {
        throw new Error(result.error || 'Application submission failed')
      }
    } catch (error) {
      console.error('Application submission error:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Personal Info
        return formData.personalInfo.phoneNumber && formData.personalInfo.instagramHandle
      case 1: // Creator Profile  
        return formData.creatorProfile.looproomCategory && formData.creatorProfile.looproomDescription
      case 2: // Content & Audience
        return formData.creatorProfile.contentFrequency && formData.creatorProfile.audienceSize
      case 3: // Agreement
        return formData.creatorProfile.vybeGoals && formData.creatorProfile.agreesToGuidelines && formData.creatorProfile.signature
      default:
        return false
    }
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold">Creator Application - Step 2</CardTitle>
        <p className="text-muted-foreground">Tell us about your creator journey</p>
        
        {/* Progress Indicator */}
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Step 1: Personal Information */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number *
              </label>
              <Input
                type="tel"
                value={formData.personalInfo.phoneNumber}
                onChange={(e) => handleInputChange('personalInfo', 'phoneNumber', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="h-12"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Instagram Handle or Social Link *
              </label>
              <Input
                type="text"
                value={formData.personalInfo.instagramHandle}
                onChange={(e) => handleInputChange('personalInfo', 'instagramHandle', e.target.value)}
                placeholder="@yourusername or social media link"
                className="h-12"
              />
            </div>
          </div>
        )}

        {/* Step 2: Creator Profile */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Looproom Category *
              </label>
              <select
                value={formData.creatorProfile.looproomCategory}
                onChange={(e) => handleInputChange('creatorProfile', 'looproomCategory', e.target.value)}
                className="w-full h-12 px-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a category</option>
                {looproomCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Describe what your Looproom will offer? *
              </label>
              <textarea
                value={formData.creatorProfile.looproomDescription}
                onChange={(e) => handleInputChange('creatorProfile', 'looproomDescription', e.target.value)}
                placeholder="Tell us about the content, experiences, and value you'll provide in your Looproom..."
                className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Have you hosted live or interactive content before?
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasHostedBefore"
                    value="yes"
                    checked={formData.creatorProfile.hasHostedBefore === 'yes'}
                    onChange={(e) => handleInputChange('creatorProfile', 'hasHostedBefore', e.target.value)}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasHostedBefore"
                    value="no"
                    checked={formData.creatorProfile.hasHostedBefore === 'no'}
                    onChange={(e) => handleInputChange('creatorProfile', 'hasHostedBefore', e.target.value)}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
            </div>
            
            {formData.creatorProfile.hasHostedBefore === 'yes' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  If yes, describe:
                </label>
                <textarea
                  value={formData.creatorProfile.hostingExperience}
                  onChange={(e) => handleInputChange('creatorProfile', 'hostingExperience', e.target.value)}
                  placeholder="Describe your experience with live or interactive content..."
                  className="w-full min-h-[80px] px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Content & Audience */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                How often do you plan to go live or post content? *
              </label>
              <select
                value={formData.creatorProfile.contentFrequency}
                onChange={(e) => handleInputChange('creatorProfile', 'contentFrequency', e.target.value)}
                className="w-full h-12 px-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select frequency</option>
                <option value="daily">Daily</option>
                <option value="few-times-week">A few times per week</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="as-needed">As needed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Estimated audience size (followers, subscribers, email list, etc.) *
              </label>
              <select
                value={formData.creatorProfile.audienceSize}
                onChange={(e) => handleInputChange('creatorProfile', 'audienceSize', e.target.value)}
                className="w-full h-12 px-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select audience size</option>
                <option value="0-100">0-100</option>
                <option value="100-1k">100-1,000</option>
                <option value="1k-10k">1,000-10,000</option>
                <option value="10k-100k">10,000-100,000</option>
                <option value="100k+">100,000+</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Do you currently monetize your content?
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="currentlyMonetizing"
                    value="yes"
                    checked={formData.creatorProfile.currentlyMonetizing === 'yes'}
                    onChange={(e) => handleInputChange('creatorProfile', 'currentlyMonetizing', e.target.value)}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="currentlyMonetizing"
                    value="no"
                    checked={formData.creatorProfile.currentlyMonetizing === 'no'}
                    onChange={(e) => handleInputChange('creatorProfile', 'currentlyMonetizing', e.target.value)}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
            </div>
            
            {formData.creatorProfile.currentlyMonetizing === 'yes' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  If yes, describe:
                </label>
                <textarea
                  value={formData.creatorProfile.monetizationDescription}
                  onChange={(e) => handleInputChange('creatorProfile', 'monetizationDescription', e.target.value)}
                  placeholder="Describe how you currently monetize your content..."
                  className="w-full min-h-[80px] px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 4: Goals & Agreement */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                What do you hope to gain as an Exclusive Looper with Vybe? *
              </label>
              <textarea
                value={formData.creatorProfile.vybeGoals}
                onChange={(e) => handleInputChange('creatorProfile', 'vybeGoals', e.target.value)}
                placeholder="Tell us about your goals, what you hope to achieve, and how Vybe can help you grow..."
                className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                (Optional) Upload any relevant links, portfolios, or videos
              </label>
              <textarea
                value={formData.creatorProfile.portfolioLinks}
                onChange={(e) => handleInputChange('creatorProfile', 'portfolioLinks', e.target.value)}
                placeholder="Share links to your portfolio, previous work, social media, or any content that showcases your abilities..."
                className="w-full min-h-[80px] px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
            </div>
            
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="guidelines"
                  checked={formData.creatorProfile.agreesToGuidelines}
                  onChange={(e) => handleInputChange('creatorProfile', 'agreesToGuidelines', e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="guidelines" className="text-sm text-foreground">
                  I agree to follow Vybe looproom&apos;s community guidelines and content standards *
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type your full name to confirm your interest *
                </label>
                <Input
                  type="text"
                  value={formData.creatorProfile.signature}
                  onChange={(e) => handleInputChange('creatorProfile', 'signature', e.target.value)}
                  placeholder="Your full name"
                  className="h-12"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-border">
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
          
          <Button 
            onClick={handleNext}
            disabled={!isStepValid() || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : currentStep === steps.length - 1 ? (
              'Submit Application'
            ) : (
              'Next'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Status Components
function UnderReviewStatus({ onClose }: { onClose: () => void }) {
  return (
    <Card className="border-0 shadow-none">
      <CardContent className="text-center space-y-6 py-8">
        <div className="w-20 h-20 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center">
          <Clock className="w-10 h-10 text-yellow-500" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Application Under Review</h3>
          <p className="text-muted-foreground mb-4">
            Your creator application is being reviewed by our team. We&apos;ll notify you within 24-48 hours.
          </p>
          <div className="bg-primary/5 rounded-lg p-4 text-sm">
            <p><strong>What happens next:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-left">
              <li>Our marketing team reviews your documents and application</li>
              <li>You&apos;ll receive an email with the decision</li>
              <li>If approved, you&apos;ll gain access to creator tools</li>
              <li>If more information is needed, we&apos;ll contact you</li>
            </ul>
          </div>
        </div>
        <Button onClick={onClose} className="w-full">
          Continue to Feed
        </Button>
      </CardContent>
    </Card>
  )
}

function ApprovedStatus({ onComplete, onClose }: { onComplete: (stage: string) => void, onClose: () => void }) {
  return (
    <Card className="border-0 shadow-none">
      <CardContent className="text-center space-y-6 py-8">
        <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Welcome to Vybe Creators! 🎉</h3>
          <p className="text-muted-foreground mb-4">
            Congratulations! Your creator application has been approved. You now have access to all creator features.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-sm">
            <p><strong>You can now:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-left">
              <li>Create and host Looprooms</li>
              <li>Post content to the feed</li>
              <li>Share Looproom links with your community</li>
              <li>Access creator analytics and tools</li>
            </ul>
          </div>
        </div>
        <Button onClick={() => { onComplete('creator'); onClose(); }} className="w-full">
          Explore Creator Tools
        </Button>
      </CardContent>
    </Card>
  )
}

function RejectedStatus({ onClose }: { onClose: () => void }) {
  return (
    <Card className="border-0 shadow-none">
      <CardContent className="text-center space-y-6 py-8">
        <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Application Not Approved</h3>
          <p className="text-muted-foreground mb-4">
            Unfortunately, your creator application was not approved at this time. You can reapply in 30 days.
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-sm text-left">
            <p><strong>Common reasons for rejection:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Unclear or blurry document photos</li>
              <li>Incomplete application information</li>
              <li>Content doesn&apos;t align with Vybe looptoom&apos;s mission</li>
              <li>Insufficient creator experience</li>
            </ul>
          </div>
        </div>
        <Button onClick={onClose} className="w-full">
          Continue as User
        </Button>
      </CardContent>
    </Card>
  )
}