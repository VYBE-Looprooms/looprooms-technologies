"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Users,
  Heart,
  TrendingUp,
  Brain,
  Play,
  Settings,
  BarChart3,
  Home,
  Sparkles,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  type: "user" | "creator";
  verified: boolean;
}

export default function CreatorDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats] = useState({
    totalLooprooms: 0,
    activeLooprooms: 0,
    totalParticipants: 0,
    totalFollowers: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("userToken");
      const userInfo = localStorage.getItem("userInfo");

      if (!token || !userInfo) {
        router.push("/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(userInfo);

        // Check if user is a creator
        if (parsedUser.type !== "creator") {
          router.push("/feed");
          return;
        }

        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user info:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 colorful:bg-background">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 colorful:bg-card border-b border-gray-200 dark:border-gray-800 colorful:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <h1
                onClick={() => router.push("/")}
                className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 colorful:from-primary colorful:to-secondary bg-clip-text text-transparent cursor-pointer"
              >
                Vybe
              </h1>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/feed")}
                  className="text-gray-500 dark:text-gray-400 colorful:text-muted-foreground colorful:hover:bg-primary/20"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Home
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 dark:text-gray-300 colorful:text-foreground colorful:bg-primary/10"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/looprooms")}
                  className="text-gray-500 dark:text-gray-400 colorful:text-muted-foreground colorful:hover:bg-primary/20"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Looprooms
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/ai-looprooms")}
                  className="text-gray-500 dark:text-gray-400 colorful:text-muted-foreground colorful:hover:bg-accent/20"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI Looprooms
                </Button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => router.push("/creator/looproom/create")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 colorful:from-primary colorful:to-secondary text-white rounded-full px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Looproom
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white colorful:text-foreground mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 colorful:text-muted-foreground">
            Here&apos;s what&apos;s happening with your looprooms today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm colorful:bg-card colorful:border colorful:border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 colorful:text-muted-foreground mb-1">
                    Total Looprooms
                  </p>
                  <p className="text-3xl font-bold colorful:text-primary">
                    {stats.totalLooprooms}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 colorful:bg-primary/20 rounded-lg">
                  <Brain className="w-6 h-6 text-purple-600 colorful:text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm colorful:bg-card colorful:border colorful:border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 colorful:text-muted-foreground mb-1">
                    Active Now
                  </p>
                  <p className="text-3xl font-bold colorful:text-secondary">
                    {stats.activeLooprooms}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 colorful:bg-secondary/20 rounded-lg">
                  <Play className="w-6 h-6 text-green-600 colorful:text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm colorful:bg-card colorful:border colorful:border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 colorful:text-muted-foreground mb-1">
                    Total Participants
                  </p>
                  <p className="text-3xl font-bold colorful:text-accent">
                    {stats.totalParticipants}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 colorful:bg-accent/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 colorful:text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm colorful:bg-card colorful:border colorful:border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 colorful:text-muted-foreground mb-1">
                    Followers
                  </p>
                  <p className="text-3xl font-bold text-pink-600 colorful:text-pink-400">
                    {stats.totalFollowers}
                  </p>
                </div>
                <div className="p-3 bg-pink-100 dark:bg-pink-900/20 colorful:bg-pink-500/20 rounded-lg">
                  <Heart className="w-6 h-6 text-pink-600 colorful:text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm colorful:bg-card colorful:border colorful:border-border">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 colorful:text-foreground">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push("/creator/looproom/create")}
                  variant="outline"
                  className="w-full justify-start colorful:border-primary colorful:text-primary colorful:hover:bg-primary/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Looproom
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start colorful:border-border colorful:hover:bg-muted"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Looprooms
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start colorful:border-border colorful:hover:bg-muted"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-0 shadow-sm colorful:bg-card colorful:border colorful:border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold colorful:text-foreground">
                  Your Looprooms
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/looprooms")}
                  className="colorful:hover:bg-muted"
                >
                  View All
                </Button>
              </div>

              {/* Empty State */}
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-400 colorful:text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2 colorful:text-foreground">
                  No looprooms yet
                </h4>
                <p className="text-gray-600 dark:text-gray-400 colorful:text-muted-foreground mb-4">
                  Create your first looproom and start connecting with your
                  audience!
                </p>
                <Button
                  onClick={() => router.push("/creator/looproom/create")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 colorful:from-primary colorful:to-secondary text-white rounded-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Looproom
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm colorful:bg-card colorful:border colorful:border-border">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 colorful:text-foreground">
              Recent Activity
            </h3>
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 colorful:text-muted-foreground mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 colorful:text-muted-foreground">
                No recent activity yet
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
