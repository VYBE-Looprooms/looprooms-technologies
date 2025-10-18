"use client";

import React from "react";

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
  showPulse?: boolean;
}

export function OnlineIndicator({
  isOnline,
  size = "md",
  showPulse = true,
}: OnlineIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  const color = isOnline
    ? "bg-green-500 colorful:bg-green-600"
    : "bg-gray-400 dark:bg-gray-600 colorful:bg-muted-foreground";

  return (
    <div className="relative inline-flex">
      <span className={`${sizeClasses[size]} ${color} rounded-full`} />
      {isOnline && showPulse && (
        <span
          className={`absolute inset-0 ${sizeClasses[size]} ${color} rounded-full animate-ping opacity-75`}
        />
      )}
    </div>
  );
}
