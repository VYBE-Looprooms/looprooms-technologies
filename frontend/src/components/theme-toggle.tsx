"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

// Custom Palette Icon Component using the SVG from public folder
const PaletteIcon = ({ className }: { className?: string }) => (
  <img
    src="/palette.svg"
    alt="Palette"
    width={16}
    height={16}
    className={`${className} brightness-0 invert`}
    style={{ filter: "brightness(0) invert(1)" }}
  />
);

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("colorful");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="h-9 w-9 relative"
    >
      {/* Light theme icon */}
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 colorful:-rotate-90 colorful:scale-0" />

      {/* Dark theme icon */}
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 colorful:rotate-90 colorful:scale-0" />

      {/* Colorful theme icon */}
      <PaletteIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 colorful:rotate-0 colorful:scale-100" />

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
