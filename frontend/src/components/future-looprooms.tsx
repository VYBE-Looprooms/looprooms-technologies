"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SuggestionModal } from "@/components/suggestion-modal";
import {
  Music,
  Brain,
  Heart,
  Dumbbell,
  ChefHat,
  Users,
  Scissors,
  Gamepad2,
  Home,
  Laptop,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function FutureLooprooms() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slidesPerView, setSlidesPerView] = useState(3);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const categories = [
    {
      icon: Music,
      title: "Music & Artistic Expression",
      description:
        "Live concerts, DJ sets, songwriting sessions, music production, and creative arts",
      items: [
        "Live Concerts & Listening Parties",
        "DJ Sets & Beat Battles",
        "Songwriting & Lyric Sessions",
        "Music Production & Studio Loops",
        "Instrument Practice Rooms",
        "Vocal Coaching & Performance Training",
        "Poetry & Spoken Word",
        "Visual Arts & Digital Design",
        "Dance & Choreography Loops",
        "Theater & Performance Arts",
        "Photography & Filmmaking",
      ],
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500",
    },
    {
      icon: Brain,
      title: "Mental Health & Recovery",
      description:
        "Support groups, therapy sessions, addiction recovery, and mental wellness spaces",
      items: [
        "Narcotics Anonymous (NA) Loops",
        "Alcoholics Anonymous (AA) Loops",
        "General Recovery Check-Ins",
        "Therapy & Group Support Rooms",
        "Stress & Anxiety Coping Loops",
        "Depression & Mood Balance Loops",
        "Trauma & Healing Spaces",
        "Grief & Loss Circles",
        "Youth & Teen Mental Health Support",
        "Addiction Education & Awareness",
      ],
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500",
    },
    {
      icon: Heart,
      title: "Wellness & Holistic Healing",
      description:
        "Yoga, meditation, spiritual guidance, and holistic wellness practices",
      items: [
        "Yoga & Breathwork",
        "Meditation Practices (Guided / Music-Guided)",
        "Sound Baths & Healing Frequencies",
        "Journaling & Self-Reflection Sessions",
        "Spiritual Guides & Faith Leaders",
        "Reiki & Alternative Energy Therapies",
        "Motivational Speakers & Life Coaching",
        "Visualization & Mindset Coaching",
        "Sleep & Restorative Practices",
        "Self-Care Rituals",
      ],
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-500",
    },
    {
      icon: Dumbbell,
      title: "Health & Fitness",
      description:
        "Workout sessions, fitness challenges, and health-focused community activities",
      items: [
        "Cardio Training & HIIT",
        "Strength & Conditioning",
        "Yoga Flow & Flexibility Training",
        "Dance Fitness (Zumba, Hip-Hop, Afrobeat)",
        "Martial Arts & Boxing",
        "Functional Movement & Mobility",
        "Stretch & Recovery Sessions",
        "Group Challenges & Step Count Battles",
        "AI Companion Workout Loops",
      ],
      gradient: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-500",
    },
    {
      icon: ChefHat,
      title: "Culinary & Nutrition",
      description:
        "Cooking classes, meal prep, nutrition coaching, and food culture exploration",
      items: [
        "Cooking Classes (Beginner to Advanced)",
        "Meal Prep & Planning",
        "Healthy Living Recipes",
        "Baking & Pastry Arts",
        "Cultural Cuisine Loops",
        "Nutrition Coaching & Diet Planning",
        "Plant-Based & Vegan Cooking",
        "Juicing & Smoothie Rooms",
        "Budget-Friendly Cooking",
        "Food & Wellness Education",
      ],
      gradient: "from-yellow-500/20 to-orange-500/20",
      iconColor: "text-yellow-600",
    },
    {
      icon: Users,
      title: "Family & Youth Empowerment",
      description:
        "Parenting support, youth mentorship, family activities, and educational guidance",
      items: [
        "Parenting Support Loops",
        "Youth Mentorship & Motivation",
        "Teen Talk & Safe Spaces",
        "Family Game & Bonding Loops",
        "Educational Tutoring Loops",
        "College Prep & Career Guidance",
        "Family Wellness Activities",
        "Financial Literacy for Families",
        "Relationship Building Loops",
      ],
      gradient: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-pink-500",
    },
    {
      icon: Scissors,
      title: "Style, Care & Creative Culture",
      description: "Beauty, grooming, fashion, and creative lifestyle content",
      items: [
        "Barber Care & Grooming Loops",
        "Hair Care & Protective Styling",
        "Beauty & Skincare Tutorials",
        "Makeup Masterclasses",
        "Fashion Styling & Wardrobe Loops",
        "Nails & Self-Expression",
        "Creative Lifestyle Influencers",
        "Cultural & Community Trends",
      ],
      gradient: "from-indigo-500/20 to-purple-500/20",
      iconColor: "text-indigo-500",
    },
    {
      icon: Gamepad2,
      title: "Gaming & Digital Play",
      description:
        "Esports, game streaming, multiplayer sessions, and gaming community events",
      items: [
        "Esports Tournaments & Live Matches",
        "Game Streaming & Commentary",
        "Multiplayer Social Loops (Among Us, Fortnite, etc.)",
        "VR & AR Gaming Loops",
        "Game Development & Modding",
        "Retro & Classic Game Rooms",
        "Role-Playing & Storytelling Loops",
        "Board Games & Digital Adaptations",
        "AI-Integrated Gaming Loops",
      ],
      gradient: "from-cyan-500/20 to-blue-500/20",
      iconColor: "text-cyan-500",
    },
    {
      icon: Home,
      title: "Lifestyle, DIY & Legacy",
      description:
        "Home projects, travel, entrepreneurship, and wealth building communities",
      items: [
        "Home Projects & DIY Hacks",
        "Woodworking & Crafts",
        "Organization & Decluttering Loops",
        "Budget Hacks & Smart Living",
        "Travel & Exploration Loops",
        "Gardening & Sustainability",
        "Entrepreneurial & Startup Loops",
        "Wealth Building & Financial Health",
        "Legacy Planning & Generational Wealth Loops",
        "Inspirational Life Journeys",
      ],
      gradient: "from-teal-500/20 to-green-500/20",
      iconColor: "text-teal-500",
    },
    {
      icon: Laptop,
      title: "Tech, Innovation & Entrepreneurship",
      description:
        "Coding, AI, startups, and cutting-edge technology discussions",
      items: [
        "Coding & App Development",
        "AI & Emerging Tech Loops",
        "Startup & Founder Loops",
        "Web Design & Digital Branding",
        "Marketing & Growth Hacking",
        "Blockchain & Future Tech",
        "Creative Collaboration for Entrepreneurs",
        "Full-Stack & No-Code Building",
        "Investor & Pitch Practice Loops",
      ],
      gradient: "from-slate-500/20 to-gray-500/20",
      iconColor: "text-slate-600",
    },
  ];

  const totalSlides = categories.length + 1; // +1 for the suggest card
  const maxSlide = Math.max(0, totalSlides - slidesPerView);

  // Handle responsive slides per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSlidesPerView(1); // Mobile: 1 slide
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(2); // Tablet: 2 slides
      } else {
        setSlidesPerView(3); // Desktop: 3 slides
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset current slide when slides per view changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [slidesPerView]);

  useEffect(() => {
    const ctx = gsap.context(() => {
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlide));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(Math.min(index, maxSlide));
  };

  // Swipe handling functions
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Only trigger swipe if there are multiple slides to navigate
    if (maxSlide > 0) {
      if (isLeftSwipe && currentSlide < maxSlide) {
        nextSlide();
      }
      if (isRightSwipe && currentSlide > 0) {
        prevSlide();
      }
    }
  };

  return (
    <section ref={sectionRef} className="py-20 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Future Looprooms <br />
              <span className="text-2xl md:text-3xl">Coming After Beta</span>
            </h2>
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto">
            <span className="md:hidden">
              Swipe left or right to explore upcoming categories like Music,
              Wellness, Fitness, Recovery, Gaming, Culinary, Family, Lifestyle,
              Tech & More.
            </span>
            <span className="hidden md:inline">
              Swipe through upcoming categories like Music, Wellness, Fitness,
              Recovery, Gaming, Culinary, Family, Lifestyle, Tech & More.
            </span>
          </p>
        </div>

        {/* Slideshow Container */}
        <div className="relative max-w-7xl mx-auto">
          {/* Navigation Buttons - Hide on mobile when only 1 slide per view */}
          {slidesPerView > 1 && maxSlide > 0 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={prevSlide}
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={nextSlide}
                disabled={currentSlide === maxSlide}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Slides Container */}
          <div className="overflow-hidden mx-4 md:mx-12">
            <div
              ref={sliderRef}
              className="flex transition-transform duration-500 ease-in-out touch-pan-y select-none"
              style={{
                transform: `translateX(-${
                  currentSlide * (100 / slidesPerView)
                }%)`,
              }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {categories.map((category, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 px-2 md:px-3 ${
                    slidesPerView === 1
                      ? "w-full"
                      : slidesPerView === 2
                      ? "w-1/2"
                      : "w-1/3"
                  }`}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 cursor-pointer md:cursor-default">
                    <CardContent className="p-6 h-full flex flex-col">
                      <div
                        className={`w-16 h-16 mx-auto bg-gradient-to-br ${category.gradient} rounded-full flex items-center justify-center mb-4`}
                      >
                        <category.icon
                          className={`w-8 h-8 ${category.iconColor}`}
                        />
                      </div>

                      <h3 className="text-xl font-bold text-foreground mb-3 text-center">
                        {category.title}
                      </h3>

                      <p className="text-muted-foreground text-center mb-4 flex-grow">
                        {category.description}
                      </p>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground text-sm">
                          Featured Loops:
                        </h4>
                        <ul className="space-y-1 max-h-40 overflow-y-auto">
                          {category.items.map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              className="text-xs text-muted-foreground flex items-start"
                            >
                              <div className="w-1 h-1 bg-primary rounded-full mr-2 flex-shrink-0 mt-1.5" />
                              <span className="leading-tight">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}

              {/* Suggest New Looproom Card */}
              <div
                className={`flex-shrink-0 px-2 md:px-3 ${
                  slidesPerView === 1
                    ? "w-full"
                    : slidesPerView === 2
                    ? "w-1/2"
                    : "w-1/3"
                }`}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 cursor-pointer border-dashed border-2 border-primary/30 hover:border-primary/60">
                  <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-primary" />
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-3">
                      Don&apos;t See Your Passion?
                    </h3>

                    <p className="text-muted-foreground mb-6 flex-grow">
                      Suggest a new Looproom and
                      help us build the perfect space for your community.
                    </p>

                    <Button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Suggest Looproom
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Dots Indicator - Only show when there are multiple slides */}
          {maxSlide > 0 && (
            <div className="flex justify-center space-x-2 mt-8">
              {Array.from({ length: maxSlide + 1 }).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentSlide
                      ? "bg-primary w-8"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Suggestion Modal */}
        <SuggestionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </section>
  );
}
