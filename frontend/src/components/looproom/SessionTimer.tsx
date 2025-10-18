"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface SessionTimerProps {
  sessionStartTime?: string;
  isLive: boolean;
  className?: string;
}

export function SessionTimer({
  sessionStartTime,
  isLive,
  className = "",
}: SessionTimerProps) {
  const [duration, setDuration] = useState("00:00");

  useEffect(() => {
    if (!isLive || !sessionStartTime) {
      setDuration("00:00");
      return;
    }

    const updateDuration = () => {
      const start = new Date(sessionStartTime).getTime();
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      // Show hours only if > 0
      if (hours > 0) {
        setDuration(
          `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      } else {
        setDuration(
          `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      }
    };

    // Update immediately
    updateDuration();

    // Then update every second
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [isLive, sessionStartTime]);

  if (!isLive) {
    return null;
  }

  return (
    <div
      className={`flex items-center space-x-1.5 text-sm font-medium ${className}`}
    >
      <Clock className="w-4 h-4" />
      <span className="font-mono tabular-nums">{duration}</span>
    </div>
  );
}
