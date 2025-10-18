"use client";

import React from "react";
import { User, MoreVertical, Pin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ChatMessageProps {
  id: string;
  content: string;
  userId: number;
  userName: string;
  userType: string;
  timestamp: string;
  type: "message" | "system" | "ai" | "announcement";
  reactions?: Record<string, number[]>;
  isPinned?: boolean;
  isDeleted?: boolean;
  isCreator?: boolean;
  currentUserId?: number;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

export function ChatMessage({
  id,
  content,
  userId,
  userName,
  userType,
  timestamp,
  type,
  reactions = {},
  isPinned = false,
  isDeleted = false,
  isCreator = false,
  currentUserId,
  onDelete,
  onPin,
  onReact,
}: ChatMessageProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // System messages
  if (type === "system") {
    return (
      <div className="flex justify-center py-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 colorful:text-muted-foreground italic">
          {content}
        </p>
      </div>
    );
  }

  // Announcement messages
  if (type === "announcement") {
    return (
      <div className="my-3 p-3 bg-purple-50 dark:bg-purple-900/20 colorful:bg-primary/10 rounded-lg border border-purple-200 dark:border-purple-800 colorful:border-primary/30">
        <div className="flex items-start space-x-2">
          <Badge className="bg-purple-600 colorful:bg-primary text-white">
            Announcement
          </Badge>
          <div className="flex-1">
            <p className="text-sm font-medium colorful:text-foreground">
              {content}
            </p>
            <p className="text-xs text-gray-500 colorful:text-muted-foreground mt-1">
              {userName} • {formatTime(timestamp)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Regular messages
  return (
    <div className="group flex space-x-3 py-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 colorful:hover:bg-muted/50 rounded-lg transition-colors">
      {/* Avatar */}
      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 colorful:from-primary colorful:to-secondary rounded-full flex items-center justify-center flex-shrink-0 colorful:shadow-md colorful:shadow-primary/30">
        <User className="w-4 h-4 text-white" />
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-medium text-sm colorful:text-foreground truncate">
            {userName}
          </span>
          {userType === "creator" && (
            <Badge
              variant="secondary"
              className="text-xs px-1.5 py-0 colorful:bg-primary/20 colorful:text-primary colorful:border-primary/30"
            >
              Creator
            </Badge>
          )}
          {isPinned && (
            <Pin className="w-3 h-3 text-purple-600 colorful:text-primary" />
          )}
          <span className="text-xs text-gray-500 colorful:text-muted-foreground">
            {formatTime(timestamp)}
          </span>
        </div>

        {/* Content */}
        <p
          className={`text-sm leading-relaxed colorful:text-foreground ${
            isDeleted ? "italic text-gray-400" : ""
          }`}
        >
          {content}
        </p>

        {/* Reactions */}
        {Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(reactions).map(([emoji, userIds]) => (
              <button
                key={emoji}
                onClick={() => onReact?.(id, emoji)}
                className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                  userIds.includes(currentUserId || 0)
                    ? "bg-purple-100 dark:bg-purple-900/30 colorful:bg-primary/20 border border-purple-300 colorful:border-primary/40"
                    : "bg-gray-100 dark:bg-gray-800 colorful:bg-muted hover:bg-gray-200 colorful:hover:bg-muted/80"
                }`}
              >
                <span>{emoji}</span>
                <span className="colorful:text-foreground">
                  {userIds.length}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions Menu (for creator) */}
      {isCreator && !isDeleted && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onPin && (
                <DropdownMenuItem onClick={() => onPin(id)}>
                  <Pin className="w-4 h-4 mr-2" />
                  {isPinned ? "Unpin" : "Pin"} Message
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(id)}
                  className="text-red-600 colorful:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Message
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
