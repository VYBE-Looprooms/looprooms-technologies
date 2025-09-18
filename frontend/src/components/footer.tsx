"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            {mounted ? (
              <Image
                src={resolvedTheme === 'light' ? '/Logo_White.png' : '/Logo_Dark.png'}
                alt="Vybe Logo"
                width={900}
                height={300}
                className="h-16 w-auto transition-all duration-300"
              />
            ) : (
              <div className="h-16 w-48 bg-primary/20 rounded animate-pulse" />
            )}
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <Link
              href="/about"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Contact
            </Link>
            <Link
              href="/waitlist"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Beta Signup
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Tagline */}
          <p className="text-lg font-semibold text-foreground mb-4">
            VYBE LOOPROOMS™ – Positivity. Connection. Growth.
          </p>

          {/* Copyright */}
          <p className="text-muted-foreground text-sm">
            © {currentYear} Vybe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}