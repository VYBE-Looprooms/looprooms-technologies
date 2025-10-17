"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Link2,
  Clock,
  Award,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Target,
} from "lucide-react";

interface Loopchain {
  id: string;
  name: string;
  description: string;
  type: string;
  difficulty: string;
  estimatedDuration: number;
  completionCount: number;
  averageRating: number;
  isFeatured: boolean;
  rooms: Array<{
    roomId: string;
    order: number;
    transitionMessage: string;
    requiredDuration: number;
  }>;
  emotionalJourney: {
    startMood: string[];
    progressMoods: string[];
    endMood: string[];
  };
  completionRewards: {
    badge: string;
    points: number;
    message: string;
  };
}

interface LoopchainRecommendation {
  loopchain: Loopchain;
  recommendation: {
    reason: string;
    confidence: number;
    alternativeChains: Array<{
      id: string;
      name: string;
      reason: string;
    }>;
  };
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

const moodEmojis = {
  struggling: "😔",
  overwhelmed: "😰",
  anxious: "😟",
  sad: "😢",
  stressed: "😤",
  sluggish: "😴",
  unmotivated: "😑",
  "seeking-energy": "⚡",
  neutral: "😐",
  happy: "😊",
  energetic: "🔥",
  hopeful: "🌟",
  calm: "😌",
  centered: "🧘",
  peaceful: "☮️",
  renewed: "🌱",
  balanced: "⚖️",
  energized: "💪",
  nourished: "🌿",
  strong: "💪",
  vibrant: "✨",
  accomplished: "🏆",
  soothed: "🕊️",
  refreshed: "🌊",
  reset: "🔄",
  clear: "💎",
  ready: "🚀",
};

export default function LoopchainRecommendations() {
  const [recommendation, setRecommendation] =
    useState<LoopchainRecommendation | null>(null);
  const [currentMood, setCurrentMood] = useState<string>("neutral");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);

      // Use mock data until loopchain recommendations API is implemented
      const mockRecommendation = {
        loopchain: {
          id: "recovery-journey-1",
          name: "Gentle Recovery Journey",
          description:
            "A soothing path to help you process difficult emotions and find inner peace through guided meditation and self-compassion exercises.",
          type: "recovery",
          difficulty: "beginner",
          estimatedDuration: 25,
          completionCount: 1247,
          averageRating: 4.8,
          isFeatured: true,
          rooms: [
            {
              roomId: "meditation-1",
              order: 1,
              transitionMessage: "Let's start with some gentle breathing",
              requiredDuration: 10,
            },
            {
              roomId: "recovery-1",
              order: 2,
              transitionMessage: "Now let's process these feelings together",
              requiredDuration: 15,
            },
          ],
          emotionalJourney: {
            startMood: ["struggling", "overwhelmed"],
            progressMoods: ["calm", "centered"],
            endMood: ["peaceful", "renewed"],
          },
          completionRewards: {
            badge: "🌸 Gentle Warrior",
            points: 150,
            message: "You've shown incredible courage in your healing journey",
          },
        },
        recommendation: {
          reason: `Based on your current mood (${currentMood}), this gentle journey will help you find peace and emotional balance through mindful practices.`,
          confidence: 0.92,
          alternativeChains: [
            {
              id: "mindful-reset",
              name: "Mindful Reset",
              reason: "Quick 15-minute reset for busy days",
            },
            {
              id: "energy-boost",
              name: "Natural Energy Boost",
              reason: "Gentle movement and breathing for vitality",
            },
          ],
        },
      };

      setRecommendation(mockRecommendation);
      setError(null);
    } catch (err) {
      setError("Failed to load recommendations");
      console.error("Recommendations error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentMood]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleStartLoopchain = async (loopchainId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Redirect to login or show login modal
        return;
      }

      const response = await fetch(`/api/loopchains/${loopchainId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ startingMood: currentMood }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Started Loopchain:", data);
        // Navigate to Loopchain interface
        alert(`Started your ${recommendation?.loopchain.name} journey!`);
      }
    } catch (err) {
      console.error("Start Loopchain error:", err);
    }
  };

  const moodOptions = [
    "struggling",
    "overwhelmed",
    "anxious",
    "sad",
    "stressed",
    "sluggish",
    "unmotivated",
    "neutral",
    "happy",
    "energetic",
  ];

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Recommended Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !recommendation) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Recommended Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-500">
              {error || "No recommendations available"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRecommendations}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { loopchain, recommendation: rec } = recommendation;

  return (
    <Card className="w-full border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Link2 className="h-3 w-3 text-white" />
          </div>
          Recommended Journey
          {loopchain.isFeatured && (
            <div className="ml-auto flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-yellow-500" />
              <span className="text-xs text-yellow-600 font-medium">
                Featured
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Mood Selector */}
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-3 block">
            How are you feeling today?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {moodOptions.slice(0, 6).map((mood) => (
              <Button
                key={mood}
                variant={currentMood === mood ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentMood(mood)}
                className={`text-xs h-8 justify-start ${
                  currentMood === mood
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="mr-2">
                  {moodEmojis[mood as keyof typeof moodEmojis]}
                </span>
                {mood}
              </Button>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 rounded-xl border border-purple-100 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                {loopchain.name}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {loopchain.description}
              </p>
            </div>
            <Badge
              className={`ml-2 ${
                difficultyColors[
                  loopchain.difficulty as keyof typeof difficultyColors
                ]
              } border-0`}
            >
              {loopchain.difficulty}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <Clock className="h-4 w-4 mx-auto mb-1 text-blue-600" />
              <div className="text-xs font-medium text-gray-900">
                {loopchain.estimatedDuration}m
              </div>
              <div className="text-xs text-gray-500">Duration</div>
            </div>
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <div className="text-xs font-medium text-gray-900">
                {loopchain.completionCount}
              </div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <Award className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
              <div className="text-xs font-medium text-gray-900">
                {loopchain.completionRewards.points}
              </div>
              <div className="text-xs text-gray-500">Points</div>
            </div>
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">💡</span>
              </div>
              <p className="text-sm text-blue-800 font-medium leading-relaxed">
                {rec.reason}
              </p>
            </div>
          </div>

          {/* Emotional Journey Preview */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Your Emotional Journey:
            </h4>
            <div className="flex items-center justify-center gap-3 p-3 bg-white/60 rounded-lg">
              <div className="text-center">
                <div className="flex gap-1 justify-center mb-1">
                  {loopchain.emotionalJourney.startMood.map((mood, i) => (
                    <span key={i} className="text-lg">
                      {moodEmojis[mood as keyof typeof moodEmojis]}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-600 font-medium">Start</div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className="text-center">
                <div className="flex gap-1 justify-center mb-1">
                  {loopchain.emotionalJourney.progressMoods.map((mood, i) => (
                    <span key={i} className="text-lg">
                      {moodEmojis[mood as keyof typeof moodEmojis]}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Progress
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className="text-center">
                <div className="flex gap-1 justify-center mb-1">
                  {loopchain.emotionalJourney.endMood.map((mood, i) => (
                    <span key={i} className="text-lg">
                      {moodEmojis[mood as keyof typeof moodEmojis]}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-600 font-medium">Finish</div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => handleStartLoopchain(loopchain.id)}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2.5"
          >
            <Target className="h-4 w-4 mr-2" />
            Start Your Journey
          </Button>
        </div>

        {/* Alternative Recommendations */}
        {rec.alternativeChains.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Other Journeys:
            </h4>
            <div className="space-y-2">
              {rec.alternativeChains.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="font-medium text-sm text-gray-900">
                    {alt.name}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">{alt.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
