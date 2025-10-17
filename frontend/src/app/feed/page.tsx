"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import usePosts from "@/hooks/usePosts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Image as ImageIcon,
  Video,
  Music,
  Sparkles,
  Brain,
  X,
  TrendingUp,
  Home,
  Compass,
  Bell,
  User,
  MoreHorizontal,
  Verified,
  Search,
  Bookmark,
  Globe,
  LogOut,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  type: "user" | "creator";
  verified: boolean;
  avatarUrl?: string;
}

interface ApiPost {
  id: number;
  content: string;
  createdAt: string;
  reactionCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  mood?: string;
  mediaUrls?: string[];
  author: {
    id: number;
    name: string;
    type: "user" | "creator";
    verified: boolean;
    avatarUrl?: string;
  };
  looproom?: {
    id: number;
    name: string;
    category: string;
    participantCount: number;
  };
}

const moods = [
  {
    emoji: "😊",
    label: "Happy",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  {
    emoji: "😌",
    label: "Peaceful",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    emoji: "💪",
    label: "Energized",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  {
    emoji: "🙏",
    label: "Grateful",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    emoji: "🎯",
    label: "Motivated",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    emoji: "🌱",
    label: "Growing",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
];

export default function FeedPage() {
  const [user, setUser] = useState<User | null>(null);
  const [newPost, setNewPost] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();

  const { posts, loading: postsLoading, createPost, reactToPost } = usePosts();
  const typedPosts = posts as ApiPost[];

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
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user info:", error);
        localStorage.removeItem("userToken");
        localStorage.removeItem("userInfo");
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const [reactingPosts, setReactingPosts] = useState<Set<number>>(new Set());

  const handleLike = async (postId: number) => {
    if (reactingPosts.has(postId)) return;

    setReactingPosts((prev) => new Set(prev).add(postId));

    try {
      await reactToPost(postId, "heart");
    } finally {
      setTimeout(() => {
        setReactingPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }, 500);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    const postData = {
      content: newPost,
      mood: selectedMood || undefined,
      isPublic: true,
    };

    const result = await createPost(postData);
    if (result.success) {
      setNewPost("");
      setSelectedMood("");
      setShowCreatePost(false);
    } else {
      alert(result.error || "Failed to create post");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    router.push("/login");
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Vybe
              </h1>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 dark:text-gray-300 colorful:text-foreground colorful:hover:bg-primary/20"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Home
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 dark:text-gray-400 colorful:text-muted-foreground colorful:hover:bg-secondary/20"
                >
                  <Compass className="w-5 h-5 mr-2" />
                  Explore
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

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 colorful:text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 colorful:bg-muted colorful:text-foreground border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 colorful:focus:ring-primary"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {user?.type === "creator" && (
                <Button
                  onClick={() => router.push("/creator/looproom/create")}
                  variant="outline"
                  className="rounded-full px-6 colorful:border-primary colorful:text-primary colorful:hover:bg-primary/20"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Create Looproom
                </Button>
              )}
              <Button
                onClick={() => setShowCreatePost(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 colorful:from-primary colorful:to-secondary colorful:hover:from-primary/90 colorful:hover:to-secondary/90 text-white rounded-full px-6 colorful:shadow-lg colorful:shadow-primary/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </Button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 colorful:bg-card rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 colorful:border-border py-1">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 colorful:border-border">
                      <p className="font-semibold text-sm colorful:text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 colorful:text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 colorful:hover:bg-destructive/20 flex items-center text-red-600 colorful:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Hidden on mobile */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-20 space-y-4">
                {/* User Profile Card */}
                <Card className="border-0 shadow-sm colorful:bg-card colorful:border colorful:border-border colorful:shadow-lg colorful:shadow-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 colorful:from-primary colorful:to-secondary rounded-full flex items-center justify-center colorful:shadow-lg colorful:shadow-primary/30">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm colorful:text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 colorful:text-muted-foreground">
                          @{user.name.toLowerCase().replace(" ", "")}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold colorful:text-primary">
                          {typedPosts.length}
                        </p>
                        <p className="text-xs text-gray-500 colorful:text-muted-foreground">
                          Posts
                        </p>
                      </div>
                      <div>
                        <p className="text-lg font-bold colorful:text-secondary">
                          0
                        </p>
                        <p className="text-xs text-gray-500 colorful:text-muted-foreground">
                          Following
                        </p>
                      </div>
                      <div>
                        <p className="text-lg font-bold colorful:text-accent">
                          0
                        </p>
                        <p className="text-xs text-gray-500 colorful:text-muted-foreground">
                          Followers
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="border-0 shadow-sm colorful:bg-card colorful:border colorful:border-border colorful:shadow-lg colorful:shadow-secondary/10">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-3 colorful:text-foreground">
                      Quick Links
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm colorful:hover:bg-primary/20 colorful:text-foreground"
                      >
                        <Sparkles className="w-4 h-4 mr-2 colorful:text-primary" />
                        AI Rooms
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm colorful:hover:bg-secondary/20 colorful:text-foreground"
                      >
                        <TrendingUp className="w-4 h-4 mr-2 colorful:text-secondary" />
                        Trending
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm colorful:hover:bg-accent/20 colorful:text-foreground"
                      >
                        <Bookmark className="w-4 h-4 mr-2 colorful:text-accent" />
                        Saved
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Center Feed */}
            <div className="lg:col-span-6 space-y-4">
              {/* Create Post Card */}
              <Card className="border-0 shadow-sm colorful:bg-card colorful:border colorful:border-border colorful:shadow-lg colorful:shadow-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 colorful:from-primary colorful:to-secondary rounded-full flex items-center justify-center flex-shrink-0 colorful:shadow-lg colorful:shadow-primary/30">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="flex-1 text-left px-4 py-3 bg-gray-100 dark:bg-gray-800 colorful:bg-muted rounded-full text-gray-500 colorful:text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-700 colorful:hover:bg-primary/10 transition-colors"
                    >
                      What&apos;s on your mind?
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 colorful:border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 colorful:text-primary colorful:hover:bg-primary/20"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Photo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 colorful:text-secondary colorful:hover:bg-secondary/20"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Video
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 colorful:text-accent colorful:hover:bg-accent/20"
                    >
                      <Music className="w-4 h-4 mr-2" />
                      Music
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Posts */}
              {postsLoading && typedPosts.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading posts...</p>
                  </CardContent>
                </Card>
              ) : typedPosts.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">
                      Start Your Wellness Journey
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Be the first to share! Create a post and inspire others.
                    </p>
                    <Button
                      onClick={() => setShowCreatePost(true)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-6"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Post
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                typedPosts.map((post) => (
                  <Card
                    key={post.id}
                    className="border-0 shadow-sm hover:shadow-md transition-shadow colorful:bg-card colorful:border colorful:border-border colorful:shadow-lg colorful:shadow-primary/10 colorful:hover:shadow-primary/20"
                  >
                    <CardContent className="p-0">
                      {/* Post Header */}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 colorful:from-primary colorful:to-secondary rounded-full flex items-center justify-center colorful:shadow-md colorful:shadow-primary/30">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-1">
                              <p className="font-semibold text-sm colorful:text-foreground">
                                {post.author?.name || "User"}
                              </p>
                              {post.author?.verified && (
                                <Verified className="w-4 h-4 text-blue-500 colorful:text-accent" />
                              )}
                              {post.author?.type === "creator" && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs px-1.5 py-0 colorful:bg-primary/20 colorful:text-primary colorful:border-primary/30"
                                >
                                  Creator
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 colorful:text-muted-foreground">
                              {formatTimestamp(post.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 colorful:hover:bg-muted"
                        >
                          <MoreHorizontal className="w-4 h-4 colorful:text-muted-foreground" />
                        </Button>
                      </div>

                      {/* Post Content */}
                      <div className="px-4 pb-3">
                        <p className="text-sm leading-relaxed colorful:text-foreground">
                          {post.content}
                        </p>
                      </div>

                      {/* Post Image */}
                      {post.mediaUrls && post.mediaUrls.length > 0 && (
                        <div className="relative w-full aspect-video bg-gray-100">
                          <Image
                            src={post.mediaUrls[0]}
                            alt="Post content"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 colorful:border-border">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            disabled={reactingPosts.has(post.id)}
                            className={`${
                              post.isLiked
                                ? "text-red-500 colorful:text-primary"
                                : "text-gray-600 colorful:text-muted-foreground"
                            } hover:text-red-500 colorful:hover:text-primary colorful:hover:bg-primary/20`}
                          >
                            <Heart
                              className={`w-4 h-4 mr-1.5 ${
                                post.isLiked ? "fill-current" : ""
                              }`}
                            />
                            <span className="text-sm">
                              {post.reactionCount || 0}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 colorful:text-muted-foreground hover:text-blue-500 colorful:hover:text-secondary colorful:hover:bg-secondary/20"
                          >
                            <MessageCircle className="w-4 h-4 mr-1.5" />
                            <span className="text-sm">
                              {post.commentCount || 0}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 colorful:text-muted-foreground hover:text-green-500 colorful:hover:text-accent colorful:hover:bg-accent/20"
                          >
                            <Share2 className="w-4 h-4 mr-1.5" />
                            <span className="text-sm">
                              {post.shareCount || 0}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-600 colorful:text-muted-foreground colorful:hover:text-accent colorful:hover:bg-accent/20"
                          >
                            <Bookmark className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Right Sidebar - Hidden on mobile */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-20 space-y-4">
                {/* Trending */}
                <Card className="border-0 shadow-sm colorful:bg-card colorful:border colorful:border-border colorful:shadow-lg colorful:shadow-accent/10">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-3 colorful:text-foreground">
                      Trending Topics
                    </h3>
                    <div className="space-y-3">
                      {[
                        "#MindfulMonday",
                        "#FitnessGoals",
                        "#WellnessJourney",
                      ].map((tag, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between colorful:hover:bg-primary/10 colorful:p-2 colorful:rounded-lg colorful:transition-colors"
                        >
                          <div>
                            <p className="font-medium text-sm colorful:text-primary">
                              {tag}
                            </p>
                            <p className="text-xs text-gray-500 colorful:text-muted-foreground">
                              {Math.floor(Math.random() * 5000)} posts
                            </p>
                          </div>
                          <TrendingUp className="w-4 h-4 text-green-500 colorful:text-accent" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Suggested Users */}
                <Card className="border-0 shadow-sm colorful:bg-card colorful:border colorful:border-border colorful:shadow-lg colorful:shadow-secondary/10">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-3 colorful:text-foreground">
                      Suggested for You
                    </h3>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between colorful:hover:bg-secondary/10 colorful:p-2 colorful:rounded-lg colorful:transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-8 h-8 bg-gradient-to-r ${
                                i === 1
                                  ? "from-purple-400 to-blue-400 colorful:from-primary colorful:to-secondary"
                                  : i === 2
                                  ? "from-pink-400 to-cyan-400 colorful:from-secondary colorful:to-accent"
                                  : "from-blue-400 to-purple-400 colorful:from-accent colorful:to-primary"
                              } rounded-full colorful:shadow-md colorful:shadow-primary/20`}
                            ></div>
                            <div>
                              <p className="font-medium text-xs colorful:text-foreground">
                                Creator {i}
                              </p>
                              <p className="text-xs text-gray-500 colorful:text-muted-foreground">
                                @creator{i}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs rounded-full colorful:border-primary colorful:text-primary colorful:hover:bg-primary/20"
                          >
                            Follow
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg border-0 shadow-xl colorful:bg-card colorful:border colorful:border-border colorful:shadow-2xl colorful:shadow-primary/20">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 colorful:border-border">
                <h3 className="font-semibold colorful:text-foreground">
                  Create Post
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreatePost(false)}
                  className="h-8 w-8 colorful:hover:bg-destructive/20 colorful:hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 colorful:from-primary colorful:to-secondary rounded-full flex items-center justify-center colorful:shadow-lg colorful:shadow-primary/30">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm colorful:text-foreground">
                      {user.name}
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 colorful:text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      <span>Public</span>
                    </div>
                  </div>
                </div>

                <Textarea
                  placeholder="What's on your mind?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[120px] border-0 resize-none text-sm focus-visible:ring-0 colorful:bg-muted colorful:text-foreground colorful:placeholder:text-muted-foreground"
                />

                {/* Mood Selector */}
                <div>
                  <p className="text-sm font-medium mb-2 colorful:text-foreground">
                    How are you feeling?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((mood) => (
                      <Button
                        key={mood.label}
                        variant={
                          selectedMood === mood.label.toLowerCase()
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setSelectedMood(
                            selectedMood === mood.label.toLowerCase()
                              ? ""
                              : mood.label.toLowerCase()
                          )
                        }
                        className={`text-xs ${
                          selectedMood === mood.label.toLowerCase()
                            ? "colorful:bg-primary colorful:text-white colorful:shadow-md colorful:shadow-primary/30"
                            : "colorful:border-border colorful:text-foreground colorful:hover:bg-primary/20"
                        }`}
                      >
                        {mood.emoji} {mood.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 colorful:border-border">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 colorful:text-primary colorful:hover:bg-primary/20"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 colorful:text-secondary colorful:hover:bg-secondary/20"
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 colorful:text-accent colorful:hover:bg-accent/20"
                    >
                      <Music className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 colorful:from-primary colorful:to-secondary colorful:hover:from-primary/90 colorful:hover:to-secondary/90 text-white rounded-full px-6 colorful:shadow-lg colorful:shadow-primary/30"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
