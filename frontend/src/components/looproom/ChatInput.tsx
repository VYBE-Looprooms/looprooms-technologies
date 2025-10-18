"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function ChatInput({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 500,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Handle typing indicator
  useEffect(() => {
    if (message.length > 0 && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping?.(false);
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, onTyping]);

  const handleSend = () => {
    if (!message.trim() || disabled) return;

    onSendMessage(message.trim());
    setMessage("");
    setIsTyping(false);
    onTyping?.(false);

    // Focus back on textarea
    textareaRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const remainingChars = maxLength - message.length;
  const isNearLimit = remainingChars < 50;

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-800 colorful:border-border bg-white dark:bg-gray-900 colorful:bg-card">
      <div className="flex space-x-2">
        {/* Textarea */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            className="min-h-[44px] max-h-[120px] resize-none pr-12 colorful:bg-muted colorful:border-border colorful:text-foreground colorful:placeholder:text-muted-foreground"
            rows={1}
          />

          {/* Character count */}
          {isNearLimit && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 colorful:text-muted-foreground">
              {remainingChars}
            </div>
          )}
        </div>

        {/* Emoji button (placeholder for future) */}
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="flex-shrink-0 colorful:hover:bg-muted"
        >
          <Smile className="w-5 h-5 colorful:text-muted-foreground" />
        </Button>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 colorful:bg-primary colorful:hover:bg-primary/90 text-white colorful:shadow-lg colorful:shadow-primary/30"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      {/* Typing indicator placeholder */}
      <div className="h-4 mt-1">
        {/* This will be populated by parent component with typing users */}
      </div>
    </div>
  );
}
