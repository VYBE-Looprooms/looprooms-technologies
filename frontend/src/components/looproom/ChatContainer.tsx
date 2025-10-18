"use client";

import React, { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Smile, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
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
}

interface ChatContainerProps {
  messages: Message[];
  currentUserId?: number;
  isCreator?: boolean;
  disabled?: boolean;
  typingUsers?: string[];
  onSendMessage: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  onDeleteMessage?: (messageId: string) => void;
  onPinMessage?: (messageId: string) => void;
  onReactToMessage?: (messageId: string, emoji: string) => void;
}

export function ChatContainer({
  messages,
  currentUserId,
  isCreator = false,
  disabled = false,
  typingUsers = [],
  onSendMessage,
  onTyping,
  onDeleteMessage,
  onPinMessage,
  onReactToMessage,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const [autoScroll, setAutoScroll] = React.useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    setShowScrollButton(!isNearBottom);
    setAutoScroll(isNearBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setAutoScroll(true);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 colorful:bg-card">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 colorful:border-border">
        <h3 className="font-semibold colorful:text-foreground">Room Chat</h3>
        <p className="text-xs text-gray-500 colorful:text-muted-foreground">
          {messages.length} messages
        </p>
      </div>

      {/* Messages Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-1 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Smile className="w-12 h-12 text-gray-300 dark:text-gray-600 colorful:text-muted-foreground mb-4" />
            <p className="text-gray-500 colorful:text-muted-foreground">
              No messages yet
            </p>
            <p className="text-sm text-gray-400 colorful:text-muted-foreground mt-1">
              Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                {...message}
                currentUserId={currentUserId}
                isCreator={isCreator}
                onDelete={onDeleteMessage}
                onPin={onPinMessage}
                onReact={onReactToMessage}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-xs text-gray-500 colorful:text-muted-foreground italic">
          {typingUsers.length === 1
            ? `${typingUsers[0]} is typing...`
            : typingUsers.length === 2
            ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
            : `${typingUsers.length} people are typing...`}
        </div>
      )}

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <div className="absolute bottom-24 right-8">
          <Button
            onClick={scrollToBottom}
            size="icon"
            className="rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 colorful:bg-primary colorful:hover:bg-primary/90 text-white colorful:shadow-primary/30"
          >
            <ArrowDown className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Chat Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        disabled={disabled}
      />
    </div>
  );
}
