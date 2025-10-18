"use client";

import React from "react";
import { Eye } from "lucide-react";

interface LiveIndicatorProps {
  viewerCount?: number;
  className?: string;
}

export function LiveIndicator({
  viewerCount = 0,
  className = "",
}: LiveIndicatorProps) {
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500 colorful:bg-destructive rounded-full colorful:shadow-lg colorful:shadow-destructive/30">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <span className="text-white text-sm font-semibold">LIVE</span>
      </div>
      {viewerCount > 0 && (
        <div className="flex items-center space-x-1 px-2 py-1 bg-gray-900/80 dark:bg-gray-800/80 colorful:bg-card/80 backdrop-blur-sm rounded-full">
          <Eye className="w-3.5 h-3.5 text-white colorful:text-foreground" />
          <span className="text-white colorful:text-foreground text-sm font-medium">
            {viewerCount.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
