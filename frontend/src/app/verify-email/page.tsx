"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Mail } from "lucide-react"
import { gsap } from "gsap"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setError("Invalid verification link. No token provided.")
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/verify-email?token=${token}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || result.error || 'Email verification failed')
        }

        setIsSuccess(true)
        
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)

      } catch (err) {
        console.error('Email verification error:', err)
        setError(err instanceof Error ? err.message : 'Email verification failed. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()

    // Animations
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out", delay: 0.2 }
      )
    })

    return () => ctx.revert()
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/30 flex items-center justify-center p-4">
        <Card ref={cardRef} className="w-full max-w-md border-border/50 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Verifying Your Email
            </h2>
            
            <p className="text-muted-foreground">
              Please wait while we verify your email address...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/30 flex items-center justify-center p-4">
        <Card ref={cardRef} className="w-full max-w-md border-border/50 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Email Verified Successfully!
            </h2>
            
            <p className="text-muted-foreground mb-6">
              Your email has been verified. You can now sign in to your Vybe account and start exploring Looprooms!
            </p>

            <div className="bg-primary/5 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                🎉 <strong>Welcome to Vybe!</strong> You&apos;ll be redirected to the sign-in page in a few seconds.
              </p>
            </div>

            <Button 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Sign In Now
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/30 flex items-center justify-center p-4">
        <Card ref={cardRef} className="w-full max-w-md border-border/50 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Verification Failed
            </h2>
            
            <p className="text-muted-foreground mb-6">
              {error}
            </p>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Common issues:</strong>
                <br />• The verification link may have expired
                <br />• The link may have already been used
                <br />• The token may be invalid or corrupted
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <Button 
                onClick={() => router.push('/signup')}
                className="w-full"
              >
                Create New Account
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Try Signing In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading verification...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}