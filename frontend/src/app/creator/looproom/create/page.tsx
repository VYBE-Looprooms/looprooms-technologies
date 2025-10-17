"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Label component inline
const Label = ({
  children,
  htmlFor,
  className = "",
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium ${className}`}>
    {children}
  </label>
);
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Sparkles,
  Dumbbell,
  Leaf,
  Target,
  Users,
  Clock,
  Lock,
  Globe,
  Copy,
  CheckCircle2,
} from "lucide-react";

const categories = [
  { id: "recovery", name: "Recovery", icon: Heart, color: "text-red-500" },
  {
    id: "meditation",
    name: "Meditation",
    icon: Sparkles,
    color: "text-purple-500",
  },
  { id: "fitness", name: "Fitness", icon: Dumbbell, color: "text-orange-500" },
  {
    id: "healthy-living",
    name: "Healthy Living",
    icon: Leaf,
    color: "text-green-500",
  },
  { id: "wellness", name: "Wellness", icon: Target, color: "text-blue-500" },
];

const durations = [15, 30, 45, 60, 90];
const maxParticipants = [10, 25, 50, 100, 500];

export default function CreateLooproomPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<{
    looproom: { id: string };
    accessCode?: string;
    shareableLink: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    duration: 30,
    maxParticipants: 50,
    isPrivate: false,
  });

  const handleCreate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/looprooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setCreatedRoom(result.data);
        setCreated(true);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create looproom");
      }
    } catch (error) {
      console.error("Error creating looproom:", error);
      alert("Failed to create looproom");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (created && createdRoom) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 colorful:bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-0 shadow-xl colorful:bg-card colorful:border colorful:border-border">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 colorful:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 colorful:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2 colorful:text-foreground">
                Looproom Created! 🎉
              </h2>
              <p className="text-gray-600 dark:text-gray-400 colorful:text-muted-foreground">
                Your looproom is ready. Share it with your audience!
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <Label className="text-sm font-medium mb-2 block colorful:text-foreground">
                  Shareable Link
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={createdRoom.shareableLink}
                    readOnly
                    className="flex-1 colorful:bg-muted colorful:border-border colorful:text-foreground"
                  />
                  <Button
                    onClick={() => copyToClipboard(createdRoom.shareableLink)}
                    variant="outline"
                    className="colorful:border-primary colorful:text-primary colorful:hover:bg-primary/20"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {formData.isPrivate && createdRoom.accessCode && (
                <div>
                  <Label className="text-sm font-medium mb-2 block colorful:text-foreground">
                    Access Code (Private Room)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={createdRoom.accessCode}
                      readOnly
                      className="flex-1 font-mono text-lg colorful:bg-muted colorful:border-border colorful:text-foreground"
                    />
                    <Button
                      onClick={() =>
                        createdRoom.accessCode &&
                        copyToClipboard(createdRoom.accessCode)
                      }
                      variant="outline"
                      className="colorful:border-primary colorful:text-primary colorful:hover:bg-primary/20"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 colorful:text-muted-foreground mt-1">
                    Share this code with people you want to invite
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() =>
                  router.push(`/looproom/${createdRoom.looproom.id}`)
                }
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 colorful:from-primary colorful:to-secondary text-white"
              >
                Go to Looproom
              </Button>
              <Button
                onClick={() => router.push("/creator/dashboard")}
                variant="outline"
                className="flex-1 colorful:border-border colorful:hover:bg-muted"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 colorful:bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 colorful:bg-card border-b border-gray-200 dark:border-gray-800 colorful:border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/creator/dashboard")}
                className="colorful:hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold colorful:text-foreground">
                  Create Looproom
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 colorful:text-muted-foreground">
                  Step {step} of 3
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-900 colorful:bg-card border-b border-gray-200 dark:border-gray-800 colorful:border-border py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Basic Info" },
              { num: 2, label: "Settings" },
              { num: 3, label: "Review" },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      s.num <= step
                        ? "bg-purple-600 colorful:bg-primary text-white shadow-lg"
                        : "bg-gray-200 dark:bg-gray-700 colorful:bg-muted text-gray-600 colorful:text-muted-foreground"
                    }`}
                  >
                    {s.num < step ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      s.num <= step
                        ? "text-purple-600 colorful:text-primary"
                        : "text-gray-500 colorful:text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`h-0.5 flex-1 mx-4 transition-all ${
                      s.num < step
                        ? "bg-purple-600 colorful:bg-primary"
                        : "bg-gray-200 dark:bg-gray-700 colorful:bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Card className="border-0 shadow-lg colorful:bg-card colorful:border colorful:border-border">
          <CardContent className="p-8">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4 colorful:text-foreground">
                    Basic Information
                  </h2>
                </div>

                <div>
                  <Label htmlFor="name" className="colorful:text-foreground">
                    Room Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Morning Meditation Session"
                    className="mt-1 colorful:bg-muted colorful:border-border colorful:text-foreground"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="description"
                    className="colorful:text-foreground"
                  >
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe what participants can expect..."
                    rows={4}
                    className="mt-1 colorful:bg-muted colorful:border-border colorful:text-foreground"
                  />
                </div>

                <div>
                  <Label className="mb-3 block colorful:text-foreground">
                    Category *
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          onClick={() =>
                            setFormData({ ...formData, category: cat.id })
                          }
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.category === cat.id
                              ? "border-purple-600 colorful:border-primary bg-purple-50 dark:bg-purple-900/20 colorful:bg-primary/10"
                              : "border-gray-200 dark:border-gray-700 colorful:border-border hover:border-gray-300 colorful:hover:border-primary/50"
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 mx-auto mb-2 ${cat.color}`}
                          />
                          <p className="text-sm font-medium colorful:text-foreground">
                            {cat.name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Settings */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4 colorful:text-foreground">
                    Room Settings
                  </h2>
                </div>

                <div>
                  <Label className="mb-3 block colorful:text-foreground">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Duration
                  </Label>
                  <div className="grid grid-cols-5 gap-2">
                    {durations.map((dur) => (
                      <button
                        key={dur}
                        onClick={() =>
                          setFormData({ ...formData, duration: dur })
                        }
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.duration === dur
                            ? "border-purple-600 colorful:border-primary bg-purple-50 dark:bg-purple-900/20 colorful:bg-primary/10"
                            : "border-gray-200 dark:border-gray-700 colorful:border-border hover:border-gray-300"
                        }`}
                      >
                        <p className="text-sm font-medium colorful:text-foreground">
                          {dur}m
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block colorful:text-foreground">
                    <Users className="w-4 h-4 inline mr-2" />
                    Max Participants
                  </Label>
                  <div className="grid grid-cols-5 gap-2">
                    {maxParticipants.map((max) => (
                      <button
                        key={max}
                        onClick={() =>
                          setFormData({ ...formData, maxParticipants: max })
                        }
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.maxParticipants === max
                            ? "border-purple-600 colorful:border-primary bg-purple-50 dark:bg-purple-900/20 colorful:bg-primary/10"
                            : "border-gray-200 dark:border-gray-700 colorful:border-border hover:border-gray-300"
                        }`}
                      >
                        <p className="text-sm font-medium colorful:text-foreground">
                          {max}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block colorful:text-foreground">
                    Privacy
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        setFormData({ ...formData, isPrivate: false })
                      }
                      className={`p-4 rounded-lg border-2 transition-all ${
                        !formData.isPrivate
                          ? "border-purple-600 colorful:border-primary bg-purple-50 dark:bg-purple-900/20 colorful:bg-primary/10"
                          : "border-gray-200 dark:border-gray-700 colorful:border-border hover:border-gray-300"
                      }`}
                    >
                      <Globe className="w-6 h-6 mx-auto mb-2 text-green-500" />
                      <p className="font-medium mb-1 colorful:text-foreground">
                        Public
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 colorful:text-muted-foreground">
                        Anyone can find and join
                      </p>
                    </button>
                    <button
                      onClick={() =>
                        setFormData({ ...formData, isPrivate: true })
                      }
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.isPrivate
                          ? "border-purple-600 colorful:border-primary bg-purple-50 dark:bg-purple-900/20 colorful:bg-primary/10"
                          : "border-gray-200 dark:border-gray-700 colorful:border-border hover:border-gray-300"
                      }`}
                    >
                      <Lock className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                      <p className="font-medium mb-1 colorful:text-foreground">
                        Private
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 colorful:text-muted-foreground">
                        Requires access code
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4 colorful:text-foreground">
                    Review & Create
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 colorful:bg-muted rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 colorful:text-muted-foreground mb-1">
                      Room Name
                    </p>
                    <p className="font-medium colorful:text-foreground">
                      {formData.name}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 colorful:bg-muted rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 colorful:text-muted-foreground mb-1">
                      Description
                    </p>
                    <p className="colorful:text-foreground">
                      {formData.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 colorful:bg-muted rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 colorful:text-muted-foreground mb-1">
                        Category
                      </p>
                      <Badge className="colorful:bg-primary/20 colorful:text-primary">
                        {
                          categories.find((c) => c.id === formData.category)
                            ?.name
                        }
                      </Badge>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 colorful:bg-muted rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 colorful:text-muted-foreground mb-1">
                        Duration
                      </p>
                      <p className="font-medium colorful:text-foreground">
                        {formData.duration} minutes
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 colorful:bg-muted rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 colorful:text-muted-foreground mb-1">
                        Max Participants
                      </p>
                      <p className="font-medium colorful:text-foreground">
                        {formData.maxParticipants}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 colorful:bg-muted rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 colorful:text-muted-foreground mb-1">
                        Privacy
                      </p>
                      <Badge
                        variant={formData.isPrivate ? "secondary" : "default"}
                        className={
                          formData.isPrivate
                            ? "colorful:bg-orange-500/20 colorful:text-orange-400"
                            : "colorful:bg-green-500/20 colorful:text-green-400"
                        }
                      >
                        {formData.isPrivate ? "Private" : "Public"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 colorful:border-border">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="colorful:border-border colorful:hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 &&
                      (!formData.name ||
                        !formData.description ||
                        !formData.category)) ||
                    (step === 2 && !formData.duration)
                  }
                  className="bg-purple-600 hover:bg-purple-700 colorful:bg-primary colorful:hover:bg-primary/90 text-white"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 colorful:from-primary colorful:to-secondary text-white"
                >
                  {loading ? "Creating..." : "Create Looproom"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
