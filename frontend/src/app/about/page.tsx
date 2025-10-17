"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Users,
  ArrowRight,
  Shield,
  CheckCircle,
  Rss,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const conceptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );

      // Features animation
      if (featuresRef.current) {
        const cards = featuresRef.current.children;
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: featuresRef.current,
              start: "top 80%",
            },
          }
        );
      }

      // Concept animation
      gsap.fromTo(
        conceptRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: conceptRef.current,
            start: "top 80%",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Heart,
      title: "Mood-Driven Navigation",
      description:
        "Tell us how you're feeling or what you're into, and we'll instantly guide you to the perfect Looproom that matches your vibe.",
      color: "text-pink-500",
    },
    {
      icon: Users,
      title: "Creator-Led Spaces",
      description:
        "Hang out in rooms hosted by real, verified creators who bring authentic content and energy you can trust.",
      color: "text-blue-500",
    },
    {
      icon: ArrowRight,
      title: "Loopchains™",
      description:
        "Follow smooth, guided paths that connect rooms together — like starting in Recovery, flowing into Meditation, and ending with Fitness.",
      color: "text-green-500",
    },
    {
      icon: CheckCircle,
      title: "Positive-Only Interactions",
      description:
        "Reactions = good vibes only. Emoji taps unlock uplifting messages and keep the community free from negativity.",
      color: "text-purple-500",
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description:
        "Every creator is verified with ID and selfie checks, so you always know you're in a safe and genuine space.",
      color: "text-orange-500",
    },
    {
      icon: Rss,
      title: "Loop Feed",
      description:
        "Your feed is never empty — it's always flowing with new posts, creator highlights, and trending Looprooms to explore.",
      color: "text-cyan-500",
    },
  ];

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background to-card">
        <div className="container mx-auto px-4">
          <div ref={heroRef} className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              About <span className="text-primary">Vybe Looprooms™</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              The world&apos;s first emotional tech ecosystem combining
              mood-driven navigation, creator-led spaces, and positive-only
              interactions for mental wellness and personal growth.
            </p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold"
            >
              Join the Beta
            </Button>
          </div>
        </div>
      </section>

      

      {/* The Concept */}
      <section id="concept" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div ref={conceptRef} className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
              The Vybe Concept
            </h2>

            <div className="space-y-8">
              <Card className="border-border/50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Mood & Music Matching Engine™
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Your emotions set the rhythm. Our Mood & Music Matching Engine™ 
                    tunes into how you&apos;re feeling and pairs it with the right soundtrack 
                    and Looproom. Whether you&apos;re calm, stressed, or energized, the music 
                    adapts to guide your session and connect you with the community that 
                    matches your vibe.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Inside each Looproom, music isn&apos;t just background — it&apos;s part of the 
                    healing, motivation, and growth journey.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Looprooms™
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Interactive spaces where creators and users connect based on
                    mood, interests, or specific topics. Each Looproom is a
                    themed environment for Recovery, Meditation, Fitness, Music,
                    and more.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Inside Looprooms, you can participate in chat, send positive
                    emoji reactions that trigger motivational messages, view
                    live streams or pre-recorded content, and connect with
                    like-minded individuals.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Loopchains™
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Curated paths that connect related Looprooms for guided
                    experiences. For example, a Recovery → Meditation → Fitness
                    → Healthy Living chain provides structured support for
                    personal growth.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Loopchains ensure users never feel lost and always have a
                    clear next step in their wellness journey, creating
                    meaningful progression through interconnected experiences.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    The Loop Feed™
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    When Looprooms aren&apos;t live, the community doesn&apos;t stop. 
                    The Loop Feed™ keeps energy flowing by bringing you creator 
                    posts, highlights, and updates all in one place.

                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Scroll, share encouragement, drop comments, and stay connected until 
                    the next Looproom goes live. That way, you&apos;ll never land in an 
                    empty space — there&apos;s always movement, always&apos;connection.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* The VYBE Difference */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ✨ The VYBE Difference
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We&apos;ve reimagined social spaces to make connecting feel natural, positive, and safe. VYBE Looprooms™ blend the fun of social feeds with the calm of guided wellness. Here&apos;s how we keep it simple for you:
            </p>
          </div>

          <div
            ref={featuresRef}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          >
            {features.map((feature, index) => (
              <Card
                key={index}
                className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
