"use client";

import React from "react";
import { Users } from "lucide-react";

interface ViewerCountProps {
  count: number;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ViewerCount({
  count,
  showIcon = true,
  size = "md",
}: ViewerCountProps) {
  const sizeClasses = {
    sm: "text-xs gap-1",
    md: "text-sm gap-1.5",
    lg: "text-base gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const formatCount = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div
      className={`inline-flex items-center ${sizeClasses[size]} text-gray-700 dark:text-gray-300 colorful:text-foreground`}
    >
      {showIcon && <Users className={iconSizes[size]} />}
      <span className="font-medium">{formatCount(count)}</span>
    </div>
  );
}
