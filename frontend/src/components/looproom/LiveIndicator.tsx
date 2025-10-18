"use client";

import React from "react";

interface LiveIndicatorProps {
  isLive: boolean;
  size?: "sm" | "md" | "lg";
}

export function LiveIndicator({ isLive, size = "md" }: LiveIndicatorProps) {
  if (!isLive) return null;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-red-600 colorful:bg-destructive text-white font-bold rounded ${sizeClasses[size]}`}
    >
      <span
        className={`${dotSizes[size]} bg-white rounded-full animate-pulse`}
      />
      LIVE
    </div>
  );
}
