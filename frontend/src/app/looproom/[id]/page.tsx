"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Users,
  Clock,
  Heart,
  Sparkles,
  Dumbbell,
  Leaf,
  Target,
  Brain,
  Send,
  Smile,
  User,
  Play,
  Settings,
  LogOut,
} from "lucide-react";

interface Looproom {
  id: number;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  participantCount: number;
  maxParticipants: number;
  duration: number;
  createdBy: {
    id: number;
    name: string;
    type: string;
  };
  isAIRoom: boolean;
  aiPersonality?: string;
  musicUrl?: string;
}

interface Participant {
  id: number;
  name: string;
  joinedAt: string;
  mood?: string;
}

interface ChatMessage {
  id: number;
  content: string;
  userId: number;
  userName: string;
  timestamp: string;
  type: "message" | "system" | "ai";
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
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState("");
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  const fetchLooproomDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");

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
        const data = await response.json();
        setLooproom(data.looproom);
        setParticipants(data.participants || []);

        // Check if user is already in the room
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
          const user = JSON.parse(userInfo);
          const isUserInRoom = data.participants?.some(
            (p: Participant) => p.id === user.id
          );
          setIsJoined(isUserInRoom);
        }
      } else {
        console.error("Failed to fetch looproom details");
        router.push("/looprooms");
      }
    } catch (error) {
      console.error("Error fetching looproom:", error);
      router.push("/looprooms");
    } finally {
      setLoading(false);
    }
  }, [roomId, router]);

  useEffect(() => {
    if (roomId) {
      fetchLooproomDetails();
    }
  }, [roomId, fetchLooproomDetails]);

  const handleJoinRoom = async () => {
    if (!selectedMood) {
      setShowMoodSelector(true);
      return;
    }

    try {
      const token = localStorage.getItem("userToken");

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/looprooms/${roomId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ mood: selectedMood }),
        }
      );

      if (response.ok) {
        setIsJoined(true);
        setShowMoodSelector(false);
        fetchLooproomDetails();

        // Add system message
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const systemMessage: ChatMessage = {
          id: Date.now(),
          content: `${userInfo.name} joined the room feeling ${selectedMood}`,
          userId: 0,
          userName: "System",
          timestamp: new Date().toISOString(),
          type: "system",
        };
        setMessages((prev) => [...prev, systemMessage]);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to join room");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Failed to join room");
    }
  };

  const handleLeaveRoom = async () => {
    try {
      const token = localStorage.getItem("userToken");

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/looprooms/${roomId}/leave`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setIsJoined(false);
        fetchLooproomDetails();

        // Add system message
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const systemMessage: ChatMessage = {
          id: Date.now(),
          content: `${userInfo.name} left the room`,
          userId: 0,
          userName: "System",
          timestamp: new Date().toISOString(),
          type: "system",
        };
        setMessages((prev) => [...prev, systemMessage]);
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isJoined) return;

    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const message: ChatMessage = {
      id: Date.now(),
      content: newMessage,
      userId: userInfo.id,
      userName: userInfo.name,
      timestamp: new Date().toISOString(),
      type: "message",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!looproom) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Room not found</h2>
          <Button onClick={() => router.push("/looprooms")} variant="outline">
            Back to Looprooms
          </Button>
        </div>
      </div>
    );
  }

  const CategoryIcon =
    categoryIcons[looproom.category as keyof typeof categoryIcons] || Brain;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 colorful:bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 colorful:bg-card border-b border-gray-200 dark:border-gray-800 colorful:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/looprooms")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <CategoryIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{looproom.name}</h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="capitalize">
                      {looproom.category.replace("-", " ")}
                    </span>
                    {looproom.isAIRoom && (
                      <Badge variant="secondary" className="text-xs">
                        AI Room
                      </Badge>
                    )}
                    {looproom.isActive && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-600 font-medium">LIVE</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              {isJoined && (
                <Button variant="outline" size="sm" onClick={handleLeaveRoom}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave Room
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Room Info */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {looproom.description}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Duration</h3>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{looproom.duration} minutes</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Participants</h3>
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>
                        {looproom.participantCount}/{looproom.maxParticipants}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Join/Leave Button */}
                {!isJoined ? (
                  <div className="mt-6">
                    <Button
                      onClick={() => setShowMoodSelector(true)}
                      disabled={!looproom.isActive}
                      className={`${
                        looproom.isActive
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          : "bg-gray-400 cursor-not-allowed"
                      } text-white px-8 py-2 rounded-full`}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {looproom.isActive ? "Join Room" : "Room Offline"}
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 dark:text-green-400 font-medium">
                        You&apos;re in the room! Enjoy your session.
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Section */}
            {isJoined && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="font-semibold">Room Chat</h3>
                  </div>

                  {/* Messages */}
                  <div className="h-96 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Smile className="w-8 h-8 mx-auto mb-2" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex space-x-3 ${
                            message.type === "system" ? "justify-center" : ""
                          }`}
                        >
                          {message.type === "system" ? (
                            <div className="text-xs text-gray-500 italic">
                              {message.content}
                            </div>
                          ) : (
                            <>
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">
                                    {message.userName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatTime(message.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm">{message.content}</p>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex space-x-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          !e.shiftKey &&
                          (e.preventDefault(), handleSendMessage())
                        }
                        className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="icon"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Participants */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-3">
                  Participants ({participants.length})
                </h3>
                <div className="space-y-2">
                  {participants.length === 0 ? (
                    <p className="text-xs text-gray-500">No participants yet</p>
                  ) : (
                    participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center space-x-2"
                      >
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium">
                            {participant.name}
                          </p>
                          {participant.mood && (
                            <p className="text-xs text-gray-500">
                              {
                                moodEmojis[
                                  participant.mood as keyof typeof moodEmojis
                                ]
                              }{" "}
                              {participant.mood}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mood Selector Modal */}
      {showMoodSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-xl">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">
                How are you feeling?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Select your current mood to join the room
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.entries(moodEmojis).map(([mood, emoji]) => (
                  <Button
                    key={mood}
                    variant={selectedMood === mood ? "default" : "outline"}
                    onClick={() => setSelectedMood(mood)}
                    className="p-4 h-auto flex-col space-y-2"
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
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleJoinRoom}
                  disabled={!selectedMood}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
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
