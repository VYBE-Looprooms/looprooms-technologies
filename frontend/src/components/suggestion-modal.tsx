"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Lightbulb, Award } from "lucide-react"

interface SuggestionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SuggestionModal({ isOpen, onClose }: SuggestionModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    looproomName: "",
    purpose: ""
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous error
    setError(null)
    
    // Validate required fields
    if (!formData.firstName.trim()) {
      setError("Please enter your first name")
      return
    }
    if (!formData.lastName.trim()) {
      setError("Please enter your last name")
      return
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address")
      return
    }
    if (!formData.country.trim()) {
      setError("Please enter your country")
      return
    }
    if (!formData.looproomName.trim()) {
      setError("Please enter a Looproom name")
      return
    }
    if (!formData.purpose.trim() || formData.purpose.trim().length < 10) {
      setError("Please provide a detailed purpose (at least 10 characters)")
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          country: formData.country.trim(),
          looproomName: formData.looproomName.trim(),
          purpose: formData.purpose.trim()
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to submit suggestion')
      }

      setIsSubmitted(true)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        country: "",
        looproomName: "",
        purpose: ""
      })

      // Reset after 5 seconds and close modal
      setTimeout(() => {
        setIsSubmitted(false)
        onClose()
      }, 5000)
    } catch (error) {
      console.error('Suggestion submission error:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit suggestion. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Clear error when user starts typing
    if (error) {
      setError(null)
    }
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleClose = () => {
    if (!isLoading) {
      setIsSubmitted(false)
      setError(null)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        country: "",
        looproomName: "",
        purpose: ""
      })
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Lightbulb className="w-6 h-6 text-primary" />
            <span>Suggest a New Looproom</span>
          </DialogTitle>
        </DialogHeader>

        {!isSubmitted ? (
          <div className="space-y-6">
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Founder&apos;s Badge Opportunity!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                If your Looproom gets implemented, you&apos;ll earn an exclusive Founder&apos;s Badge with special recognition and early creator perks.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    First Name *
                  </label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Your first name"
                    className="bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Last Name *
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Your last name"
                    className="bg-background"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Country *
                  </label>
                  <Input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Your country"
                    className="bg-background"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Looproom Name *
                </label>
                <Input
                  type="text"
                  name="looproomName"
                  value={formData.looproomName}
                  onChange={handleInputChange}
                  placeholder="e.g., Creative Writing, Cooking Together, Book Club"
                  className="bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Purpose & Benefits *
                </label>
                <Textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="Explain what your Looproom will offer, who it will help, and what benefits it will provide to the community. Be specific about the activities, goals, and positive impact."
                  className="min-h-24 bg-background resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 10 characters. Be detailed about your vision!
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? "Submitting..." : "Submit Idea"}
                </Button>
              </div>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              We&apos;ll review your suggestion and get back to you within 5-7 business days.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Suggestion Submitted!
            </h3>
            
            <p className="text-muted-foreground mb-6">
              Thank you for your Looproom idea! We&apos;ll review it and get back to you soon.
            </p>

            <div className="bg-primary/5 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">Founder&apos;s Badge Awaits!</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                If your Looproom gets implemented, you&apos;ll earn an exclusive Founder&apos;s Badge 
                with special recognition and early creator perks.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              This window will close automatically in a few seconds...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}