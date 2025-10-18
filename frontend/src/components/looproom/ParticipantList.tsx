"use client";

import React, { useState } from "react";
import { ParticipantCard } from "./ParticipantCard";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Participant {
  userId: number;
  name: string;
  mood?: string;
  joinedAt?: number;
  role?: "participant" | "moderator" | "creator";
  isMuted?: boolean;
}

interface ParticipantListProps {
  participants: Participant[];
  currentUserId?: number;
  isCreator?: boolean;
  onMute?: (userId: number) => void;
  onUnmute?: (userId: number) => void;
  onKick?: (userId: number) => void;
  onBan?: (userId: number) => void;
  onPromote?: (userId: number) => void;
}

export function ParticipantList({
  participants,
  currentUserId,
  isCreator = false,
  onMute,
  onUnmute,
  onKick,
  onBan,
  onPromote,
}: ParticipantListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter participants based on search
  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: creator first, then moderators, then by name
  const sortedParticipants = [...filteredParticipants].sort((a, b) => {
    if (a.role === "creator") return -1;
    if (b.role === "creator") return 1;
    if (a.role === "moderator" && b.role !== "moderator") return -1;
    if (b.role === "moderator" && a.role !== "moderator") return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 colorful:bg-card">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 colorful:border-border">
        <div className="flex items-center space-x-2 mb-3">
          <Users className="w-5 h-5 colorful:text-primary" />
          <h3 className="font-semibold colorful:text-foreground">
            Participants
          </h3>
          <span className="text-sm text-gray-500 colorful:text-muted-foreground">
            ({participants.length})
          </span>
        </div>

        {/* Search */}
        {participants.length > 5 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 colorful:text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search participants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 colorful:bg-muted colorful:border-border colorful:text-foreground"
            />
          </div>
        )}
      </div>

      {/* Participant List */}
      <div className="flex-1 overflow-y-auto p-2">
        {sortedParticipants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 colorful:text-muted-foreground mb-2" />
            <p className="text-sm text-gray-500 colorful:text-muted-foreground">
              {searchQuery ? "No participants found" : "No participants yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedParticipants.map((participant) => (
              <ParticipantCard
                key={participant.userId}
                {...participant}
                currentUserId={currentUserId}
                isCreator={isCreator}
                onMute={onMute}
                onUnmute={onUnmute}
                onKick={onKick}
                onBan={onBan}
                onPromote={onPromote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
