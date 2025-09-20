"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, CheckCircle, Lightbulb, Award } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function LooproomSuggestion() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    looproomName: "",
    purpose: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section animation
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 50 },
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
      );

      // Benefits animation
      if (benefitsRef.current) {
        const cards = benefitsRef.current.children;
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: benefitsRef.current,
              start: "top 80%",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous error
    setError(null);

    // Validate required fields
    if (!formData.firstName.trim()) {
      setError("Please enter your first name");
      return;
    }
    if (!formData.lastName.trim()) {
      setError("Please enter your last name");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!formData.country.trim()) {
      setError("Please enter your country");
      return;
    }
    if (!formData.looproomName.trim()) {
      setError("Please enter a Looproom name");
      return;
    }
    if (!formData.purpose.trim() || formData.purpose.trim().length < 10) {
      setError("Please provide a detailed purpose (at least 10 characters)");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/suggestions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            country: formData.country.trim(),
            looproomName: formData.looproomName.trim(),
            purpose: formData.purpose.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Failed to submit suggestion"
        );
      }

      setIsSubmitted(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        country: "",
        looproomName: "",
        purpose: "",
      });

      // Reset after 10 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 10000);
    } catch (error) {
      console.error("Suggestion submission error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit suggestion. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const benefits = [
    {
      icon: Award,
      title: "Founder's Badge",
      description:
        "Earn exclusive recognition as the founder of your Looproom with special perks and visibility.",
    },
    {
      icon: Sparkles,
      title: "Early Creator Access",
      description:
        "Get priority access to creator tools and features when your Looproom goes live.",
    },
    {
      icon: Lightbulb,
      title: "Shape the Platform",
      description:
        "Help build the future of emotional tech by contributing your unique vision and expertise.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-card/30 to-background"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Create Your Own Looproom
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Don&apos;t see your passion? Be the pioneer — start your own
            Looproom and bring your vision to life.
          </p>
          <div className="flex items-center justify-center space-x-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">
              Founders who launch new Looprooms earn an exclusive Founder&apos;s
              Badge, unlocking recognition, early creator perks, and priority
              visibility as the ecosystem grows.
            </span>
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Benefits Cards */}
        <div
          ref={benefitsRef}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16"
        >
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50"
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Suggestion Form */}
        <Card
          ref={formRef}
          className="max-w-3xl mx-auto border-border/50 shadow-xl"
        >
          <CardContent className="p-8 md:p-12">
            {!isSubmitted ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Lightbulb className="w-8 h-8 text-primary" />
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Suggest a New Looproom
                  </h3>

                  <p className="text-lg text-muted-foreground">
                    Share your idea and help us build the perfect space for your
                    community
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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

                  <div className="grid md:grid-cols-2 gap-4">
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
                        Country *
                      </label>
                      <Input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="Your country"
                        className="h-12 bg-background"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Looproom Name *
                    </label>
                    <Input
                      type="text"
                      name="looproomName"
                      value={formData.looproomName}
                      onChange={handleInputChange}
                      placeholder="e.g., Creative Writing, Cooking Together, Book Club"
                      className="h-12 bg-background"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Purpose & Benefits *
                    </label>
                    <Textarea
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      placeholder="Explain what your Looproom will offer, who it will help, and what benefits it will provide to the community. Be specific about the activities, goals, and positive impact."
                      className="min-h-32 bg-background resize-none"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum 10 characters. Be detailed about your vision!
                    </p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg font-semibold transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                  >
                    {isLoading
                      ? "Submitting Suggestion..."
                      : "Submit Looproom Idea"}
                  </Button>
                </form>

                <p className="text-sm text-muted-foreground mt-4 text-center">
                  We&apos;ll review your suggestion and get back to you within
                  5-7 business days.
                </p>
              </>
            ) : (
              <div className="animate-in fade-in duration-500 text-center">
                <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Suggestion Submitted!
                </h3>

                <p className="text-lg text-muted-foreground mb-6">
                  Thank you for your Looproom idea! We&apos;ll review it and get
                  back to you soon.
                </p>

                <div className="bg-primary/5 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Award className="w-6 h-6 text-primary" />
                    <h4 className="text-lg font-semibold text-foreground">
                      Founder&apos;s Badge Awaits!
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    If your Looproom gets implemented, you&apos;ll earn an
                    exclusive Founder&apos;s Badge with special recognition and
                    early creator perks. We&apos;ll keep you updated on the
                    progress!
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Suggest Another Looproom
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
