"use client";

import React, { useState } from "react";
import ReactPlayer from "react-player";
import { LiveIndicator } from "./LiveIndicator";
import { Maximize, Volume2, VolumeX, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  url?: string;
  isLive?: boolean;
  viewerCount?: number;
  onReady?: () => void;
  onError?: (error: unknown) => void;
}

export function VideoPlayer({
  url,
  isLive = false,
  viewerCount = 0,
  onReady,
  onError,
}: VideoPlayerProps) {
  const [playing] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);

  const handleFullscreen = () => {
    const element = document.getElementById("video-player-container");
    if (element) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        element.requestFullscreen();
      }
    }
  };

  if (!url) {
    return (
      <div className="relative w-full aspect-video bg-gray-900 dark:bg-gray-950 colorful:bg-card rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 dark:bg-gray-900 colorful:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-gray-600 colorful:text-muted-foreground" />
          </div>
          <p className="text-gray-400 colorful:text-muted-foreground">
            No stream available
          </p>
          <p className="text-sm text-gray-500 colorful:text-muted-foreground mt-1">
            The creator hasn&apos;t started streaming yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="video-player-container"
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group colorful:shadow-2xl colorful:shadow-primary/20"
    >
      {/* Video Player */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {React.createElement(ReactPlayer as any, {
        url: url || "",
        playing,
        muted,
        volume,
        width: "100%",
        height: "100%",
        onReady,
        onError,
      })}

      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
          {isLive && <LiveIndicator viewerCount={viewerCount} />}
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center space-x-2 pointer-events-auto">
          {/* Volume Control */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMuted(!muted)}
            className="text-white hover:bg-white/20"
          >
            {muted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>

          {/* Volume Slider */}
          {!muted && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, white ${
                  volume * 100
                }%, rgba(255,255,255,0.3) ${volume * 100}%)`,
              }}
            />
          )}

          {/* Quality/Settings (placeholder) */}
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
}
