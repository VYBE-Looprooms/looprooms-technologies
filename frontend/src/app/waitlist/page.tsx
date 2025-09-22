"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Mail, Users, Sparkles, ArrowRight } from "lucide-react"
import { gsap } from "gsap"

function WaitlistPageContent() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    userType: "user" // "user" or "creator"
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const heroRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const benefitsRef = useRef<HTMLDivElement>(null)

  // Handle URL parameters for pre-selecting user type, email, and interest
  useEffect(() => {
    const type = searchParams.get('type')
    const email = searchParams.get('email')
    const interest = searchParams.get('interest')
    
    setFormData(prev => ({
      ...prev,
      userType: (type === 'creator' || type === 'user') ? type : 'user',
      email: email || '',
      // If there's an interest, add it to the location field for now
      // We'll update the backend to handle this properly
      location: interest ? `Interested in ${interest}` : prev.location
    }))
  }, [searchParams])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )

      // Form animation
      gsap.fromTo(
        formRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out", delay: 0.2 }
      )

      // Benefits animation
      if (benefitsRef.current) {
        const cards = benefitsRef.current.children
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.4
          }
        )
      }
    })

    return () => ctx.revert()
  }, [])

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
    if (!formData.location.trim()) {
      setError("Please enter your location")
      return
    }

    setIsLoading(true)
    
    try {
      // Get the interest from URL params
      const interest = searchParams.get('interest')
      const interests = []
      
      // Add location to interests
      if (formData.location.trim()) {
        interests.push(formData.location.trim())
      }
      
      // Add specific looproom interest if it exists
      if (interest) {
        interests.push(`Looproom: ${interest}`)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          type: formData.userType,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          location: formData.location.trim(),
          interests: interests,
          primaryInterest: interest || null // Add primary interest field
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to join waitlist')
      }

      setIsSubmitted(true)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        location: "",
        userType: "user"
      })

      // Reset after 8 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 8000)
    } catch (error) {
      console.error('Waitlist submission error:', error)
      setError(error instanceof Error ? error.message : 'Failed to join waitlist. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // Clear error when user starts typing
    if (error) {
      setError(null)
    }
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const benefits = [
    {
      icon: Sparkles,
      title: "Early Access",
      description: "Be among the first to experience Vybe Looprooms and shape the future of emotional tech."
    },
    {
      icon: Users,
      title: "Exclusive Community",
      description: "Join a select group of beta users and connect with like-minded individuals."
    },
    {
      icon: ArrowRight,
      title: "Priority Features",
      description: "Get first access to new Looprooms, Loopchains, and creator content."
    }
  ]

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background to-card">
        <div className="container mx-auto px-4">
          <div ref={heroRef} className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Join the{" "}
              <span className="text-primary">
                Beta
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Be part of the world&apos;s first emotional tech ecosystem. 
              Get early access to Vybe Looprooms and help us build the future of wellness technology.
            </p>
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span>Join 10,000+ people on the waitlist</span>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Form */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <Card
            ref={formRef}
            className="max-w-2xl mx-auto border-border/50 shadow-xl"
          >
            <CardContent className="p-8 md:p-12 text-center">
              {!isSubmitted ? (
                <>
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Reserve Your Spot
                  </h2>
                  
                  <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
                    Join the beta waitlist and be among the first to experience Vybe Looprooms. 
                    Help us build the future of emotional wellness technology.
                  </p>

                  {/* Show interest indicator if user came from a specific Looproom */}
                  {searchParams.get('interest') && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 max-w-lg mx-auto">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <p className="text-sm font-medium text-primary">
                          You&apos;re interested in: <span className="font-bold">{searchParams.get('interest')}</span>
                        </p>
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        We&apos;ll prioritize your access to this Looproom when we launch!
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
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

                  <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="grid md:grid-cols-2 gap-4">
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
                          className="h-12 bg-background"
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
                          className="h-12 bg-background"
                          required
                        />
                      </div>
                    </div>

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
                        className="h-12 bg-background"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Location *
                      </label>
                      <Input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, Country"
                        className="h-12 bg-background"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        I&apos;m interested in joining as a
                      </label>
                      <select
                        name="userType"
                        value={formData.userType}
                        onChange={handleInputChange}
                        className="w-full h-12 px-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="user">User (Explore Looprooms)</option>
                        <option value="creator">Creator (Host Looprooms)</option>
                      </select>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isLoading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg font-semibold transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                    >
                      {isLoading ? "Joining Beta..." : "Join Beta Waitlist"}
                    </Button>
                  </form>

                  <p className="text-sm text-muted-foreground mt-4">
                    No spam, ever. We&apos;ll only email you when Vybe is ready.
                  </p>
                </>
              ) : (
                <div className="animate-in fade-in duration-500">
                  <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Welcome to the Beta!
                  </h2>
                  
                  <p className="text-lg text-muted-foreground mb-6">
                    You&apos;re now on the waitlist! We&apos;ll send you an invitation as soon as 
                    Vybe Looprooms is ready for beta testing.
                  </p>

                  <div className="bg-primary/5 rounded-lg p-4 mb-6">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>What&apos;s next?</strong> Follow us on social media for updates, 
                      behind-the-scenes content, and early previews of Looprooms in action.
                    </p>
                  </div>

                  <Button 
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Invite a Friend
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Beta Benefits */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Join the Beta?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Beta users get exclusive access and help shape the future of Vybe
            </p>
          </div>

          <div
            ref={benefitsRef}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-muted-foreground">
                Everything you need to know about the Vybe beta
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm font-bold">Q</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">
                      When will the beta launch?
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed ml-9">
                    We&apos;re targeting Q4 2025 for the beta launch. All waitlist members will receive 
                    an invitation email 2 weeks before launch with setup instructions and exclusive early access.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm font-bold">Q</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">
                      What&apos;s included in the beta?
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed ml-9">
                    Beta users get access to core Looprooms (Recovery, Meditation, Fitness, Music), 
                    Loopchains for guided experiences, the social feed, creator content, and positive-only 
                    interactions. New features will be added weekly based on user feedback.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-500 text-sm font-bold">Q</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">
                      Is the beta completely free?
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed ml-9">
                    Absolutely! The beta is 100% free with no hidden costs. We want your honest feedback 
                    to help us create the best possible experience before our official launch. Premium features 
                    may be introduced post-launch, but beta users will get special pricing.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-500 text-sm font-bold">Q</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">
                      How do I become a creator?
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed ml-9">
                    Select &quot;Creator&quot; when joining the waitlist! Creator applications open during beta 
                    with our verification process (ID + selfie verification) to ensure authentic, trustworthy 
                    creators. Creators can host Looprooms, share content, and build communities.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-500 text-sm font-bold">Q</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">
                      What makes Vybe different?
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed ml-9">
                    Vybe is the world&apos;s first emotional tech ecosystem combining mood-driven navigation, 
                    creator-led Looprooms, positive-only interactions, and Loopchains for guided growth. 
                    No toxicity, just authentic connections and personal development.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-orange-500 text-sm font-bold">Q</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">
                      Can I invite friends to the beta?
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed ml-9">
                    Yes! Beta users will receive invite codes to share with friends and family. 
                    Building a supportive community is core to Vybe&apos;s mission, so we encourage 
                    you to invite people who would benefit from positive, growth-focused interactions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-cyan-500 text-sm font-bold">Q</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">
                      What devices will be supported?
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed ml-9">
                    The beta launches as a responsive web app working on all devices - desktop, tablet, 
                    and mobile. Native iOS and Android apps are planned for post-launch based on beta 
                    feedback and user preferences.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-500 text-sm font-bold">Q</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">
                      How will my data be protected?
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed ml-9">
                    Your privacy is paramount. We use end-to-end encryption, secure data centers, 
                    and follow strict privacy policies. Beta users help us test these systems. 
                    Read our full <a href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</a> for details.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function WaitlistPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center">Loading...</div>}>
      <WaitlistPageContent />
    </Suspense>
  )
}