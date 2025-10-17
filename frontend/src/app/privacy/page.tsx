"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Eye, Lock, Users, Database, Mail } from "lucide-react"
import { gsap } from "gsap"

export default function PrivacyPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )

      // Content animation
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.2 }
      )
    })

    return () => ctx.revert()
  }, [])

  const principles = [
    {
      icon: Shield,
      title: "Data Protection",
      description: "Your personal information is encrypted and securely stored using industry-standard protocols."
    },
    {
      icon: Eye,
      title: "Transparency",
      description: "We clearly explain what data we collect, how we use it, and who we share it with."
    },
    {
      icon: Lock,
      title: "User Control",
      description: "You have full control over your data with options to view, edit, or delete your information."
    },
    {
      icon: Users,
      title: "Community Safety",
      description: "We implement verification systems to ensure authentic interactions and protect our community."
    }
  ]

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background to-card">
        <div className="container mx-auto px-4">
          <div ref={heroRef} className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Privacy{" "}
              <span className="text-primary">
                Policy
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Your privacy and data security are fundamental to everything we do at Vybe. 
              Here&apos;s how we protect and respect your information.
            </p>
            <p className="text-muted-foreground">
              Last updated: January 2025
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Privacy Principles
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              These core principles guide how we handle your data
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
            {principles.map((principle, index) => (
              <Card key={index} className="border-border/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <principle.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {principle.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div ref={contentRef} className="max-w-4xl mx-auto space-y-8">
            
            <Card className="border-border/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  <Database className="w-6 h-6 text-primary mr-3" />
                  Information We Collect
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Account Information</h3>
                    <p>When you create an account, we collect your email address, username, and profile information you choose to provide.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Creator Verification</h3>
                    <p>For creators, we collect identity verification documents (ID, selfie) to ensure authenticity and community safety. This information is encrypted and stored securely.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Usage Data</h3>
                    <p>We collect information about how you use Vybe, including Looprooms visited, interactions, and preferences to improve your experience.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Communication Data</h3>
                    <p>Messages, comments, and interactions within Looprooms are stored to provide the service and ensure community guidelines are followed.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  <Eye className="w-6 h-6 text-primary mr-3" />
                  How We Use Your Information
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>• <strong>Provide Services:</strong> Enable Looproom access, feed content, and creator interactions</p>
                  <p>• <strong>Personalization:</strong> Recommend relevant Looprooms and content based on your mood and interests</p>
                  <p>• <strong>Safety & Security:</strong> Verify creator identities and maintain community standards</p>
                  <p>• <strong>Communication:</strong> Send important updates, notifications, and respond to your inquiries</p>
                  <p>• <strong>Improvement:</strong> Analyze usage patterns to enhance platform features and user experience</p>
                  <p>• <strong>Legal Compliance:</strong> Meet legal obligations and protect our rights and users&apos; safety</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  <Users className="w-6 h-6 text-primary mr-3" />
                  Information Sharing
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We do not sell your personal information. We may share information in these limited circumstances:</p>
                  <div className="space-y-3">
                    <p>• <strong>With Your Consent:</strong> When you explicitly agree to share information</p>
                    <p>• <strong>Service Providers:</strong> Trusted partners who help us operate Vybe (hosting, analytics, support)</p>
                    <p>• <strong>Legal Requirements:</strong> When required by law or to protect safety and rights</p>
                    <p>• <strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</p>
                    <p>• <strong>Public Content:</strong> Information you choose to make public in Looprooms or your profile</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  <Lock className="w-6 h-6 text-primary mr-3" />
                  Your Rights & Controls
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>• <strong>Access:</strong> Request a copy of your personal data</p>
                  <p>• <strong>Correction:</strong> Update or correct your information</p>
                  <p>• <strong>Deletion:</strong> Request deletion of your account and data</p>
                  <p>• <strong>Portability:</strong> Export your data in a machine-readable format</p>
                  <p>• <strong>Opt-out:</strong> Unsubscribe from marketing communications</p>
                  <p>• <strong>Privacy Settings:</strong> Control who can see your profile and activity</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  <Shield className="w-6 h-6 text-primary mr-3" />
                  Data Security
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>We implement industry-standard security measures to protect your information:</p>
                  <p>• End-to-end encryption for sensitive data</p>
                  <p>• Secure data centers with 24/7 monitoring</p>
                  <p>• Regular security audits and updates</p>
                  <p>• Limited access controls for our team</p>
                  <p>• Secure authentication and session management</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  <Mail className="w-6 h-6 text-primary mr-3" />
                  Contact Us
                </h2>
                <div className="text-muted-foreground">
                  <p className="mb-4">
                    If you have questions about this Privacy Policy or how we handle your data, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p>• Email: info@feelyourvybe.com</p>
                    <p>• Contact Form: <a href="/contact" className="text-primary hover:underline">Here</a></p>
                  </div>
                  <p className="mt-6 text-sm">
                    We will respond to your inquiry within 30 days and work with you to resolve any concerns.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-primary/5">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Policy Updates
                </h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. When we do, we&apos;ll notify you by email 
                  and update the &quot;Last updated&quot; date at the top of this page. Continued use of Vybe after 
                  changes constitutes acceptance of the updated policy.
                </p>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>
    </div>
  )
}