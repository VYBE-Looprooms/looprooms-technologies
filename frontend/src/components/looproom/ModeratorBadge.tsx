"use client";

import React from "react";
import { Shield } from "lucide-react";

interface ModeratorBadgeProps {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function ModeratorBadge({
  size = "md",
  showIcon = true,
}: ModeratorBadgeProps) {
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
      className={`inline-flex items-center gap-1 bg-blue-600 colorful:bg-blue-500 text-white font-bold rounded ${sizeClasses[size]}`}
    >
      {showIcon && <Shield className={iconSizes[size]} />}
      <span>MOD</span>
    </div>
  );
}
