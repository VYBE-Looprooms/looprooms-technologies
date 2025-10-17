"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Users,
  Clock,
  Sparkles,
  Heart,
  Dumbbell,
  Leaf,
  Target,
  Search,
  Play,
  Pause,
  User,
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
}

const categoryIcons = {
  recovery: Heart,
  meditation: Sparkles,
  fitness: Dumbbell,
  "healthy-living": Leaf,
  wellness: Target,
};

const categoryColors = {
  recovery: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 colorful:bg-red-500/20 colorful:text-red-400 colorful:border-red-500/30",
  meditation: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 colorful:bg-purple-500/20 colorful:text-purple-400 colorful:border-purple-500/30",
  fitness: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 colorful:bg-orange-500/20 colorful:text-orange-400 colorful:border-orange-500/30",
  "healthy-living": "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 colorful:bg-green-500/20 colorful:text-green-400 colorful:border-green-500/30",
  wellness: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 colorful:bg-blue-500/20 colorful:text-blue-400 colorful:border-blue-500/30",
};

export default function LooproomsPage() {
  const [looprooms, setLooprooms] = useState<Looproom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const fetchLooprooms = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");

      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/looprooms?${params}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLooprooms(data.looprooms || []);
      } else {
        console.error("Failed to fetch looprooms");
      }
    } catch (error) {
      console.error("Error fetching looprooms:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchLooprooms();
  }, [fetchLooprooms]);

  const handleJoinRoom = (roomId: number) => {
    router.push(`/looproom/${roomId}`);
  };

  const filteredLooprooms = looprooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const categories = [
    { id: "all", name: "All Rooms", icon: Brain },
    { id: "recovery", name: "Recovery", icon: Heart, hasAI: true },
    { id: "meditation", name: "Meditation", icon: Sparkles, hasAI: true },
    { id: "fitness", name: "Fitness", icon: Dumbbell, hasAI: true },
    { id: "healthy-living", name: "Healthy Living", icon: Leaf, hasAI: true },
    { id: "wellness", name: "Wellness", icon: Target, hasAI: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 colorful:bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 colorful:bg-card border-b border-gray-200 dark:border-gray-800 colorful:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white colorful:text-foreground">
                Looprooms
              </h1>
              <p className="text-gray-600 dark:text-gray-400 colorful:text-muted-foreground mt-1">
                Join live wellness sessions and connect with others
              </p>
            </div>

            {/* Search */}
            <div className="relative max-w-md w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 colorful:text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchLooprooms()}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 colorful:bg-muted border-0 rounded-full text-sm text-gray-900 dark:text-white colorful:text-foreground placeholder:text-gray-500 colorful:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 colorful:focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm colorful:bg-card colorful:border colorful:border-border">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white colorful:text-foreground">Categories</h3>
                <div className="space-y-1">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.id;
                    return (
                      <Button
                        key={category.id}
                        variant={isSelected ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full justify-start text-sm ${
                          isSelected
                            ? "colorful:bg-primary colorful:text-white"
                            : "colorful:text-foreground colorful:hover:bg-primary/20"
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {category.name}
                        {category.hasAI && (
                          <Badge variant="secondary" className="ml-auto text-xs colorful:bg-accent/20 colorful:text-accent">
                            AI
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Looprooms Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredLooprooms.length === 0 ? (
              <Card className="border-0 shadow-sm colorful:bg-card colorful:border colorful:border-border">
                <CardContent className="p-12 text-center">
                  <Brain className="w-12 h-12 text-gray-400 colorful:text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white colorful:text-foreground">No rooms found</h3>
                  <p className="text-gray-600 dark:text-gray-400 colorful:text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search or browse different categories"
                      : "No active rooms in this category right now"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredLooprooms.map((room) => {
                  const CategoryIcon =
                    categoryIcons[
                      room.category as keyof typeof categoryIcons
                    ] || Brain;
                  const categoryColor =
                    categoryColors[
                      room.category as keyof typeof categoryColors
                    ] || "bg-gray-100 text-gray-800";

                  return (
                    <Card
                      key={room.id}
                      className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer colorful:bg-card colorful:border colorful:border-border colorful:hover:shadow-primary/20"
                      onClick={() => handleJoinRoom(room.id)}
                    >
                      <CardContent className="p-4">
                        {/* Room Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className={`p-2 rounded-lg ${categoryColor}`}>
                              <CategoryIcon className="w-4 h-4" />
                            </div>
                            {room.isAIRoom && (
                              <Badge variant="secondary" className="text-xs colorful:bg-accent/20 colorful:text-accent colorful:border-accent/30">
                                AI
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            {room.isActive ? (
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-600 dark:text-green-400 colorful:text-green-400 font-medium">
                                  LIVE
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 colorful:text-muted-foreground">
                                Offline
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Room Info */}
                        <div className="mb-4">
                          <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-white colorful:text-foreground">
                            {room.name}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 colorful:text-muted-foreground line-clamp-2">
                            {room.description}
                          </p>
                        </div>

                        {/* Room Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 colorful:text-muted-foreground mb-4">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>
                              {room.participantCount}/{room.maxParticipants}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{room.duration}min</span>
                          </div>
                          {room.createdBy && (
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span className="truncate max-w-20">
                                {room.createdBy.name}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Join Button */}
                        <Button
                          size="sm"
                          className={`w-full ${
                            room.isActive
                              ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 colorful:from-primary colorful:to-secondary"
                              : "bg-gray-600 hover:bg-gray-700 colorful:bg-muted colorful:hover:bg-muted/80 colorful:text-muted-foreground"
                          } text-white rounded-full`}
                          disabled={!room.isActive}
                        >
                          {room.isActive ? (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Join Room
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3 mr-1" />
                              Room Offline
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
