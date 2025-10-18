"use client";

import React, { useState, useEffect } from "react";
import { Play, Square, Pause, PlayCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SessionControlsProps {
  isLive: boolean;
  isPaused?: boolean;
  sessionStartTime?: string;
  onStartSession: () => Promise<void>;
  onEndSession: () => Promise<void>;
  onPauseSession?: () => Promise<void>;
  onResumeSession?: () => Promise<void>;
}

export function SessionControls({
  isLive,
  isPaused = false,
  sessionStartTime,
  onStartSession,
  onEndSession,
  onPauseSession,
  onResumeSession,
}: SessionControlsProps) {
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState("00:00:00");

  // Calculate session duration
  useEffect(() => {
    if (!isLive || !sessionStartTime) {
      setDuration("00:00:00");
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(sessionStartTime).getTime();
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setDuration(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, sessionStartTime]);

  const handleStartSession = async () => {
    setLoading(true);
    try {
      await onStartSession();
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (
      !confirm(
        "Are you sure you want to end this session? This cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await onEndSession();
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSession = async () => {
    setLoading(true);
    try {
      await onPauseSession?.();
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSession = async () => {
    setLoading(true);
    try {
      await onResumeSession?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-900 colorful:bg-card border border-gray-200 dark:border-gray-800 colorful:border-border rounded-lg colorful:shadow-lg colorful:shadow-primary/10">
      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        {isLive ? (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <Badge className="bg-red-500 text-white">
                {isPaused ? "PAUSED" : "LIVE"}
              </Badge>
            </div>
            <div className="flex items-center space-x-1 text-sm colorful:text-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{duration}</span>
            </div>
          </>
        ) : (
          <Badge
            variant="secondary"
            className="colorful:bg-muted colorful:text-muted-foreground"
          >
            OFFLINE
          </Badge>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-2 ml-auto">
        {!isLive ? (
          <Button
            onClick={handleStartSession}
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 colorful:from-accent colorful:to-accent/80 text-white colorful:shadow-lg colorful:shadow-accent/30"
          >
            <Play className="w-4 h-4 mr-2" />
            Go Live
          </Button>
        ) : (
          <>
            {isPaused ? (
              <Button
                onClick={handleResumeSession}
                disabled={loading}
                variant="outline"
                className="colorful:border-primary colorful:text-primary colorful:hover:bg-primary/20"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Resume
              </Button>
            ) : (
              onPauseSession && (
                <Button
                  onClick={handlePauseSession}
                  disabled={loading}
                  variant="outline"
                  className="colorful:border-border colorful:hover:bg-muted"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )
            )}
            <Button
              onClick={handleEndSession}
              disabled={loading}
              variant="destructive"
              className="colorful:bg-destructive colorful:hover:bg-destructive/90 colorful:shadow-lg colorful:shadow-destructive/30"
            >
              <Square className="w-4 h-4 mr-2" />
              End Session
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
