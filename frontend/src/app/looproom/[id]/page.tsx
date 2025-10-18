"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Sparkles,
  Dumbbell,
  Leaf,
  Target,
  Brain,
  LogOut,
  MessageCircle,
  Users,
  Home,
  Compass,
  TrendingUp,
  Calendar,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/looproom/VideoPlayer";
import { ChatContainer } from "@/components/looproom/ChatContainer";
import { ParticipantList } from "@/components/looproom/ParticipantList";
import { CreatorControlPanel } from "@/components/looproom/CreatorControlPanel";
import { SessionTimer } from "@/components/looproom/SessionTimer";
import { useLooproomSocket } from "@/hooks/useLooproomSocket";
import { useCreatorSocket } from "@/hooks/useCreatorSocket";

interface Looproom {
  id: string;
  name: string;
  description: string;
  category: string;
  isLive: boolean;
  streamUrl?: string;
  participantCount: number;
  maxParticipants: number;
  duration: number;
  creatorId: number;
  chatEnabled: boolean;
}

interface UserInfo {
  id: number;
  name: string;
  email: string;
  type: string;
}

const categoryIcons = {
  recovery: Heart,
  meditation: Sparkles,
  fitness: Dumbbell,
  "healthy-living": Leaf,
  wellness: Target,
};

const moodEmojis = {
  happy: "😊",
  peaceful: "😌",
  energized: "💪",
  grateful: "🙏",
  motivated: "🎯",
  growing: "🌱",
};

