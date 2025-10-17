"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Heart,
  Dumbbell,
  Coffee,
  Sparkles,
  Users,
  Activity,
  PlayCircle,
  Zap,
  Compass,
} from "lucide-react";

interface AIPersonality {
  name: string;
  avatar: string;
  voice: string;
  description: string;
}

interface AIRoomStatus {
  id: string;
  name: string;
  isActive: boolean;
  isLive: boolean;
  participantCount: number;
  personality: AIPersonality;
  lastActivity: string;
  status: "active" | "available";
}

interface AIRoomStatusData {
  [category: string]: AIRoomStatus;
}

const categoryIcons = {
  recovery: Heart,
  meditation: Brain,
  fitness: Dumbbell,
  "healthy-living": Coffee,
  wellness: Sparkles,
};

const categoryGradients = {
  recovery: "from-green-400 to-emerald-500",
  meditation: "from-blue-400 to-indigo-500",
  fitness: "from-red-400 to-pink-500",
  "healthy-living": "from-orange-400 to-amber-500",
  wellness: "from-purple-400 to-violet-500",
};

const categoryBgColors = {
  recovery: "bg-green-50 hover:bg-green-100",
  meditation: "bg-blue-50 hover:bg-blue-100",
  fitness: "bg-red-50 hover:bg-red-100",
  "healthy-living": "bg-orange-50 hover:bg-orange-100",
  wellness: "bg-purple-50 hover:bg-purple-100",
};

export default function AIRoomStatus() {
  const [roomStatus, setRoomStatus] = useState<AIRoomStatusData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoomStatus();
    // Disabled auto-refresh to prevent API spam
    // TODO: Re-enable when AI room status API is implemented
    // const interval = setInterval(fetchRoomStatus, 30000);
    // return () => clearInterval(interval);
  }, []);

  const fetchRoomStatus = async () => {
    try {
      // Use mock data until AI room status API is implemented
      const mockData = {
        recovery: {
          id: "recovery-1",
          name: "Recovery Room",
          isActive: true,
          isLive: true,
          participantCount: 12,
          personality: {
            name: "Dr. Serenity",
            avatar: "🌸",
            voice: "calm",
            description: "Gentle guidance for healing"
          },
          lastActivity: "2 minutes ago",
          status: "active" as const
        },
        meditation: {
          id: "meditation-1", 
          name: "Mindful Space",
          isActive: true,
          isLive: true,
          participantCount: 8,
          personality: {
            name: "Zen Master",
            avatar: "🧘‍♂️",
            voice: "peaceful",
            description: "Deep meditation practices"
          },
          lastActivity: "5 minutes ago",
          status: "active" as const
        },
        fitness: {
          id: "fitness-1",
          name: "Energy Boost",
          isActive: false,
          isLive: false,
          participantCount: 3,
          personality: {
            name: "Coach Max",
            avatar: "💪",
            voice: "energetic",
            description: "High-energy workouts"
          },
          lastActivity: "15 minutes ago",
          status: "available" as const
        }
      };
      
      setRoomStatus(mockData);
      setError(null);
    } catch (err) {
      setError("Failed to load AI rooms");
      console.error("Room status error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterRoom = async (
    category: string,
    mood: string = "neutral"
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Redirect to login or show login modal
        return;
      }

      const response = await fetch(`/api/ai/room/${category}/enter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mood, intention: "explore" }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Entered room:", data);
        // Here you would navigate to the room interface
        // For now, just show success
        alert(`Welcome to ${data.data.personality.name}'s room!`);
      }
    } catch (err) {
      console.error("Enter room error:", err);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            AI Wellness Rooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            AI Wellness Rooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-500">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRoomStatus}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          AI Wellness Rooms
          <div className="ml-auto flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {Object.entries(roomStatus).map(([category, room]) => {
            const IconComponent =
              categoryIcons[category as keyof typeof categoryIcons];
            const gradientClass =
              categoryGradients[category as keyof typeof categoryGradients];
            const bgClass =
              categoryBgColors[category as keyof typeof categoryBgColors];

            return (
              <div
                key={category}
                className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${bgClass} border border-gray-100 hover:shadow-md hover:scale-[1.02]`}
                onClick={() => handleEnterRoom(category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 bg-gradient-to-r ${gradientClass} rounded-full flex items-center justify-center shadow-sm`}
                    >
                      {IconComponent && (
                        <IconComponent className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {room.personality.avatar}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {room.personality.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {room.personality.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="h-3 w-3" />
                      <span className="font-medium">
                        {room.participantCount}
                      </span>
                    </div>
                    {room.status === "active" ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs px-2 py-0.5">
                        <Zap className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-0.5"
                      >
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-sm font-medium hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors"
            onClick={() => {
              // Navigate to full AI rooms page
              console.log("Navigate to AI rooms");
            }}
          >
            <Compass className="h-4 w-4 mr-2" />
            Explore All AI Rooms
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
