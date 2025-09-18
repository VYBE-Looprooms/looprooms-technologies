"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Waitlist() {
  const [email, setEmail] = useState("");

  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
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
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);



  return (
    <section
      ref={sectionRef}
      id="waitlist"
      className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5"
    >
      <div className="container mx-auto px-4">
        <Card
          ref={cardRef}
          className="max-w-2xl mx-auto border-border/50 shadow-xl"
        >
          <CardContent className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Join the Beta
            </h2>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Be the first to experience mood-guided connections and
              creator-led growth
            </p>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 text-lg bg-background"
                  required
                />
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 text-lg font-semibold transition-all duration-200 hover:scale-105"
                  onClick={() => window.location.href = `/waitlist?type=user${email ? `&email=${encodeURIComponent(email)}` : ''}`}
                >
                  Join Beta
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Want to become a creator? <button 
                  onClick={() => window.location.href = `/waitlist?type=creator${email ? `&email=${encodeURIComponent(email)}` : ''}`}
                  className="text-primary hover:underline font-medium"
                >
                  Click here
                </button>
              </p>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              No spam, ever. We&apos;ll only email you when Vybe is ready.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