export default function LooproomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [looproom, setLooproom] = useState<Looproom | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState("");
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<
    string | undefined
  >();
  const [showChat, setShowChat] = useState(true);
  const [hasAttemptedRejoin, setHasAttemptedRejoin] = useState(false);

  // Socket hooks
  const {
    messages,
    participants,
    participantCount,
    isInRoom,
    typingUsers,
    isConnected,
    sessionState,
    joinLooproom,
    leaveLooproom,
    sendMessage,
    sendTyping,
    reactToMessage,
  } = useLooproomSocket();

  const {
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    moderateUser,
    deleteMessage,
    pinMessage,
  } = useCreatorSocket();

  // Fetch looproom details
  useEffect(() => {
    const fetchLooproom = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const userInfo = localStorage.getItem("userInfo");

        if (userInfo) {
          try {
            setCurrentUser(JSON.parse(userInfo));
          } catch (e) {
            console.error("Failed to parse user info:", e);
            localStorage.removeItem("userInfo");
            localStorage.removeItem("userToken");
          }
        }

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
          }/api/looprooms/${roomId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log("Looproom API response:", result);

          // Handle both response formats: { looproom: ... } or { success: true, data: ... }
          const looproomData = result.data || result.looproom || result;

          if (looproomData && looproomData.id) {
            // Normalize the data structure for both AI and creator looprooms
            const normalizedLooproom = {
              id: looproomData.id,
              name: looproomData.name,
              description: looproomData.description || "",
              category: looproomData.category,
              isLive: looproomData.isLive || looproomData.is_live || false,
              streamUrl: looproomData.streamUrl || looproomData.stream_url,
              participantCount:
                looproomData.participantCount ||
                looproomData.participant_count ||
                0,
              maxParticipants:
                looproomData.maxParticipants ||
                looproomData.max_participants ||
                100,
              duration: looproomData.duration || 60,
              creatorId:
                looproomData.creatorId ||
                looproomData.creator_id ||
                looproomData.creator?.id ||
                0,
              chatEnabled:
                looproomData.chatEnabled !== false &&
                looproomData.chat_enabled !== false,
            };

            setLooproom(normalizedLooproom);
          } else {
            console.error("Invalid looproom data:", looproomData);
            router.push("/looprooms");
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error(
            "Failed to fetch looproom:",
            response.status,
            errorData
          );
          router.push("/looprooms");
        }
      } catch (error) {
        console.error("Error fetching looproom:", error);
        router.push("/looprooms");
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchLooproom();
    }
  }, [roomId, router]);

  // Auto-rejoin logic - separate effect to handle socket connection state
  useEffect(() => {
    const attemptAutoRejoin = async () => {
      // Only attempt once per page load
      if (hasAttemptedRejoin || !isConnected || !looproom) {
        return;
      }

      const wasInRoom = localStorage.getItem(`inRoom_${roomId}`);
      const savedMood = localStorage.getItem(`mood_${roomId}`);

      if (wasInRoom === "true" && savedMood) {
        console.log("Auto-rejoining room after refresh...");
        setHasAttemptedRejoin(true);

        // Small delay to ensure socket is fully ready
        await new Promise((resolve) => setTimeout(resolve, 500));

        const result = await joinLooproom({
          looproomId: roomId,
          mood: savedMood,
          silent: true, // Silent rejoin - no chat message
        });

        if (result.success) {
          console.log("Successfully rejoined room");
          // Message history is loaded automatically in joinLooproom

          // Restore session start time if session is active
          if (result.data?.session?.startedAt) {
            setSessionStartTime(result.data.session.startedAt);
          }
        } else {
          console.error("Failed to auto-rejoin:", result.error);
          // Clear localStorage if rejoin fails
          localStorage.removeItem(`inRoom_${roomId}`);
          localStorage.removeItem(`mood_${roomId}`);
        }
      }
    };

    attemptAutoRejoin();
  }, [isConnected, looproom, roomId, hasAttemptedRejoin, joinLooproom]);

  // Sync session state from socket events
  useEffect(() => {
    if (sessionState.isLive && sessionState.startedAt) {
      setSessionStartTime(sessionState.startedAt);
      setLooproom((prev) => (prev ? { ...prev, isLive: true } : null));
    } else if (!sessionState.isLive) {
      setLooproom((prev) => (prev ? { ...prev, isLive: false } : null));
    }
  }, [sessionState]);

  // Handle join room
  const handleJoinRoom = async () => {
    if (!selectedMood) {
      setShowMoodSelector(true);
      return;
    }

    const result = await joinLooproom({
      looproomId: roomId,
      mood: selectedMood,
    });

    if (result.success) {
      setShowMoodSelector(false);
      if (result.data?.session?.startedAt) {
        setSessionStartTime(result.data.session.startedAt);
      }

      // Save to localStorage for auto-rejoin on refresh
      localStorage.setItem(`inRoom_${roomId}`, "true");
      localStorage.setItem(`mood_${roomId}`, selectedMood);

      // Message history is loaded automatically in joinLooproom
    } else {
      alert(result.error || "Failed to join room");
    }
  };

  // Handle leave room
  const handleLeaveRoom = async () => {
    await leaveLooproom(roomId);

    // Clear localStorage flags
    localStorage.removeItem(`inRoom_${roomId}`);
    localStorage.removeItem(`mood_${roomId}`);
  };

  // Handle send message
  const handleSendMessage = async (content: string) => {
    await sendMessage({
      looproomId: roomId,
      content,
    });
  };

  // Handle typing
  const handleTyping = (isTyping: boolean) => {
    sendTyping({
      looproomId: roomId,
      isTyping,
    });
  };

  // Handle react to message
  const handleReactToMessage = async (messageId: string, emoji: string) => {
    await reactToMessage({
      messageId,
      emoji,
    });
  };

  // Creator actions
  const handleStartSession = async () => {
    // Creator automatically joins the room when starting session
    if (!isInRoom) {
      console.log("Creator joining room before starting session...");
      const joinResult = await joinLooproom({
        looproomId: roomId,
        mood: "focused", // Default mood for creator
      });

      if (!joinResult.success) {
        alert(joinResult.error || "Failed to join room");
        return;
      }

      // Save to localStorage for auto-rejoin on refresh
      localStorage.setItem(`inRoom_${roomId}`, "true");
      localStorage.setItem(`mood_${roomId}`, "focused");

      // Message history is loaded automatically in joinLooproom
    }

    // Now start the session
    const result = await startSession({
      looproomId: roomId,
      streamUrl: looproom?.streamUrl,
    });

    if (result.success) {
      setSessionStartTime(result.data?.startedAt);
      setLooproom((prev) => (prev ? { ...prev, isLive: true } : null));
    } else {
      alert(result.error || "Failed to start session");
    }
  };

  const handleEndSession = async () => {
    const result = await endSession({ looproomId: roomId });

    if (result.success) {
      setSessionStartTime(undefined);
      setLooproom((prev) => (prev ? { ...prev, isLive: false } : null));

      // Creator leaves the room when ending session
      if (isInRoom) {
        await leaveLooproom(roomId);

        // Clear localStorage flags
        localStorage.removeItem(`inRoom_${roomId}`);
        localStorage.removeItem(`mood_${roomId}`);
      }
    } else {
      alert(result.error || "Failed to end session");
    }
  };

  const handlePauseSession = async () => {
    const result = await pauseSession(roomId);
    if (!result.success) {
      alert(result.error || "Failed to pause session");
    }
  };

  const handleResumeSession = async () => {
    const result = await resumeSession(roomId);
    if (!result.success) {
      alert(result.error || "Failed to resume session");
    }
  };

  // Moderation actions
  const handleMuteUser = async (userId: number) => {
    await moderateUser({
      looproomId: roomId,
      targetUserId: userId,
      action: "mute",
      reason: "Muted by creator",
    });
  };

  const handleUnmuteUser = async (userId: number) => {
    await moderateUser({
      looproomId: roomId,
      targetUserId: userId,
      action: "unmute",
    });
  };

  const handleKickUser = async (userId: number) => {
    if (!confirm("Are you sure you want to kick this user?")) return;

    await moderateUser({
      looproomId: roomId,
      targetUserId: userId,
      action: "kick",
      reason: "Kicked by creator",
    });
  };

  const handleBanUser = async (userId: number) => {
    if (!confirm("Are you sure you want to ban this user?")) return;

    await moderateUser({
      looproomId: roomId,
      targetUserId: userId,
      action: "ban",
      reason: "Banned by creator",
    });
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage({
      messageId,
      looproomId: roomId,
    });
  };

  const handlePinMessage = async (messageId: string) => {
    await pinMessage({
      messageId,
      looproomId: roomId,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 colorful:bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 colorful:border-primary"></div>
      </div>
    );
  }

  if (!looproom) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 colorful:bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 colorful:text-foreground">
            Room not found
          </h2>
          <Button onClick={() => router.push("/looprooms")} variant="outline">
            Back to Looprooms
          </Button>
        </div>
      </div>
    );
  }

  const CategoryIcon =
    categoryIcons[looproom.category as keyof typeof categoryIcons] || Brain;
  const isCreator = currentUser && looproom.creatorId === currentUser.id;

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 colorful:bg-background text-gray-900 dark:text-white colorful:text-foreground flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 colorful:bg-card border-b border-gray-200 dark:border-gray-700 colorful:border-border h-12 flex items-center px-4 flex-shrink-0 z-50">
        <div className="flex items-center space-x-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/looprooms")}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 colorful:hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-purple-600 colorful:bg-primary rounded">
              <CategoryIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">{looproom.name}</span>
            {looproom.isLive && (
              <div className="flex items-center space-x-1 bg-red-600 colorful:bg-destructive px-2 py-0.5 rounded text-xs font-bold text-white">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                LIVE
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isInRoom && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeaveRoom}
              className="bg-gray-100 dark:bg-gray-700 colorful:bg-muted border-gray-300 dark:border-gray-600 colorful:border-border hover:bg-gray-200 dark:hover:bg-gray-600 colorful:hover:bg-muted/80"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowChat(!showChat)}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 colorful:hover:bg-muted"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Fixed */}
        <div className="w-60 bg-white dark:bg-gray-800 colorful:bg-card border-r border-gray-200 dark:border-gray-700 colorful:border-border flex-shrink-0 overflow-y-auto">
          <div className="p-4 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700 colorful:hover:bg-muted text-gray-700 dark:text-gray-300 colorful:text-foreground hover:text-gray-900 dark:hover:text-white"
              onClick={() => router.push("/")}
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700 colorful:hover:bg-muted text-gray-700 dark:text-gray-300 colorful:text-foreground hover:text-gray-900 dark:hover:text-white"
              onClick={() => router.push("/looprooms")}
            >
              <Compass className="w-5 h-5 mr-3" />
              Explore Looprooms
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700 colorful:hover:bg-muted text-gray-700 dark:text-gray-300 colorful:text-foreground hover:text-gray-900 dark:hover:text-white"
              onClick={() => router.push("/loopchains")}
            >
              <TrendingUp className="w-5 h-5 mr-3" />
              Loopchains
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700 colorful:hover:bg-muted text-gray-700 dark:text-gray-300 colorful:text-foreground hover:text-gray-900 dark:hover:text-white"
            >
              <Calendar className="w-5 h-5 mr-3" />
              Schedule
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700 colorful:hover:bg-muted text-gray-700 dark:text-gray-300 colorful:text-foreground hover:text-gray-900 dark:hover:text-white"
              onClick={() => router.push("/settings")}
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </Button>
          </div>
        </div>

        {/* Center Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full">
            {/* Video Player */}
            <div className="bg-black aspect-video w-full">
              <VideoPlayer
                url={looproom.streamUrl}
                isLive={looproom.isLive}
                viewerCount={participantCount}
              />
            </div>

            {/* Below Video Content */}
            <div className="p-4 space-y-4 bg-white dark:bg-gray-900 colorful:bg-background">
              {/* Stream Info Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-white colorful:text-foreground">
                    {looproom.name}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 colorful:text-muted-foreground capitalize">
                      {looproom.category.replace("-", " ")}
                    </p>
                    {looproom.isLive && sessionStartTime && (
                      <>
                        <span className="text-gray-400">•</span>
                        <SessionTimer
                          sessionStartTime={sessionStartTime}
                          isLive={looproom.isLive}
                          className="text-gray-600 dark:text-gray-400 colorful:text-muted-foreground"
                        />
                      </>
                    )}
                  </div>
                </div>
                {!isInRoom && !isCreator && (
                  <Button
                    onClick={() => setShowMoodSelector(true)}
                    disabled={!looproom.isLive}
                    className="bg-purple-600 hover:bg-purple-700 colorful:bg-primary colorful:hover:bg-primary/90 text-white px-6"
                  >
                    {looproom.isLive ? "Join Room" : "Offline"}
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500 dark:text-gray-400 colorful:text-muted-foreground" />
                  <span className="text-gray-700 dark:text-gray-300 colorful:text-foreground">
                    {participantCount} / {looproom.maxParticipants}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-gray-500 dark:text-gray-400 colorful:text-muted-foreground" />
                  <span className="text-gray-700 dark:text-gray-300 colorful:text-foreground">
                    {looproom.duration} min
                  </span>
                </div>
              </div>

              {/* Tabs for About/Schedule */}
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="bg-gray-100 dark:bg-gray-800 colorful:bg-muted border-b border-gray-200 dark:border-gray-700 colorful:border-border w-full justify-start rounded-none h-auto p-0">
                  <TabsTrigger
                    value="about"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-600 colorful:data-[state=active]:border-primary rounded-none px-4 py-2 text-gray-700 dark:text-gray-300 colorful:text-foreground"
                  >
                    About
                  </TabsTrigger>
                  <TabsTrigger
                    value="schedule"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-600 colorful:data-[state=active]:border-primary rounded-none px-4 py-2 text-gray-700 dark:text-gray-300 colorful:text-foreground"
                  >
                    Schedule
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="about" className="mt-4">
                  <div className="bg-gray-100 dark:bg-gray-800 colorful:bg-card rounded-lg p-4 border border-gray-200 dark:border-gray-700 colorful:border-border">
                    <p className="text-sm text-gray-700 dark:text-gray-300 colorful:text-foreground leading-relaxed">
                      {looproom.description}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="schedule" className="mt-4">
                  <div className="bg-gray-100 dark:bg-gray-800 colorful:bg-card rounded-lg p-4 border border-gray-200 dark:border-gray-700 colorful:border-border">
                    <p className="text-sm text-gray-500 dark:text-gray-400 colorful:text-muted-foreground">
                      Schedule information coming soon
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Right Chat Panel - Fixed */}
        {showChat && (
          <div
            className={`w-[340px] bg-white dark:bg-gray-800 colorful:bg-card border-l border-gray-200 dark:border-gray-700 colorful:border-border flex-shrink-0 flex flex-col ${
              isCreator ? "pb-16" : ""
            }`}
          >
            <Tabs defaultValue="chat" className="h-full flex flex-col">
              <TabsList className="bg-gray-100 dark:bg-gray-900 colorful:bg-muted m-0 rounded-none border-b border-gray-200 dark:border-gray-700 colorful:border-border w-full flex-shrink-0">
                <TabsTrigger
                  value="chat"
                  className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 colorful:data-[state=active]:bg-card rounded-none text-gray-700 dark:text-gray-300 colorful:text-foreground"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="participants"
                  className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 colorful:data-[state=active]:bg-card rounded-none text-gray-700 dark:text-gray-300 colorful:text-foreground"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Participants
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chat" className="flex-1 m-0 overflow-hidden">
                <ChatContainer
                  messages={messages}
                  currentUserId={currentUser?.id}
                  isCreator={isCreator || false}
                  disabled={!isInRoom || !looproom.chatEnabled}
                  typingUsers={typingUsers}
                  onSendMessage={handleSendMessage}
                  onTyping={handleTyping}
                  onDeleteMessage={handleDeleteMessage}
                  onPinMessage={handlePinMessage}
                  onReactToMessage={handleReactToMessage}
                />
              </TabsContent>
              <TabsContent
                value="participants"
                className="flex-1 m-0 overflow-hidden"
              >
                <ParticipantList
                  participants={participants}
                  currentUserId={currentUser?.id}
                  isCreator={isCreator || false}
                  onMute={handleMuteUser}
                  onUnmute={handleUnmuteUser}
                  onKick={handleKickUser}
                  onBan={handleBanUser}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Creator Control Panel */}
      {isCreator && (
        <CreatorControlPanel
          isLive={looproom.isLive}
          sessionStartTime={sessionStartTime}
          participantCount={participantCount}
          messageCount={messages.length}
          onStartSession={handleStartSession}
          onEndSession={handleEndSession}
          onPauseSession={handlePauseSession}
          onResumeSession={handleResumeSession}
        />
      )}

      {/* Mood Selector Modal */}
      {showMoodSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl colorful:bg-card colorful:border colorful:border-border">
            <CardContent className="p-6">
              <h3 className="font-semibold text-xl mb-2 colorful:text-foreground">
                How are you feeling?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 colorful:text-muted-foreground mb-6">
                Select your current mood to join the room
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.entries(moodEmojis).map(([mood, emoji]) => (
                  <Button
                    key={mood}
                    variant={selectedMood === mood ? "default" : "outline"}
                    onClick={() => setSelectedMood(mood)}
                    className={`p-4 h-auto flex-col space-y-2 transition-all ${
                      selectedMood === mood
                        ? "colorful:bg-primary colorful:text-white ring-2 ring-purple-600 colorful:ring-primary"
                        : "colorful:border-border colorful:hover:bg-primary/10"
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-sm font-medium capitalize">
                      {mood}
                    </span>
                  </Button>
                ))}
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowMoodSelector(false)}
                  className="flex-1 colorful:border-border"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleJoinRoom}
                  disabled={!selectedMood || !isConnected}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 colorful:bg-primary colorful:hover:bg-primary/90 text-white"
                >
                  Join Room
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
