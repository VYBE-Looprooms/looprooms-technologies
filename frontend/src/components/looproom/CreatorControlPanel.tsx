"use client";

import React, { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Users,
  MessageSquare,
  BarChart3,
  Settings as SettingsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionControls } from "./SessionControls";

interface CreatorControlPanelProps {
  isLive: boolean;
  isPaused?: boolean;
  sessionStartTime?: string;
  participantCount: number;
  messageCount: number;
  peakParticipants?: number;
  onStartSession: () => Promise<void>;
  onEndSession: () => Promise<void>;
  onPauseSession?: () => Promise<void>;
  onResumeSession?: () => Promise<void>;
}

export function CreatorControlPanel({
  isLive,
  isPaused,
  sessionStartTime,
  participantCount,
  messageCount,
  peakParticipants = 0,
  onStartSession,
  onEndSession,
  onPauseSession,
  onResumeSession,
}: CreatorControlPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 colorful:bg-card border-t border-gray-200 dark:border-gray-800 colorful:border-border colorful:shadow-2xl colorful:shadow-primary/20">
      {/* Minimized View */}
      {!isExpanded && (
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Stats */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-600 colorful:text-primary" />
                <span className="text-sm font-medium colorful:text-foreground">
                  {participantCount}
                </span>
                <span className="text-xs text-gray-500 colorful:text-muted-foreground">
                  viewers
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-600 colorful:text-secondary" />
                <span className="text-sm font-medium colorful:text-foreground">
                  {messageCount}
                </span>
                <span className="text-xs text-gray-500 colorful:text-muted-foreground">
                  messages
                </span>
              </div>
              {peakParticipants > 0 && (
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-green-600 colorful:text-accent" />
                  <span className="text-sm font-medium colorful:text-foreground">
                    {peakParticipants}
                  </span>
                  <span className="text-xs text-gray-500 colorful:text-muted-foreground">
                    peak
                  </span>
                </div>
              )}
            </div>

            {/* Expand Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="colorful:hover:bg-primary/20"
            >
              <ChevronUp className="w-4 h-4 mr-2" />
              Creator Controls
            </Button>
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold colorful:text-foreground">
              Creator Controls
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="colorful:hover:bg-muted"
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              Minimize
            </Button>
          </div>

          <Tabs defaultValue="session" className="w-full">
            <TabsList className="grid w-full grid-cols-4 colorful:bg-muted">
              <TabsTrigger
                value="session"
                className="colorful:data-[state=active]:bg-primary colorful:data-[state=active]:text-white"
              >
                Session
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="colorful:data-[state=active]:bg-primary colorful:data-[state=active]:text-white"
              >
                Content
              </TabsTrigger>
              <TabsTrigger
                value="moderation"
                className="colorful:data-[state=active]:bg-primary colorful:data-[state=active]:text-white"
              >
                Moderation
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="colorful:data-[state=active]:bg-primary colorful:data-[state=active]:text-white"
              >
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Session Tab */}
            <TabsContent value="session" className="mt-4">
              <SessionControls
                isLive={isLive}
                isPaused={isPaused}
                sessionStartTime={sessionStartTime}
                onStartSession={onStartSession}
                onEndSession={onEndSession}
                onPauseSession={onPauseSession}
                onResumeSession={onResumeSession}
              />
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="mt-4">
              <Card className="colorful:bg-muted/50 colorful:border-border">
                <CardContent className="p-6">
                  <div className="text-center text-gray-500 colorful:text-muted-foreground">
                    <SettingsIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Content management coming soon</p>
                    <p className="text-sm mt-1">
                      Upload videos, manage queue, and more
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Moderation Tab */}
            <TabsContent value="moderation" className="mt-4">
              <Card className="colorful:bg-muted/50 colorful:border-border">
                <CardContent className="p-6">
                  <div className="text-center text-gray-500 colorful:text-muted-foreground">
                    <SettingsIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Moderation tools</p>
                    <p className="text-sm mt-1">
                      Manage participants from the sidebar
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-4">
              <Card className="colorful:bg-muted/50 colorful:border-border">
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 colorful:bg-primary/10 rounded-lg">
                      <Users className="w-6 h-6 mx-auto mb-2 text-purple-600 colorful:text-primary" />
                      <p className="text-2xl font-bold colorful:text-foreground">
                        {participantCount}
                      </p>
                      <p className="text-xs text-gray-600 colorful:text-muted-foreground">
                        Current Viewers
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 colorful:bg-secondary/10 rounded-lg">
                      <BarChart3 className="w-6 h-6 mx-auto mb-2 text-blue-600 colorful:text-secondary" />
                      <p className="text-2xl font-bold colorful:text-foreground">
                        {peakParticipants}
                      </p>
                      <p className="text-xs text-gray-600 colorful:text-muted-foreground">
                        Peak Viewers
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 colorful:bg-accent/10 rounded-lg">
                      <MessageSquare className="w-6 h-6 mx-auto mb-2 text-green-600 colorful:text-accent" />
                      <p className="text-2xl font-bold colorful:text-foreground">
                        {messageCount}
                      </p>
                      <p className="text-xs text-gray-600 colorful:text-muted-foreground">
                        Total Messages
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
