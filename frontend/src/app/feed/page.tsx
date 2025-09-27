"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

interface Post {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    type: "user" | "creator";
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  images?: string[];
  looproom?: {
    name: string;
    category: string;
    participants: number;
  };
  mood?: string;
}

const mockPosts: Post[] = [
  {
    id: "1",
    user: {
      id: "sarah_j",
      name: "Sarah Johnson",
      username: "@sarah_wellness",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      verified: true,
      type: "creator",
    },
    content:
      "Just finished an incredible meditation session in Zen's Mindfulness Looproom! 🧘‍♀️ The guided breathing exercises were exactly what I needed after a busy week. Who else finds peace in the quiet moments? #Mindfulness #Wellness #VybeLife",
    timestamp: "2h",
    likes: 127,
    comments: 23,
    shares: 8,
    isLiked: false,
    mood: "peaceful",
    looproom: {
      name: "Zen's Meditation Room",
      category: "meditation",
      participants: 45,
    },
  },
  {
    id: "2",
    user: {
      id: "marcus_fit",
      name: "Marcus Chen",
      username: "@marcus_fitness",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      verified: false,
      type: "user",
    },
    content:
      "Crushed my morning workout with Vigor! 💪 That HIIT session was intense but so worth it. Already feeling energized for the day. Progress isn't always visible, but it's always happening! 🔥",
    timestamp: "4h",
    likes: 89,
    comments: 15,
    shares: 12,
    isLiked: true,
    mood: "energized",
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop",
    ],
  },
  {
    id: "3",
    user: {
      id: "emma_recovery",
      name: "Emma Wilson",
      username: "@emma_journey",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      verified: false,
      type: "user",
    },
    content:
      "Grateful for this community! 🌱 Hope's Recovery Room has been life-changing. Today marks 90 days, and I couldn't have done it without the support here. To anyone struggling - you're stronger than you know. ✨",
    timestamp: "6h",
    likes: 234,
    comments: 47,
    shares: 19,
    isLiked: false,
    mood: "grateful",
  },
  {
    id: "4",
    user: {
      id: "alex_nutrition",
      name: "Alex Rivera",
      username: "@nourish_with_alex",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      verified: true,
      type: "creator",
    },
    content:
      "Meal prep Sunday with Nourish! 🥗 Just shared my favorite energy bowl recipe in the Healthy Living room. Simple ingredients, maximum nutrition. What's your go-to healthy meal?",
    timestamp: "8h",
    likes: 156,
    comments: 31,
    shares: 24,
    isLiked: true,
    images: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=300&fit=crop",
    ],
    mood: "motivated",
  },
];

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
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [newPost, setNewPost] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();

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

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      user: {
        id: "current_user",
        name: "You",
        username: "@you",
        avatar: "/api/placeholder/40/40",
        verified: false,
        type: "user",
      },
      content: newPost,
      timestamp: "now",
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      mood: selectedMood,
    };

    setPosts([post, ...posts]);
    setNewPost("");
    setSelectedMood("");
    setShowCreatePost(false);
  };

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="mb-4 border-border shadow-sm hover:shadow-md transition-shadow bg-card">
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Image
                src={post.user.avatar}
                alt={post.user.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              {post.user.type === "creator" && (
                <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <h3 className="font-semibold text-foreground">
                  {post.user.name}
                </h3>
                {post.user.verified && (
                  <Verified className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {post.user.username} • {post.timestamp}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Mood Badge */}
        {post.mood && (
          <div className="px-4 pb-2">
            <Badge variant="secondary" className="text-xs">
              {moods.find((m) => m.label.toLowerCase() === post.mood)?.emoji}{" "}
              Feeling {post.mood}
            </Badge>
          </div>
        )}

        {/* Post Content */}
        <div className="px-4 pb-3">
          <p className="text-foreground leading-relaxed">{post.content}</p>
        </div>

        {/* Post Images */}
        {post.images && (
          <div className="px-4 pb-3">
            <Image
              src={post.images[0]}
              alt="Post content"
              width={500}
              height={300}
              className="w-full rounded-lg object-cover max-h-96"
            />
          </div>
        )}

        {/* Looproom Card */}
        {post.looproom && (
          <div className="mx-4 mb-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20 dark:from-primary/20 dark:to-accent/20 colorful:from-primary/30 colorful:to-secondary/30">
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
                    {post.looproom.participants} active participants
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Join Room
              </Button>
            </div>
          </div>
        )}

        {/* Post Actions */}
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className={`flex items-center space-x-2 ${
                  post.isLiked ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`}
                />
                <span className="text-sm font-medium">{post.likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-muted-foreground"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{post.comments}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-muted-foreground"
              >
                <Repeat2 className="w-5 h-5" />
                <span className="text-sm font-medium">{post.shares}</span>
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
        {/* Modern Navigation */}
        <ModernNav
          onCreatePost={() => setShowCreatePost(true)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

      <div className="flex">
        {/* Modern Sidebar */}
        <ModernSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stories */}
              <Card className="p-4 shadow-sm border-border bg-card">
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  {stories.map((story) => (
                    <div key={story.id} className="flex-shrink-0 text-center">
                      <div
                        className={`relative w-16 h-16 rounded-full p-0.5 ${
                          story.hasStory
                            ? "bg-gradient-to-r from-purple-500 to-pink-500"
                            : "bg-muted"
                        }`}
                      >
                        <div className="w-full h-full bg-background rounded-full p-0.5">
                          {story.isAdd ? (
                            <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                              <Plus className="w-6 h-6 text-muted-foreground" />
                            </div>
                          ) : (
                            <Image
                              src={story.avatar}
                              alt={story.user}
                              width={60}
                              height={60}
                              className="w-full h-full rounded-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                      <p className="text-xs mt-1 text-muted-foreground">
                        {story.user}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Create Post */}
              <Card className="p-4 shadow-sm border-border bg-card">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-muted-foreground bg-muted hover:bg-muted/80 rounded-full border-border"
                    onClick={() => setShowCreatePost(true)}
                  >
                    What&apos;s on your mind?
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:bg-green-50"
                    >
                      <Video className="w-5 h-5 mr-2" />
                      Live
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Photo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-600 hover:bg-purple-50"
                    >
                      <Activity className="w-5 h-5 mr-2" />
                      Looproom
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Posts */}
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* AI Room Status */}
              <AIRoomStatus />

              {/* Loopchain Recommendations */}
              <LoopchainRecommendations />

              {/* Trending */}
              <Card className="p-4 shadow-sm border-border bg-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                  Trending
                </h3>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {topic.tag}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {topic.posts} posts
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Suggested Creators */}
              <Card className="p-4 shadow-sm border-border bg-card">
                <h3 className="font-semibold text-foreground mb-4">
                  Suggested Creators
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      name: "Dr. Maya Wellness",
                      username: "@dr_maya",
                      avatar:
                        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face",
                    },
                    {
                      name: "Fitness Coach Jake",
                      username: "@coach_jake",
                      avatar:
                        "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=40&h=40&fit=crop&crop=face",
                    },
                    {
                      name: "Mindful Maria",
                      username: "@mindful_maria",
                      avatar:
                        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face",
                    },
                  ].map((creator, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Image
                          src={creator.avatar}
                          alt={creator.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {creator.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {creator.username}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
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
