"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Users, TrendingUp } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function CreatorHighlight() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const features = [
    {
      icon: Star,
      text: "Host engaging Looprooms",
    },
    {
      icon: Users,
      text: "Build meaningful communities",
    },
    {
      icon: TrendingUp,
      text: "Share valuable content",
    },
  ]

  return (
    <section
      ref={sectionRef}
      id="creators"
      className="py-20 bg-card/30"
    >
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto border-border/50 shadow-lg">
          <CardContent ref={contentRef} className="p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              For Creators
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Creators can monetize on Vybe by hosting Looprooms, engaging communities, and sharing content.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center justify-center gap-3 text-foreground">
                  <feature.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 text-lg font-semibold transition-all duration-200 hover:scale-105"
              onClick={() => window.location.href = '/waitlist?type=creator'}
            >
              Become a Creator
            </Button>

            {/* Subtle background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-lg -z-10" />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}