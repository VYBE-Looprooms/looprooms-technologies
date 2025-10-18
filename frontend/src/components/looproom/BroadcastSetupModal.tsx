"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Monitor, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUALITY_PRESETS, type BroadcastConfig } from "@/types/webrtc";

interface BroadcastSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBroadcast: (config: BroadcastConfig, stream: MediaStream) => void;
}

export function BroadcastSetupModal({
  isOpen,
  onClose,
  onStartBroadcast,
}: BroadcastSetupModalProps) {
  const [sourceType, setSourceType] = useState<"camera" | "screen">("camera");
  const [quality, setQuality] = useState("1080p30");
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("");
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");

  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // Get available devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        const audioInputs = devices.filter((d) => d.kind === "audioinput");

        setVideoDevices(videoInputs);
        setAudioDevices(audioInputs);

        if (videoInputs.length > 0)
          setSelectedVideoDevice(videoInputs[0].deviceId);
        if (audioInputs.length > 0)
          setSelectedAudioDevice(audioInputs[0].deviceId);
      } catch (err) {
        console.error("Error getting devices:", err);
        setError("Failed to access media devices");
      }
    };

    if (isOpen) {
      getDevices();
    }
  }, [isOpen]);

  // Update preview when settings change
  useEffect(() => {
    if (!isOpen) return;

    const updatePreview = async () => {
      try {
        // Stop previous stream
        if (previewStream) {
          previewStream.getTracks().forEach((track) => track.stop());
        }

        const qualityPreset = QUALITY_PRESETS[quality];
        let stream: MediaStream;

        if (sourceType === "camera") {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: selectedVideoDevice
                ? { exact: selectedVideoDevice }
                : undefined,
              width: { ideal: qualityPreset.width },
              height: { ideal: qualityPreset.height },
              frameRate: { ideal: qualityPreset.frameRate },
            },
            audio: {
              deviceId: selectedAudioDevice
                ? { exact: selectedAudioDevice }
                : undefined,
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
        } else {
          // Screen sharing
          const displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              width: { ideal: qualityPreset.width },
              height: { ideal: qualityPreset.height },
              frameRate: { ideal: qualityPreset.frameRate },
            },
            audio: false,
          });

          // Add audio from microphone
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: selectedAudioDevice
                ? { exact: selectedAudioDevice }
                : undefined,
              echoCancellation: true,
              noiseSuppression: true,
            },
          });

          stream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...audioStream.getAudioTracks(),
          ]);
        }

        setPreviewStream(stream);
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }
        setError("");
      } catch (err) {
        console.error("Error getting media:", err);
        setError(
          err instanceof Error ? err.message : "Failed to access camera/screen"
        );
      }
    };

    updatePreview();

    // Cleanup is handled in updatePreview by stopping previous stream
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sourceType, quality, selectedVideoDevice, selectedAudioDevice]);

  const handleStartBroadcast = () => {
    if (!previewStream) {
      setError("No preview stream available");
      return;
    }

    const config: BroadcastConfig = {
      quality,
      videoDeviceId: selectedVideoDevice,
      audioDeviceId: selectedAudioDevice,
      sourceType,
    };

    onStartBroadcast(config, previewStream);
  };

  const handleClose = () => {
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop());
    }
    setPreviewStream(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Setup Broadcast</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoPreviewRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            />
            {!previewStream && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Preview will appear here</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Source Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Source</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={sourceType === "camera" ? "default" : "outline"}
                onClick={() => setSourceType("camera")}
                className="h-auto py-4"
              >
                <Camera className="w-5 h-5 mr-2" />
                Camera
              </Button>
              <Button
                variant={sourceType === "screen" ? "default" : "outline"}
                onClick={() => setSourceType("screen")}
                className="h-auto py-4"
              >
                <Monitor className="w-5 h-5 mr-2" />
                Screen Share
              </Button>
            </div>
          </div>

          {/* Quality Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quality</label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(QUALITY_PRESETS).map(([key, preset]) => (
                  <SelectItem key={key} value={key}>
                    {preset.label} ({preset.bitrate} kbps)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Camera Selection (only for camera mode) */}
          {sourceType === "camera" && videoDevices.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Camera</label>
              <Select
                value={selectedVideoDevice}
                onValueChange={setSelectedVideoDevice}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {videoDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Microphone Selection */}
          {audioDevices.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Microphone</label>
              <Select
                value={selectedAudioDevice}
                onValueChange={setSelectedAudioDevice}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audioDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label ||
                        `Microphone ${device.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleStartBroadcast}
              disabled={!previewStream}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Video className="w-4 h-4 mr-2" />
              Start Broadcasting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
