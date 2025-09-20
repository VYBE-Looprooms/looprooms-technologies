"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Sparkles
} from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function FutureLooprooms() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  const categories = [
    {
      icon: Music,
      title: "Music & Artistic Expression",
      description: "Live concerts, DJ sets, songwriting sessions, music production, and creative arts",
      items: ["Live Concerts & Listening Parties", "DJ Sets & Beat Battles", "Songwriting & Lyric Sessions", "Visual Arts & Digital Design", "Dance & Choreography"],
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500",
    },
    {
      icon: Brain,
      title: "Mental Health & Recovery",
      description: "Support groups, therapy sessions, addiction recovery, and mental wellness spaces",
      items: ["Narcotics Anonymous (NA)", "Alcoholics Anonymous (AA)", "Therapy & Group Support", "Stress & Anxiety Coping", "Trauma & Healing Spaces"],
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500",
    },
    {
      icon: Heart,
      title: "Wellness & Holistic Healing",
      description: "Yoga, meditation, spiritual guidance, and holistic wellness practices",
      items: ["Yoga & Breathwork", "Meditation Practices", "Sound Baths & Healing", "Spiritual Guides", "Self-Care Rituals"],
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-500",
    },
    {
      icon: Dumbbell,
      title: "Health & Fitness",
      description: "Workout sessions, fitness challenges, and health-focused community activities",
      items: ["Cardio Training & HIIT", "Strength & Conditioning", "Dance Fitness", "Martial Arts & Boxing", "Group Challenges"],
      gradient: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-500",
    },
    {
      icon: ChefHat,
      title: "Culinary & Nutrition",
      description: "Cooking classes, meal prep, nutrition coaching, and food culture exploration",
      items: ["Cooking Classes", "Meal Prep & Planning", "Cultural Cuisine", "Nutrition Coaching", "Plant-Based Cooking"],
      gradient: "from-yellow-500/20 to-orange-500/20",
      iconColor: "text-yellow-600",
    },
    {
      icon: Users,
      title: "Family & Youth Empowerment",
      description: "Parenting support, youth mentorship, family activities, and educational guidance",
      items: ["Parenting Support", "Youth Mentorship", "Family Game Loops", "Educational Tutoring", "College Prep & Career Guidance"],
      gradient: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-pink-500",
    },
    {
      icon: Scissors,
      title: "Style, Care & Creative Culture",
      description: "Beauty, grooming, fashion, and creative lifestyle content",
      items: ["Barber Care & Grooming", "Hair Care & Styling", "Beauty & Skincare", "Fashion Styling", "Creative Lifestyle"],
      gradient: "from-indigo-500/20 to-purple-500/20",
      iconColor: "text-indigo-500",
    },
    {
      icon: Gamepad2,
      title: "Gaming & Digital Play",
      description: "Esports, game streaming, multiplayer sessions, and gaming community events",
      items: ["Esports Tournaments", "Game Streaming", "Multiplayer Social Loops", "VR & AR Gaming", "Game Development"],
      gradient: "from-cyan-500/20 to-blue-500/20",
      iconColor: "text-cyan-500",
    },
    {
      icon: Home,
      title: "Lifestyle, DIY & Legacy",
      description: "Home projects, travel, entrepreneurship, and wealth building communities",
      items: ["Home Projects & DIY", "Travel & Exploration", "Entrepreneurial Loops", "Wealth Building", "Legacy Planning"],
      gradient: "from-teal-500/20 to-green-500/20",
      iconColor: "text-teal-500",
    },
    {
      icon: Laptop,
      title: "Tech, Innovation & Entrepreneurship",
      description: "Coding, AI, startups, and cutting-edge technology discussions",
      items: ["Coding & App Development", "AI & Emerging Tech", "Startup & Founder Loops", "Web Design", "Blockchain & Future Tech"],
      gradient: "from-slate-500/20 to-gray-500/20",
      iconColor: "text-slate-600",
    },
  ]

  const slidesPerView = 3
  const maxSlide = Math.max(0, categories.length - slidesPerView)

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
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, maxSlide))
  }

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0))
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(Math.min(index, maxSlide))
  }

  return (
    <section ref={sectionRef} className="py-20 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Future Looprooms — Coming After Beta
            </h2>
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Swipe through upcoming categories like Music, Wellness, Fitness, Recovery, Gaming, Culinary, Family, Lifestyle, Tech & More.
          </p>
        </div>

        {/* Slideshow Container */}
        <div className="relative max-w-7xl mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={prevSlide}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={nextSlide}
            disabled={currentSlide === maxSlide}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Slides Container */}
          <div className="overflow-hidden mx-12">
            <div
              ref={sliderRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)`,
              }}
            >
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="w-1/3 flex-shrink-0 px-3"
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50">
                    <CardContent className="p-6 h-full flex flex-col">
                      <div
                        className={`w-16 h-16 mx-auto bg-gradient-to-br ${category.gradient} rounded-full flex items-center justify-center mb-4`}
                      >
                        <category.icon className={`w-8 h-8 ${category.iconColor}`} />
                      </div>

                      <h3 className="text-xl font-bold text-foreground mb-3 text-center">
                        {category.title}
                      </h3>

                      <p className="text-muted-foreground text-center mb-4 flex-grow">
                        {category.description}
                      </p>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground text-sm">Featured Loops:</h4>
                        <ul className="space-y-1">
                          {category.items.slice(0, 3).map((item, itemIndex) => (
                            <li key={itemIndex} className="text-xs text-muted-foreground flex items-center">
                              <div className="w-1 h-1 bg-primary rounded-full mr-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                          {category.items.length > 3 && (
                            <li className="text-xs text-muted-foreground italic">
                              +{category.items.length - 3} more...
                            </li>
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
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
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Can&apos;t Wait for Your Category?
            </h3>
            <p className="text-muted-foreground mb-6">
              Suggest a new Looproom and help us prioritize what to build next
            </p>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg font-semibold transition-all duration-200 hover:scale-105"
              onClick={() => window.location.href = '#suggest-looproom'}
            >
              Suggest a Looproom
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}