"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import usePosts from "@/hooks/usePosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Smile,
  Sparkles,
  Brain,
  X,
  TrendingUp,
  ChevronRight,
  Activity,
  User,
  MoreHorizontal,
  MapPin,
  Verified,
  Repeat2,
} from "lucide-react";
import CreatorOnboardingModal from "@/components/creator-onboarding-modal";
import AIRoomStatus from "@/components/ai-room-status";
import LoopchainRecommendations from "@/components/loopchain-recommendations";
import ModernNav from "@/components/modern-nav";
import ModernSidebar from "@/components/modern-sidebar";

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

// Removed mock data - now using real API

const stories = [
  {
    id: "1",
    user: "You",
    avatar: "/api/placeholder/60/60",
    hasStory: false,
    isAdd: true,
  },
  {
    id: "2",
    user: "Sarah",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
    hasStory: true,
  },
  {
    id: "3",
    user: "Marcus",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
    hasStory: true,
  },
  {
    id: "4",
    user: "Emma",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
    hasStory: true,
  },
  {
    id: "5",
    user: "Alex",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
    hasStory: true,
  },
];

const trendingTopics = [
  { tag: "#MindfulMonday", posts: "2.1K" },
  { tag: "#FitnessMotivation", posts: "5.7K" },
  { tag: "#RecoveryJourney", posts: "1.8K" },
  { tag: "#WellnessWednesday", posts: "3.2K" },
  { tag: "#HealthyEating", posts: "4.5K" },
];

