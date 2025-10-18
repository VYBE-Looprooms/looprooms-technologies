"use client";

import React from "react";
import { Crown } from "lucide-react";

interface CreatorBadgeProps {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function CreatorBadge({
  size = "md",
  showIcon = true,
}: CreatorBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-2.5 py-1",
  };

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
  };

  return (
    <div
      className={`inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded ${sizeClasses[size]}`}
    >
      {showIcon && <Crown className={iconSizes[size]} />}
      <span>CREATOR</span>
    </div>
  );
}
