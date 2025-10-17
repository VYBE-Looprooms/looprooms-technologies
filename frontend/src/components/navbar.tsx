"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X, Shield } from "lucide-react";
import { gsap } from "gsap";
import { useTheme } from "next-themes";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuItemsRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mobile menu animation effect
  useEffect(() => {
    if (
      mobileMenuRef.current &&
      mobileMenuItemsRef.current &&
      isMobileMenuOpen
    ) {
      // Opening animation - initial styles are set inline, so we can animate immediately
      const tl = gsap.timeline();
      tl.to(mobileMenuRef.current, {
        height: "auto",
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      }).to(
        mobileMenuItemsRef.current.children,
        {
          y: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out",
        },
        "-=0.2"
      );
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
    };

    // Set initial state to prevent flash
    if (navRef.current) {
      gsap.set(navRef.current, { y: -100, opacity: 0 });
    }

    // Initial navbar animation with proper cleanup
    const tl = gsap.timeline();
    tl.to(navRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power2.out",
      delay: 0.2,
      clearProps: "all", // This removes all GSAP properties after animation
      onComplete: () => setIsLoaded(true),
    });

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      tl.kill();
    };
  }, []);

  const navLinks = [
    { href: "/", label: "Home", id: "home", isExternal: !isHomePage },
    {
      href: "/about",
      label: "About",
      id: "about",
      isExternal: true,
    },
    {
      href: isHomePage ? "#looprooms" : "/#looprooms",
      label: "Looprooms",
      id: "looprooms",
      isExternal: !isHomePage,
    },
    {
      href: isHomePage ? "#creators" : "/#creators",
      label: "Creators",
      id: "creators",
      isExternal: !isHomePage,
    },
    { href: "/contact", label: "Contact", id: "contact", isExternal: true },
  ];



  const handleCrossPageNavigation = (href: string) => {
    setIsMobileMenuOpen(false);
    
    if (href.startsWith("/#")) {
      // Cross-page navigation to home page section
      const sectionId = href.replace("/#", "");
      
      if (isHomePage) {
        // Already on home page, just scroll
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Navigate to home page with hash
        window.location.href = href;
      }
    } else {
      // Regular navigation
      window.location.href = href;
    }
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
      <nav
        ref={navRef}
        className={`transition-all duration-500 ease-out ${
          isScrolled
            ? "w-[90%] max-w-4xl scale-95"
            : "w-[95%] max-w-6xl scale-100"
        } ${!isLoaded ? "opacity-0" : ""}`}
      >
        <div
          className={`bg-background/80 backdrop-blur-md border border-border rounded-2xl shadow-lg transition-all duration-300 w-full ${
            isScrolled ? "py-2 px-6" : "py-4 px-8"
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              {mounted ? (
                <Image
                  src={
                    resolvedTheme === "light"
                      ? "/Logo_White.png"
                      : "/Logo_Dark.png"
                  }
                  alt="Vybe Logo"
                  width={720}
                  height={240}
                  className="h-14 w-auto transition-all duration-300"
                  priority
                />
              ) : (
                <div className="h-12 w-32 bg-primary/20 rounded animate-pulse" />
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) =>
                link.isExternal ? (
                  <Link
                    key={link.id}
                    href={link.href}
                    className="text-foreground hover:text-primary transition-all duration-300 relative group px-4 py-2 rounded-xl hover:bg-primary/10 hover:shadow-md hover:shadow-primary/20 hover:scale-105"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 rounded-full" />
                  </Link>
                ) : (
                  <button
                    key={link.id}
                    onClick={() => handleCrossPageNavigation(link.href)}
                    className="text-foreground hover:text-primary transition-all duration-300 relative group px-4 py-2 rounded-xl hover:bg-primary/10 hover:shadow-md hover:shadow-primary/20 hover:scale-105"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 rounded-full" />
                  </button>
                )
              )}
            </div>

            {/* Desktop CTA & Theme Toggle */}
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-border hover:bg-muted transition-all duration-300 hover:scale-105"
                title="Admin Login"
                onClick={() => {
                  const token = localStorage.getItem('adminToken')
                  const adminInfo = localStorage.getItem('adminInfo')
                  if (token && adminInfo) {
                    const admin = JSON.parse(adminInfo)
                    if (admin.role === 'marketing') {
                      window.location.href = '/admin/marketing'
                    } else {
                      window.location.href = '/admin/dashboard'
                    }
                  } else {
                    window.location.href = '/admin/login'
                  }
                }}
              >
                <Shield className="h-4 w-4" />
              </Button>
              <Link href="/login">
                <Button 
                  variant="outline"
                  className="transition-all duration-300 hover:scale-105 rounded-xl px-6"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/30 rounded-xl px-6">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-xl relative overflow-hidden"
              >
                <div className="relative w-5 h-5">
                  <Menu
                    className={`h-5 w-5 absolute transition-all duration-300 ${
                      isMobileMenuOpen
                        ? "rotate-90 opacity-0 scale-75"
                        : "rotate-0 opacity-100 scale-100"
                    }`}
                  />
                  <X
                    className={`h-5 w-5 absolute transition-all duration-300 ${
                      isMobileMenuOpen
                        ? "rotate-0 opacity-100 scale-100"
                        : "-rotate-90 opacity-0 scale-75"
                    }`}
                  />
                </div>
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div
              ref={mobileMenuRef}
              className="md:hidden mt-4 pb-4 border-t border-border/50 overflow-hidden"
              style={{ height: 0, opacity: 0 }}
            >
              <div
                ref={mobileMenuItemsRef}
                className="flex flex-col space-y-3 pt-4"
              >
                {navLinks.map((link) =>
                  link.isExternal ? (
                    <Link
                      key={link.id}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-foreground hover:text-primary transition-all duration-200 text-left px-2 py-2 rounded-lg hover:bg-primary/10 transform"
                      style={{ transform: "translateY(-20px)", opacity: 0 }}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      key={link.id}
                      onClick={() => handleCrossPageNavigation(link.href)}
                      className="text-foreground hover:text-primary transition-all duration-200 text-left px-2 py-2 rounded-lg hover:bg-primary/10 transform"
                      style={{ transform: "translateY(-20px)", opacity: 0 }}
                    >
                      {link.label}
                    </button>
                  )
                )}
                <div style={{ transform: "translateY(-20px)", opacity: 0 }}>
                  <Button
                    variant="outline"
                    className="w-full mt-4 transition-all duration-300 hover:scale-105 rounded-xl border-border hover:bg-muted"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      const token = localStorage.getItem('adminToken')
                      const adminInfo = localStorage.getItem('adminInfo')
                      if (token && adminInfo) {
                        const admin = JSON.parse(adminInfo)
                        if (admin.role === 'marketing') {
                          window.location.href = '/admin/marketing'
                        } else {
                          window.location.href = '/admin/dashboard'
                        }
                      } else {
                        window.location.href = '/admin/login'
                      }
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Login
                  </Button>
                </div>
                <div style={{ transform: "translateY(-20px)", opacity: 0 }}>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button 
                      variant="outline"
                      className="w-full mt-4 transition-all duration-300 hover:scale-105 rounded-xl border-border hover:bg-muted"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
                <div style={{ transform: "translateY(-20px)", opacity: 0 }}>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full mt-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/30 rounded-xl transform">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
