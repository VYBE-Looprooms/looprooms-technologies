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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/looproom/VideoPlayer";
import { ChatContainer } from "@/components/looproom/ChatContainer";
import { ParticipantList } from "@/components/looproom/ParticipantList";
import { CreatorControlPanel } from "@/components/looproom/CreatorControlPanel";
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

  // Socket hooks
  const {
    messages,
    participants,
    participantCount,
    isInRoom,
    typingUsers,
    isConnected,
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
          setCurrentUser(JSON.parse(userInfo));
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
            setLooproom({
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
            });
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
      if (result.data?.session) {
        setSessionStartTime(result.data.session.startedAt);
      }
    } else {
      alert(result.error || "Failed to join room");
    }
  };

  // Handle leave room
  const handleLeaveRoom = async () => {
    await leaveLooproom(roomId);
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
    } else {
      alert(result.error || "Failed to end session");
    }
  };

  const handlePauseSession = async () => {
    await pauseSession(roomId);
  };

  const handleResumeSession = async () => {
    await resumeSession(roomId);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 colorful:bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 colorful:bg-card border-b border-gray-200 dark:border-gray-800 colorful:border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/looprooms")}
                className="colorful:hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 colorful:bg-primary/20 rounded-lg">
                  <CategoryIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 colorful:text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold colorful:text-foreground">
                    {looproom.name}
                  </h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 colorful:text-muted-foreground">
                    <span className="capitalize">
                      {looproom.category.replace("-", " ")}
                    </span>
                    {looproom.isLive && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-600 colorful:text-destructive font-medium">
                          LIVE
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isInRoom && (
                <Button variant="outline" size="sm" onClick={handleLeaveRoom}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave Room
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 py-6 ${
          isCreator ? "pb-32" : "pb-6"
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Video + Info */}
          <div className="lg:col-span-8 space-y-6">
            {/* Video Player */}
            <VideoPlayer
              url={looproom.streamUrl}
              isLive={looproom.isLive}
              viewerCount={participantCount}
            />

            {/* Room Info */}
            <Card className="border-0 shadow-sm colorful:bg-card colorful:border colorful:border-border">
              <CardContent className="p-6">
                <Tabs defaultValue="about" className="w-full">
                  <TabsList className="colorful:bg-muted">
                    <TabsTrigger
                      value="about"
                      className="colorful:data-[state=active]:bg-primary colorful:data-[state=active]:text-white"
                    >
                      About
                    </TabsTrigger>
                    <TabsTrigger
                      value="schedule"
                      className="colorful:data-[state=active]:bg-primary colorful:data-[state=active]:text-white"
                    >
                      Schedule
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="about" className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 colorful:text-muted-foreground">
                      {looproom.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 colorful:text-muted-foreground">
                          Duration
                        </p>
                        <p className="text-sm font-medium colorful:text-foreground">
                          {looproom.duration} minutes
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 colorful:text-muted-foreground">
                          Capacity
                        </p>
                        <p className="text-sm font-medium colorful:text-foreground">
                          {participantCount}/{looproom.maxParticipants}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="schedule" className="mt-4">
                    <p className="text-sm text-gray-500 colorful:text-muted-foreground">
                      Schedule information coming soon
                    </p>
                  </TabsContent>
                </Tabs>

                {/* Join Button */}
                {!isInRoom && (
                  <div className="mt-6">
                    <Button
                      onClick={() => setShowMoodSelector(true)}
                      disabled={!looproom.isLive && !isCreator}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 colorful:from-primary colorful:to-secondary text-white px-8 colorful:shadow-lg colorful:shadow-primary/30"
                    >
                      {looproom.isLive || isCreator
                        ? "Join Room"
                        : "Room Offline"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Chat + Participants */}
          <div className="lg:col-span-4">
            <Card className="border-0 shadow-sm h-[600px] colorful:bg-card colorful:border colorful:border-border colorful:shadow-lg colorful:shadow-primary/10">
              <Tabs defaultValue="chat" className="h-full flex flex-col">
                <TabsList className="w-full colorful:bg-muted">
                  <TabsTrigger
                    value="chat"
                    className="flex-1 colorful:data-[state=active]:bg-primary colorful:data-[state=active]:text-white"
                  >
                    💬 Chat
                  </TabsTrigger>
                  <TabsTrigger
                    value="participants"
                    className="flex-1 colorful:data-[state=active]:bg-primary colorful:data-[state=active]:text-white"
                  >
                    👥 Participants
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="chat" className="flex-1 m-0">
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
                <TabsContent value="participants" className="flex-1 m-0">
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
            </Card>
          </div>
        </div>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-xl colorful:bg-card colorful:border colorful:border-border">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 colorful:text-foreground">
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
                    className={`p-4 h-auto flex-col space-y-2 ${
                      selectedMood === mood
                        ? "colorful:bg-primary colorful:text-white"
                        : "colorful:border-border colorful:hover:bg-primary/20"
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-sm capitalize">{mood}</span>
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
