"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MessageSquare, MapPin, Clock } from "lucide-react";
import { gsap } from "gsap";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );

      // Form animation
      gsap.fromTo(
        formRef.current,
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power2.out", delay: 0.2 }
      );

      // Info animation
      gsap.fromTo(
        infoRef.current,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power2.out", delay: 0.4 }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous error
    setError(null);

    // Validate required fields
    if (!formData.name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!formData.message.trim()) {
      setError("Please enter your message");
      return;
    }
    if (formData.message.trim().length < 10) {
      setError("Message must be at least 10 characters long");
      return;
    }

    // Subject is required by backend, so provide default if empty
    const subject =
      formData.subject.trim() || "General Inquiry from Contact Form";
    if (subject.length < 5) {
      setError("Subject must be at least 5 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: subject,
        message: formData.message.trim(),
        type: formData.type,
      };

      console.log("Sending payload:", payload); // Debug log

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.details ||
            result.message ||
            result.error ||
            "Failed to send message"
        );
      }

      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        type: "general",
      });

      // Reset after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error("Contact form submission error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get in touch with our team",
      contact: "info@feelyourvybe.com",
      color: "text-blue-500",
    },
    {
      icon: Clock,
      title: "Response Time",
      description: "We typically respond within",
      contact: "24 hours",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background to-card">
        <div className="container mx-auto px-4">
          <div ref={heroRef} className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Have questions about Vybe? Want to become a creator? We&apos;d
              love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Contact Form - Takes 2 columns */}
            <div className="lg:col-span-2">
              <Card ref={formRef} className="border-border/50 shadow-lg h-full">
                <CardContent className="p-8">
                  {!isSubmitted ? (
                    <>
                      <h2 className="text-2xl font-bold text-foreground mb-6">
                        Send us a message
                      </h2>

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
                              Name *
                            </label>
                            <Input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Your name"
                              required
                              className="h-12"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Email *
                            </label>
                            <Input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="your@email.com"
                              required
                              className="h-12"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Message Type *
                            </label>
                            <select
                              name="type"
                              value={formData.type}
                              onChange={handleInputChange}
                              className="w-full h-12 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              required
                            >
                              <option value="general">General Inquiry</option>
                              <option value="support">Technical Support</option>
                              <option value="partnership">Partnership</option>
                              <option value="creator">Creator Program</option>
                              <option value="bug">Bug Report</option>
                            </select>
                            {formData.type && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {formData.type === "general" &&
                                  "Questions about Vybe, features, or general information"}
                                {formData.type === "support" &&
                                  "Technical issues, account problems, or platform bugs"}
                                {formData.type === "partnership" &&
                                  "Business partnerships, collaborations, or integrations"}
                                {formData.type === "creator" &&
                                  "Questions about becoming a creator or hosting Looprooms"}
                                {formData.type === "bug" &&
                                  "Report bugs, glitches, or unexpected behavior"}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Subject *
                            </label>
                            <Input
                              type="text"
                              name="subject"
                              value={formData.subject}
                              onChange={handleInputChange}
                              placeholder="What's this about? (min 5 characters)"
                              className="h-12"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Message *
                          </label>
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder={
                              formData.type === "general"
                                ? "Tell us more about your inquiry... (min 10 characters)"
                                : formData.type === "support"
                                ? "Describe the technical issue you're experiencing... (min 10 characters)"
                                : formData.type === "partnership"
                                ? "Tell us about your partnership proposal... (min 10 characters)"
                                : formData.type === "creator"
                                ? "Tell us about your creator background and interests... (min 10 characters)"
                                : formData.type === "bug"
                                ? "Describe the bug, steps to reproduce, and expected behavior... (min 10 characters)"
                                : "Tell us more... (min 10 characters)"
                            }
                            required
                            rows={6}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg font-semibold transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                        >
                          {isLoading ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                        <MessageSquare className="w-8 h-8 text-green-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-4">
                        Message Sent!
                      </h2>
                      <p className="text-muted-foreground">
                        Thanks for reaching out! We&apos;ll get back to you
                        within 24 hours.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Info - Takes 1 column */}
            <div ref={infoRef} className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                Other ways to reach us
              </h2>

              {contactInfo.map((info, index) => (
                <Card
                  key={index}
                  className="border-border/50 hover:shadow-md transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <info.icon className={`w-6 h-6 ${info.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {info.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          {info.description}
                        </p>
                        <p className="text-foreground font-medium">
                          {info.contact}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Creator Interest */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    Interested in becoming a creator?
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Join our creator program and start hosting your own
                    Looprooms. We&apos;ll guide you through the verification
                    process.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() =>
                        (window.location.href = "/waitlist?type=creator")
                      }
                    >
                      Join Waitlist
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          type: "creator",
                          subject: "Creator Program Inquiry",
                        });
                        // Scroll to form
                        formRef.current?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Ask Questions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Location Map */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Location
            </h2>
            <p className="text-xl text-muted-foreground">
              Based in New York, building for the world
            </p>
          </div>

          <Card className="max-w-4xl mx-auto border-border/50 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-96 bg-muted">
                {/* Embedded Google Map */}
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d93828.79006478566!2d-73.79648168671875!3d42.68679845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f11.1!3m3!1m2!1s0x89de0a34cc4ffb4b%3A0xe1a16312a0e728c4!2sAlbany%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1704067200000!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                />
              </div>

              <div className="p-6 bg-background">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Albany, NY
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Building the future of emotional wellness technology from
                      New York&apos;s capital region
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
