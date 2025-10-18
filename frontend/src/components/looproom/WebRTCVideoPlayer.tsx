"use client";

import React, { useRef, useEffect, useState } from "react";
import { LiveIndicator } from "./LiveIndicator";
import {
  Maximize,
  Volume2,
  VolumeX,
  Settings,
  Minimize,
  PictureInPicture2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WebRTCVideoPlayerProps {
  stream: MediaStream | null;
  isLive?: boolean;
  viewerCount?: number;
  connectionQuality?: "excellent" | "good" | "poor" | "disconnected";
  onQualityChange?: (quality: string) => void;
}

export function WebRTCVideoPlayer({
  stream,
  isLive = false,
  viewerCount = 0,
  connectionQuality = "disconnected",
}: WebRTCVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const handlePictureInPicture = async () => {
    if (!videoRef.current) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error("PiP error:", error);
    }
  };

  const getQualityColor = () => {
    switch (connectionQuality) {
      case "excellent":
        return "text-green-500";
      case "good":
        return "text-yellow-500";
      case "poor":
        return "text-orange-500";
      case "disconnected":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  if (!stream) {
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
            Waiting for broadcast to start...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group colorful:shadow-2xl colorful:shadow-primary/20"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-contain"
      />

      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center space-x-3">
            {isLive && <LiveIndicator isLive={isLive} />}
            {viewerCount > 0 && (
              <div className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded">
                {viewerCount} viewers
              </div>
            )}
            <div className={`text-xs font-medium ${getQualityColor()}`}>
              {connectionQuality.toUpperCase()}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePictureInPicture}
              className="text-white hover:bg-white/20"
              title="Picture in Picture"
            >
              <PictureInPicture2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              className="text-white hover:bg-white/20"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
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
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setVolume(newVolume);
                if (videoRef.current) {
                  videoRef.current.volume = newVolume;
                }
              }}
              className="w-24 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, white ${
                  volume * 100
                }%, rgba(255,255,255,0.3) ${volume * 100}%)`,
              }}
            />
          )}

          {/* Quality Settings */}
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Auto (recommended)</DropdownMenuItem>
                <DropdownMenuItem>1080p</DropdownMenuItem>
                <DropdownMenuItem>720p</DropdownMenuItem>
                <DropdownMenuItem>480p</DropdownMenuItem>
                <DropdownMenuItem>360p</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Connection Status Indicator */}
      {connectionQuality === "poor" && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          Poor Connection
        </div>
      )}
      {connectionQuality === "disconnected" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
            <p>Reconnecting...</p>
          </div>
        </div>
      )}
    </div>
  );
}