export default function FeedPage() {
  const [user, setUser] = useState<User | null>(null);
  const [newPost, setNewPost] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();

  // Use real posts API
  const { posts, loading: postsLoading, createPost, reactToPost } = usePosts();
  const typedPosts = posts as ApiPost[];

  const moods = [
    { emoji: "😊", label: "Happy", color: "bg-yellow-100 text-yellow-800" },
    { emoji: "😌", label: "Peaceful", color: "bg-blue-100 text-blue-800" },
    { emoji: "💪", label: "Energized", color: "bg-red-100 text-red-800" },
    { emoji: "🙏", label: "Grateful", color: "bg-green-100 text-green-800" },
    { emoji: "🎯", label: "Motivated", color: "bg-purple-100 text-purple-800" },
    { emoji: "🌱", label: "Growing", color: "bg-emerald-100 text-emerald-800" },
  ];

  useEffect(() => {
    // Check authentication
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
    // Prevent multiple rapid clicks
    if (reactingPosts.has(postId)) return;

    setReactingPosts((prev) => new Set(prev).add(postId));

    try {
      await reactToPost(postId, "heart");
    } finally {
      // Remove from reacting set after a short delay
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

  const PostCard = ({ post }: { post: ApiPost }) => {
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

    return (
      <Card className="mb-6 border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-card/95 backdrop-blur-sm hover:scale-[1.01]">
        <CardContent className="p-0">
          {/* Post Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Image
                  src={post.author?.avatarUrl || "/api/placeholder/48/48"}
                  alt={post.author?.name || "User"}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                />
                {post.author?.type === "creator" && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1.5 shadow-lg">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-foreground text-base">
                    {post.author?.name || "Anonymous"}
                  </h3>
                  {post.author?.verified && (
                    <Verified className="w-4 h-4 text-blue-500" />
                  )}
                  {post.author?.type === "creator" && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 colorful:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
                    >
                      Creator
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  @
                  {post.author?.name?.toLowerCase().replace(" ", "_") || "user"}{" "}
                  • {formatTimestamp(post.createdAt)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-muted/50 rounded-full"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>

          {/* Mood Badge */}
          {post.mood && (
            <div className="px-6 pb-3">
              <Badge
                variant="secondary"
                className="text-sm px-3 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 colorful:from-primary/20 colorful:to-secondary/20 border-primary/20"
              >
                {moods.find((m) => m.label.toLowerCase() === post.mood)?.emoji}{" "}
                Feeling {post.mood}
              </Badge>
            </div>
          )}

          {/* Post Content */}
          <div className="px-6 pb-4">
            <p className="text-foreground leading-relaxed text-base">
              {post.content}
            </p>
          </div>

          {/* Post Images */}
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <div className="px-6 pb-4">
              <Image
                src={post.mediaUrls[0]}
                alt="Post content"
                width={600}
                height={400}
                className="w-full rounded-xl object-cover max-h-96 shadow-md"
              />
            </div>
          )}

          {/* Looproom Card */}
          {post.looproom && (
            <div className="mx-6 mb-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20 dark:from-primary/20 dark:to-accent/20 colorful:from-primary/30 colorful:to-secondary/30 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {post.looproom.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {post.looproom.participantCount} active participants
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-full px-4 shadow-md"
                >
                  Join Room
                </Button>
              </div>
            </div>
          )}

          {/* Post Actions */}
          <div className="px-6 py-4 border-t border-border bg-muted/20 colorful:bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  disabled={reactingPosts.has(post.id)}
                  className={`flex items-center space-x-2 hover:bg-red-50 colorful:hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full px-3 py-2 transition-all ${
                    post.isLiked
                      ? "text-red-500 bg-red-50 colorful:bg-red-100 dark:bg-red-900/20"
                      : "text-muted-foreground"
                  } ${
                    reactingPosts.has(post.id)
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`}
                  />
                  <span className="text-sm font-semibold">
                    {post.reactionCount || 0}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 colorful:hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full px-3 py-2 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-semibold">
                    {post.commentCount || 0}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-green-600 hover:bg-green-50 colorful:hover:bg-green-100 dark:hover:bg-green-900/20 rounded-full px-3 py-2 transition-all"
                >
                  <Repeat2 className="w-5 h-5" />
                  <span className="text-sm font-semibold">
                    {post.shareCount || 0}
                  </span>
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-purple-600 hover:bg-purple-50 colorful:hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-full p-2 transition-all"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Navigation - Full Width */}
      <ModernNav
        onCreatePost={() => setShowCreatePost(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      {/* Modern Sidebar - Fixed Position */}
      <ModernSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content - Adjusts based on sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Feed */}
              <div className="lg:col-span-8 space-y-8">
                {/* Welcome Header */}
                <div className="text-center py-6">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    Welcome to Your Wellness Journey
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Share your progress, connect with others, and discover new
                    paths to wellbeing
                  </p>
                </div>

                {/* Stories */}
                <Card className="p-6 shadow-lg border-border bg-card/95 backdrop-blur-sm">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                    Wellness Stories
                  </h3>
                  <div className="flex space-x-6 overflow-x-auto pb-2">
                    {stories.map((story) => (
                      <div
                        key={story.id}
                        className="flex-shrink-0 text-center cursor-pointer group"
                      >
                        <div
                          className={`relative w-20 h-20 rounded-full p-1 transition-transform group-hover:scale-105 ${
                            story.hasStory
                              ? "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
                              : "bg-gradient-to-r from-muted to-muted-foreground/20"
                          }`}
                        >
                          <div className="w-full h-full bg-background rounded-full p-1">
                            {story.isAdd ? (
                              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 colorful:from-primary/30 colorful:to-secondary/30 rounded-full flex items-center justify-center">
                                <Plus className="w-8 h-8 text-primary" />
                              </div>
                            ) : (
                              <Image
                                src={story.avatar}
                                alt={story.user}
                                width={80}
                                height={80}
                                className="w-full h-full rounded-full object-cover"
                              />
                            )}
                          </div>
                        </div>
                        <p className="text-sm mt-2 font-medium text-foreground">
                          {story.user}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Create Post */}
                <Card className="p-6 shadow-lg border-border bg-card/95 backdrop-blur-sm">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-muted-foreground bg-muted hover:bg-muted/80 rounded-full border-border h-12 text-base"
                      onClick={() => setShowCreatePost(true)}
                    >
                      Share your wellness journey...
                    </Button>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex space-x-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:bg-green-50 colorful:hover:bg-green-100 dark:hover:bg-green-900/20 font-medium"
                      >
                        <Video className="w-5 h-5 mr-2" />
                        Go Live
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:bg-blue-50 colorful:hover:bg-blue-100 dark:hover:bg-blue-900/20 font-medium"
                      >
                        <ImageIcon className="w-5 h-5 mr-2" />
                        Photo
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-600 hover:bg-purple-50 colorful:hover:bg-purple-100 dark:hover:bg-purple-900/20 font-medium"
                      >
                        <Activity className="w-5 h-5 mr-2" />
                        Join Room
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Empty State with Better Design */}
                {typedPosts.length === 0 && !postsLoading && (
                  <Card className="p-12 shadow-lg border-border bg-gradient-to-br from-primary/5 to-secondary/5 colorful:from-primary/10 colorful:to-secondary/10 dark:from-primary/10 dark:to-secondary/10">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Sparkles className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        Start Your Wellness Story
                      </h3>
                      <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                        Be the first to share your journey! Connect with others,
                        inspire growth, and build a supportive community.
                      </p>
                      <Button
                        onClick={() => setShowCreatePost(true)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your First Post
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Loading State */}
                {postsLoading && typedPosts.length === 0 && (
                  <Card className="p-12 shadow-lg border-border bg-card/95 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                      <p className="text-muted-foreground text-lg">
                        Loading your wellness feed...
                      </p>
                    </div>
                  </Card>
                )}

                {/* Posts */}
                <div className="space-y-6">
                  {typedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="lg:col-span-4 space-y-6 sticky top-24 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
                {/* AI Room Status */}
                <AIRoomStatus />

                {/* Loopchain Recommendations */}
                <LoopchainRecommendations />

                {/* Trending */}
                <Card className="p-6 shadow-lg border-border bg-card/95 backdrop-blur-sm">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                    Trending Topics
                  </h3>
                  <div className="space-y-3">
                    {trendingTopics.map((topic, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between hover:bg-muted/50 colorful:hover:bg-muted/70 p-3 rounded-xl transition-all cursor-pointer group"
                      >
                        <div>
                          <p className="font-semibold text-sm text-foreground group-hover:text-purple-600 transition-colors">
                            {topic.tag}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {topic.posts} posts
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Suggested Creators */}
                <Card className="p-6 shadow-lg border-border bg-card/95 backdrop-blur-sm">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-500" />
                    Suggested Creators
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Dr. Maya Wellness",
                        username: "@dr_maya",
                        avatar:
                          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face",
                        followers: "12.5K",
                        category: "Mental Health",
                      },
                      {
                        name: "Fitness Coach Jake",
                        username: "@coach_jake",
                        avatar:
                          "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=40&h=40&fit=crop&crop=face",
                        followers: "8.2K",
                        category: "Fitness",
                      },
                      {
                        name: "Mindful Maria",
                        username: "@mindful_maria",
                        avatar:
                          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face",
                        followers: "15.7K",
                        category: "Meditation",
                      },
                    ].map((creator, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between hover:bg-muted/50 colorful:hover:bg-muted/70 p-3 rounded-xl transition-all group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Image
                              src={creator.avatar}
                              alt={creator.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground">
                              {creator.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {creator.username} • {creator.followers} followers
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                              {creator.category}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-4"
                        >
                          Follow
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Create Post</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreatePost(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">You</p>
                  <p className="text-sm text-muted-foreground">Public</p>
                </div>
              </div>

              <Textarea
                placeholder="What's on your mind?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[120px] border-0 resize-none text-lg placeholder:text-gray-400"
              />

              {/* Mood Selector */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
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
                      className="text-sm"
                    >
                      {mood.emoji} {mood.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <ImageIcon className="w-5 h-5 text-green-600" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-5 h-5 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Smile className="w-5 h-5 text-yellow-600" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MapPin className="w-5 h-5 text-red-600" />
                  </Button>
                </div>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPost.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Creator Onboarding Modal */}
      {showOnboarding && (
        <CreatorOnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          stage="document-verification"
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
