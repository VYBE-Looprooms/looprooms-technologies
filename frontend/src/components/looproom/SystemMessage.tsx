"use client";

import React from "react";
import {
  Info,
  UserPlus,
  UserMinus,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface SystemMessageProps {
  type: "info" | "join" | "leave" | "warning" | "success";
  message: string;
  timestamp?: string;
}

export function SystemMessage({
  type,
  message,
  timestamp,
}: SystemMessageProps) {
  const getIcon = () => {
    switch (type) {
      case "join":
        return <UserPlus className="w-4 h-4" />;
      case "leave":
        return <UserMinus className="w-4 h-4" />;
      case "warning":
        return <AlertCircle className="w-4 h-4" />;
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "join":
        return "bg-green-50 dark:bg-green-900/20 colorful:bg-green-500/10 text-green-700 dark:text-green-400 colorful:text-green-600 border-green-200 dark:border-green-800 colorful:border-green-500/30";
      case "leave":
        return "bg-gray-50 dark:bg-gray-800 colorful:bg-muted text-gray-600 dark:text-gray-400 colorful:text-muted-foreground border-gray-200 dark:border-gray-700 colorful:border-border";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 colorful:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 colorful:text-yellow-600 border-yellow-200 dark:border-yellow-800 colorful:border-yellow-500/30";
      case "success":
        return "bg-blue-50 dark:bg-blue-900/20 colorful:bg-blue-500/10 text-blue-700 dark:text-blue-400 colorful:text-blue-600 border-blue-200 dark:border-blue-800 colorful:border-blue-500/30";
      default:
        return "bg-purple-50 dark:bg-purple-900/20 colorful:bg-primary/10 text-purple-700 dark:text-purple-400 colorful:text-primary border-purple-200 dark:border-purple-800 colorful:border-primary/30";
    }
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${getStyles()}`}
    >
      {getIcon()}
      <span className="flex-1">{message}</span>
      {timestamp && (
        <span className="text-xs opacity-60">
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}
