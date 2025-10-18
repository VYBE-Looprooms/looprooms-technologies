"use client";

import React from "react";
import {
  User,
  MoreVertical,
  Volume2,
  VolumeX,
  UserX,
  Ban,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ParticipantCardProps {
  userId: number;
  name: string;
  mood?: string;
  joinedAt?: number;
  role?: "participant" | "moderator" | "creator";
  isMuted?: boolean;
  isCreator?: boolean;
  currentUserId?: number;
  onMute?: (userId: number) => void;
  onUnmute?: (userId: number) => void;
  onKick?: (userId: number) => void;
  onBan?: (userId: number) => void;
  onPromote?: (userId: number) => void;
}

const moodEmojis: Record<string, string> = {
  happy: "😊",
  peaceful: "😌",
  energized: "💪",
  grateful: "🙏",
  motivated: "🎯",
  growing: "🌱",
};

export function ParticipantCard({
  userId,
  name,
  mood,
  joinedAt,
  role = "participant",
  isMuted = false,
  isCreator = false,
  currentUserId,
  onMute,
  onUnmute,
  onKick,
  onBan,
  onPromote,
}: ParticipantCardProps) {
  const isCurrentUser = userId === currentUserId;
  const showActions = isCreator && !isCurrentUser;

  const getTimeAgo = (timestamp?: number) => {
    if (!timestamp) return "";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 colorful:hover:bg-muted/50 transition-colors group">
      {/* Avatar */}
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 colorful:from-primary colorful:to-secondary rounded-full flex items-center justify-center colorful:shadow-md colorful:shadow-primary/20">
          <User className="w-4 h-4 text-white" />
        </div>
        {/* Online indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 colorful:bg-accent border-2 border-white dark:border-gray-900 colorful:border-card rounded-full" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1">
          <p className="text-sm font-medium colorful:text-foreground truncate">
            {name}
            {isCurrentUser && (
              <span className="text-xs text-gray-500 colorful:text-muted-foreground ml-1">
                (you)
              </span>
            )}
          </p>
          {role === "creator" && (
            <Badge
              variant="secondary"
              className="text-xs px-1.5 py-0 colorful:bg-primary/20 colorful:text-primary"
            >
              Creator
            </Badge>
          )}
          {role === "moderator" && (
            <Shield className="w-3 h-3 text-purple-600 colorful:text-primary" />
          )}
          {isMuted && (
            <VolumeX className="w-3 h-3 text-red-500 colorful:text-destructive" />
          )}
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500 colorful:text-muted-foreground">
          {mood && moodEmojis[mood] && (
            <span>
              {moodEmojis[mood]} {mood}
            </span>
          )}
          {joinedAt && (
            <span className="text-gray-400 colorful:text-muted-foreground">
              • {getTimeAgo(joinedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Actions Menu */}
      {showActions && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isMuted ? (
                <DropdownMenuItem onClick={() => onUnmute?.(userId)}>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Unmute
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onMute?.(userId)}>
                  <VolumeX className="w-4 h-4 mr-2" />
                  Mute
                </DropdownMenuItem>
              )}
              {role === "participant" && onPromote && (
                <DropdownMenuItem onClick={() => onPromote(userId)}>
                  <Shield className="w-4 h-4 mr-2" />
                  Make Moderator
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onKick?.(userId)}
                className="text-orange-600 colorful:text-orange-500"
              >
                <UserX className="w-4 h-4 mr-2" />
                Kick from Room
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onBan?.(userId)}
                className="text-red-600 colorful:text-destructive"
              >
                <Ban className="w-4 h-4 mr-2" />
                Ban from Room
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
