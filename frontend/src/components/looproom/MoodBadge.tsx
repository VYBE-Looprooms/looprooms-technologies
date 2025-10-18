"use client";

import React from "react";

interface MoodBadgeProps {
  mood: string;
  size?: "sm" | "md" | "lg";
}

const moodEmojis: Record<string, string> = {
  happy: "😊",
  peaceful: "😌",
  energized: "💪",
  grateful: "🙏",
  motivated: "🎯",
  growing: "🌱",
  excited: "🤩",
  calm: "🧘",
  focused: "🎯",
  relaxed: "😌",
};

export function MoodBadge({ mood, size = "md" }: MoodBadgeProps) {
  const emoji = moodEmojis[mood.toLowerCase()] || "😊";

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/30 colorful:bg-primary/20 text-purple-700 dark:text-purple-300 colorful:text-primary rounded-full ${sizeClasses[size]}`}
    >
      <span>{emoji}</span>
      <span className="capitalize font-medium">{mood}</span>
    </div>
  );
}
