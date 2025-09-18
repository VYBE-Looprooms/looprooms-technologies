"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Brain, Dumbbell } from "lucide-react";
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
      if (cardsRef.current) {
        const cards = cardsRef.current.children;

        gsap.fromTo(
          cards,
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
        "Supportive spaces for healing, growth, and overcoming challenges with community guidance.",
      gradient: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-pink-500",
    },
    {
      icon: Brain,
      title: "Meditation",
      description:
        "Mindfulness practices, guided sessions, and peaceful moments for mental clarity.",
      gradient: "from-purple-500/20 to-indigo-500/20",
      iconColor: "text-purple-500",
    },
    {
      icon: Dumbbell,
      title: "Fitness",
      description:
        "Motivational workouts, healthy habits, and physical wellness journeys together.",
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-500",
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

        <div
          ref={cardsRef}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {looprooms.map((room, index) => (
            <Card
              key={index}
              className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 h-full"
            >
              <CardContent className="p-8 text-center h-full flex flex-col">
                <div
                  className={`w-16 h-16 mx-auto bg-gradient-to-br ${room.gradient} rounded-full flex items-center justify-center mb-6`}
                >
                  <room.icon className={`w-8 h-8 ${room.iconColor}`} />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {room.title}
                </h3>

                <p className="text-muted-foreground mb-6 leading-relaxed flex-grow">
                  {room.description}
                </p>

                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 hover:scale-105 mt-auto">
                  Join the Beta
                </Button>

                {/* Animated border on hover */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
