"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial setup - set immediately to prevent flash
      gsap.set([titleRef.current, subtitleRef.current, buttonsRef.current], {
        opacity: 0,
        y: 30,
      });

      // Main animation timeline with reduced delay
      const tl = gsap.timeline({ delay: 0.3 });

      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      })
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .to(
          buttonsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        );

      // Floating elements animation
      if (floatingElementsRef.current) {
        const elements = floatingElementsRef.current.children;
        Array.from(elements).forEach((element, index) => {
          gsap.to(element, {
            y: "random(-20, 20)",
            x: "random(-10, 10)",
            rotation: "random(-5, 5)",
            duration: "random(3, 5)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.2,
          });
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-card"
    >
      {/* Floating Background Elements */}
      <div
        ref={floatingElementsRef}
        className="absolute inset-0 pointer-events-none opacity-60"
      >
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-accent/20 rounded-full blur-xl" />
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-accent/20 rounded-full blur-xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <h1
          ref={titleRef}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-tight opacity-0 transform translate-y-8"
        >
          VYBE LOOPROOMS™
          <br />
          <span className="text-primary">
            The World&apos;s First Emotional Tech Ecosystem
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed opacity-0 transform translate-y-8"
        >
          Join mood-based Looprooms for Recovery, Meditation, Wellness, Fitness, Healthy Living, and more.
          <br />
          Connect with verified creators through guided Loopchains™ designed for your personal growth journey.
        </p>

        <div
          ref={buttonsRef}
          className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 transform translate-y-8"
        >
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-3 text-lg font-semibold transition-all duration-200 hover:scale-105"
            onClick={() => (window.location.href = "/about#concept")}
          >
            Learn More
          </Button>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold transition-all duration-200 hover:scale-105"
            onClick={() => (window.location.href = "/waitlist?type=user")}
          >
            Join the Beta
          </Button>
        </div>
      </div>
    </section>
  );
}
