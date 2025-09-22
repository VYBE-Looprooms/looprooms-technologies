"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Brain, Dumbbell, Sparkles, Leaf } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function FeaturedLooprooms() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate all cards in both rows
      const allCards = sectionRef.current?.querySelectorAll(".looproom-card");

      if (allCards) {
        gsap.fromTo(
          allCards,
          {
            opacity: 0,
            y: 50,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
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
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const looprooms = [
    {
      icon: Heart,
      title: "Recovery",
      description:
        "Safe, supportive spaces for healing, growth, and overcoming challenges with guidance and community. Includes sub-Looprooms for Narcotics Anonymous (NA), Alcoholics Anonymous (AA), grief support, relapse prevention, and more.",
      gradient: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-pink-500",
    },
    {
      icon: Brain,
      title: "Meditation",
      description:
        "Mindfulness practices to find peace and clarity. Explore guided breathing, sound baths, mantra sessions, and daily grounding routines to calm the mind.",
      gradient: "from-purple-500/20 to-indigo-500/20",
      iconColor: "text-purple-500",
    },
    {
      icon: Dumbbell,
      title: "Fitness",
      description:
        "Motivational workouts and healthy habits in community. Includes strength training, cardio, dance fitness, calisthenics, and music-guided exercise sessions to keep energy high.",
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-500",
    },
    {
      icon: Sparkles,
      title: "Wellness",
      description:
        "Holistic journeys for emotional balance, stress relief, and personal growth. Includes yoga, mental health support, journaling, self-care routines, and spiritual healing practice.",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500",
    },
    {
      icon: Leaf,
      title: "Healthy Living",
      description:
        "Practical spaces for nutrition and lifestyle balance. Includes meal prep classes, cooking with creators, holistic nutrition tips, and long-term health habit coaching for body and mind.",
      gradient: "from-orange-500/20 to-amber-500/20",
      iconColor: "text-orange-500",
    },
  ];

  return (
    <section ref={sectionRef} id="looprooms" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Featured Looprooms
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover spaces designed for your wellbeing and personal growth
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Top row - 3 cards */}
          <div
            ref={cardsRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {looprooms.slice(0, 3).map((room, index) => (
              <Card
                key={index}
                className="looproom-card relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 h-full"
              >
                <CardContent className="p-6 text-center h-full flex flex-col">
                  <div
                    className={`w-16 h-16 mx-auto bg-gradient-to-br ${room.gradient} rounded-full flex items-center justify-center mb-4`}
                  >
                    <room.icon className={`w-8 h-8 ${room.iconColor}`} />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {room.title}
                  </h3>

                  <p className="text-muted-foreground mb-4 leading-relaxed flex-grow">
                    {room.description}
                  </p>

                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 hover:scale-105 mt-auto"
                    onClick={() =>
                      (window.location.href = `/waitlist?type=user&interest=${encodeURIComponent(room.title)}`)
                    }
                  >
                    Join the Beta
                  </Button>

                  {/* Animated border on hover */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom row - 2 cards centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {looprooms.slice(3, 5).map((room, index) => (
              <Card
                key={index + 3}
                className="looproom-card relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 h-full"
              >
                <CardContent className="p-6 text-center h-full flex flex-col">
                  <div
                    className={`w-16 h-16 mx-auto bg-gradient-to-br ${room.gradient} rounded-full flex items-center justify-center mb-4`}
                  >
                    <room.icon className={`w-8 h-8 ${room.iconColor}`} />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {room.title}
                  </h3>

                  <p className="text-muted-foreground mb-4 leading-relaxed flex-grow">
                    {room.description}
                  </p>

                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 hover:scale-105 mt-auto"
                    onClick={() =>
                      (window.location.href = `/waitlist?type=user&interest=${encodeURIComponent(room.title)}`)
                    }
                  >
                    Join the Beta
                  </Button>

                  {/* Animated border on hover */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
