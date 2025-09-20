"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Award, TrendingUp, Sparkles } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function CreatorPerks() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cards animation
      if (cardsRef.current) {
        const cards = cardsRef.current.children
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const perks = [
    {
      icon: Calendar,
      title: "Free Beta Access (120 Days)",
      description: "No fees during the beta period.",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500",
    },
    {
      icon: Award,
      title: "Exclusive Founder's Badge",
      description: "Recognition + early creator perks.",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500",
    },
    {
      icon: TrendingUp,
      title: "Best Payouts in Social",
      description: "After beta, VYBE will roll out monetization with a higher creator payout split than any major social platform.",
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-500",
    },
  ]

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Creator Perks
            </h2>
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Exclusive benefits designed to reward and support our creator community
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {perks.map((perk, index) => (
            <Card
              key={index}
              className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50"
            >
              <CardContent className="p-8 text-center h-full flex flex-col">
                <div
                  className={`w-16 h-16 mx-auto bg-gradient-to-br ${perk.gradient} rounded-full flex items-center justify-center mb-6`}
                >
                  <perk.icon className={`w-8 h-8 ${perk.iconColor}`} />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-4">
                  {perk.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed flex-grow">
                  {perk.description}
                </p>

                {/* Animated border on hover */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Start Creating?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join the beta now and unlock these exclusive creator benefits
            </p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold transition-all duration-200 hover:scale-105"
              onClick={() => window.location.href = '/waitlist?type=creator'}
            >
              Become a Creator
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}