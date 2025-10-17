"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, CheckCircle, Rss, TrendingUp } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function WhyVybe() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        const cards = cardsRef.current.children

        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 50,
            rotationY: 15,
          },
          {
            opacity: 1,
            y: 0,
            rotationY: 0,
            duration: 0.8,
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

  const features = [
    {
      icon: CheckCircle,
      title: "Positive-only interactions",
      description: "Emoji reactions trigger motivational messages, creating a toxicity-free environment",
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      icon: Shield,
      title: "Verified creators",
      description: "All creators go through ID and selfie verification for authentic, trustworthy content",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: Rss,
      title: "Feed fallback",
      description: "Never face an empty state - scroll through creator posts when no rooms are active",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      icon: TrendingUp,
      title: "Guided growth",
      description: "Loopchains connect related rooms for structured learning and personal development",
      gradient: "from-orange-500/20 to-red-500/20",
    },
  ]

  return (
    <section
      ref={sectionRef}
      id="why-vybe"
      className="py-20 bg-background"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why choose Vybe?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We&apos;ve built a platform that prioritizes your wellbeing, safety, and growth
          </p>
        </div>

        <div
          ref={cardsRef}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50"
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Animated border */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}