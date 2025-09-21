"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Image as ImageIcon,
  Video,
  Smile,
  Search,
  Sparkles,
  Users,
  Music,
  Dumbbell,
  Brain,
  Coffee,
} from "lucide-react";
import { gsap } from "gsap"
import CreatorOnboardingModal from "@/components/creator-onboarding-modal";

interface User {
  id: string;
  name: string;
  email: string;
  type: "user" | "creator";
  verified: boolean;
  avatarUrl?: string;
  bio?: string;
}

interface Post {
  id: string;
  userId: string;
  user: {
    name: string;
    type: "user" | "creator";
    avatarUrl?: string;
  };
  content: string;
  mediaUrls?: string[];
  postType: "text" | "image" | "video";
  reactions: number;
  comments: number;
  createdAt: string;
  hasReacted?: boolean;
}

export default function FeedPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [showPostComposer, setShowPostComposer] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStage, setOnboardingStage] = useState<string | null>(null);

  const feedRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const checkCreatorVerificationStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/creator/verification-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      
      const result = await response.json();
      
      if (result.needsOnboarding) {
        setOnboardingStage(result.stage || 'document-verification');
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Failed to check verification status:', error);
    }
  };

  const handleOnboardingComplete = (newStage: string) => {
    setOnboardingStage(newStage);
    if (newStage === 'creator') {
      // Update user type and refresh
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        user.type = 'creator';
        localStorage.setItem('userInfo', JSON.stringify(user));
        setUser(user);
      }
      setShowOnboarding(false);
    }
  };

  const moods = [
    {
      name: "Recovery",
      icon: Heart,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      name: "Fitness",
      icon: Dumbbell,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      name: "Mindfulness",
      icon: Brain,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      name: "Music",
      icon: Music,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      name: "Social",
      icon: Users,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      name: "Productivity",
      icon: Coffee,
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
    },
  ];

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("userToken");
    const userInfo = localStorage.getItem("userInfo");

    if (!token || !userInfo) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);

      // Check if creator needs onboarding
      if (parsedUser.intendedType === 'creator' && parsedUser.type === 'user') {
        checkCreatorVerificationStatus();
      }

      // Mock data for development
      const mockPosts: Post[] = [
        {
          id: "1",
          userId: "creator1",
          user: {
            name: "Sarah Johnson",
            type: "creator",
            avatarUrl: "/api/placeholder/40/40",
          },
          content:
            "Starting a new meditation session in the Mindfulness Looproom! 🧘‍♀️ Join me for 20 minutes of guided breathing exercises. Perfect for beginners and experienced practitioners alike. Let's find our inner peace together! ✨",
          postType: "text",
          reactions: 24,
          comments: 8,
          createdAt: "2025-09-21T10:30:00Z",
          hasReacted: false,
        },
        {
          id: "2",
          userId: "creator2",
          user: {
            name: "Marcus Chen",
            type: "creator",
            avatarUrl: "/api/placeholder/40/40",
          },
          content:
            "Just finished an incredible workout session! 💪 Remember, progress isn't always about lifting heavier - it's about showing up consistently. Every rep counts, every day matters. What's your fitness goal for this week?",
          postType: "text",
          reactions: 42,
          comments: 15,
          createdAt: "2025-09-19T09:15:00Z",
          hasReacted: true,
        },
        {
          id: "3",
          userId: "user1",
          user: {
            name: "Emma Wilson",
            type: "user",
            avatarUrl: "/api/placeholder/40/40",
          },
          content:
            "Feeling grateful for this community! The support I've received in the Recovery Looproom has been life-changing. Thank you to everyone who shares their stories and encouragement. We're stronger together! 🙏",
          postType: "text",
          reactions: 67,
          comments: 23,
          createdAt: "2025-09-10T08:45:00Z",
          hasReacted: false,
        },
      ];

      // Load mock posts for now
      setPosts(mockPosts);
    } catch (err) {
      console.error("Error parsing user info:", err);
      router.push("/login");
      return;
    }

    setIsLoading(false);

    // Animations
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sidebarRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }
      );

      gsap.fromTo(
        feedRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.2 }
      );
    });

    return () => ctx.revert();
  }, [router]);

  const handleReaction = async (postId: string) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            hasReacted: !post.hasReacted,
            reactions: post.hasReacted
              ? post.reactions - 1
              : post.reactions + 1,
          };
        }
        return post;
      })
    );

    // TODO: API call to toggle reaction
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;

    setIsPosting(true);

    try {
      // TODO: API call to create post
      const mockNewPost: Post = {
        id: Date.now().toString(),
        userId: user?.id || "current-user",
        user: {
          name: user?.name || "You",
          type: user?.type || "user",
          avatarUrl: user?.avatarUrl,
        },
        content: newPost,
        postType: "text",
        reactions: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
        hasReacted: false,
      };

      setPosts((prev) => [mockNewPost, ...prev]);
      setNewPost("");
      setShowPostComposer(false);
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setIsPosting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - postDate.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Vybe</h1>
              <div className="hidden md:flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts, creators, moods..."
                  className="w-64"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowPostComposer(!showPostComposer)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Post</span>
              </Button>

              <div className="relative group">
                <button className="flex items-center space-x-2 hover:bg-muted/50 rounded-lg p-2 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <span className="hidden md:inline text-sm text-muted-foreground">
                    {user?.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="font-medium text-foreground">
                        {user?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                        {user?.type === "creator" ? "Creator" : "User"}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.removeItem("userToken");
                        localStorage.removeItem("userInfo");
                        router.push("/");
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div ref={sidebarRef} className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Mood Selector */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    How are you feeling?
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood.name}
                        onClick={() => setSelectedMood(mood.name)}
                        className={`p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                          selectedMood === mood.name
                            ? `${mood.bg} border-current ${mood.color}`
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <mood.icon
                          className={`h-5 w-5 mx-auto mb-1 ${
                            selectedMood === mood.name
                              ? mood.color
                              : "text-muted-foreground"
                          }`}
                        />
                        <p
                          className={`text-xs font-medium ${
                            selectedMood === mood.name
                              ? mood.color
                              : "text-muted-foreground"
                          }`}
                        >
                          {mood.name}
                        </p>
                      </button>
                    ))}
                  </div>

                  {selectedMood && (
                    <Button className="w-full mt-4" size="sm">
                      Find {selectedMood} Looprooms
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Your Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Posts this week
                      </span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Looprooms joined
                      </span>
                      <span className="font-medium">7</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Positive reactions
                      </span>
                      <span className="font-medium">42</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Feed */}
          <div ref={feedRef} className="lg:col-span-3">
            <div className="space-y-6">
              {/* Post Composer */}
              {showPostComposer && (
                <Card className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">
                          {user?.name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div className="flex-1 space-y-4">
                        <Textarea
                          placeholder="Share something positive with the community..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="min-h-[100px] resize-none"
                        />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Photo
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Video className="h-4 w-4 mr-2" />
                              Video
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Smile className="h-4 w-4 mr-2" />
                              Mood
                            </Button>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              onClick={() => setShowPostComposer(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handlePost}
                              disabled={!newPost.trim() || isPosting}
                            >
                              {isPosting ? "Posting..." : "Share"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Posts */}
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="hover:shadow-lg transition-shadow duration-200"
                >
                  <CardContent className="p-6">
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {post.user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-foreground">
                              {post.user.name}
                            </h4>
                            {post.user.type === "creator" && (
                              <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                Creator
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatTimeAgo(post.createdAt)}
                          </p>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-foreground leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handleReaction(post.id)}
                          className={`flex items-center space-x-2 transition-colors duration-200 ${
                            post.hasReacted
                              ? "text-red-500"
                              : "text-muted-foreground hover:text-red-500"
                          }`}
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              post.hasReacted ? "fill-current" : ""
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {post.reactions}
                          </span>
                        </button>

                        <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-200">
                          <MessageCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">
                            {post.comments}
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-muted-foreground">
                          Positive vibes only
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Load More */}
              <div className="text-center py-8">
                <Button variant="outline" size="lg">
                  Load More Posts
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Onboarding Modal */}
      <CreatorOnboardingModal
        isOpen={showOnboarding}
        stage={onboardingStage as 'document-verification' | 'application-questions' | 'under-review' | 'approved' | 'rejected'}
        onComplete={handleOnboardingComplete}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}