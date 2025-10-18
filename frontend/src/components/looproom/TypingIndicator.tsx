"use client";

import React from "react";

interface TypingIndicatorProps {
  users: string[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const getText = () => {
    if (users.length === 1) {
      return `${users[0]} is typing...`;
    } else if (users.length === 2) {
      return `${users[0]} and ${users[1]} are typing...`;
    } else {
      return `${users[0]} and ${users.length - 1} others are typing...`;
    }
  };

  return (
    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 colorful:text-muted-foreground italic flex items-center gap-2">
      <div className="flex gap-1">
        <span
          className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 colorful:bg-muted-foreground rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 colorful:bg-muted-foreground rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 colorful:bg-muted-foreground rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span>{getText()}</span>
    </div>
  );
}
