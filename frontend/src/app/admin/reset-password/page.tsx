"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Key,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          setIsCheckingAuth(false);
          return;
        }

        // Validate token with backend
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
          }/admin/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          // Token is valid, redirect to dashboard
          router.push("/admin/dashboard");
          return;
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminInfo");
        }
      } catch {
        // Network error or token validation failed, clear storage
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
      }

      setIsCheckingAuth(false);
    };

    checkAuthStatus();
  }, [router]);

  useEffect(() => {
    // Pre-fill email and reset code from URL params
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (email) {
      setFormData((prev) => ({ ...prev, email: decodeURIComponent(email) }));
    }
    if (token) {
      setFormData((prev) => ({ ...prev, resetCode: token }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/admin/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Password reset failed");
      }

      setSuccess(result.message);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/admin/login");
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Password reset failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    if (success) setSuccess(null);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6)
      return { strength: 1, label: "Too short", color: "text-red-500" };
    if (password.length < 8)
      return { strength: 2, label: "Weak", color: "text-orange-500" };
    if (password.length < 12)
      return { strength: 3, label: "Good", color: "text-yellow-500" };
    return { strength: 4, label: "Strong", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1 flex items-center justify-center p-4 pt-32">
          <Card className="w-full max-w-md border-border/50 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Key className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  Checking authentication...
                </p>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 pt-32">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Reset Your Password
            </CardTitle>
            <p className="text-muted-foreground">
              Enter your reset code and new password
            </p>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <div>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      {success}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                      Redirecting to login page...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your-admin@email.com"
                  required
                  className="h-12"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reset Code
                </label>
                <Input
                  type="text"
                  name="resetCode"
                  value={formData.resetCode}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                  className="h-12 text-center text-lg font-mono tracking-widest"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Check your email for the 6-digit reset code
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    required
                    className="h-12 pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className={passwordStrength.color}>
                        {passwordStrength.label}
                      </span>
                      <span className="text-muted-foreground">
                        {formData.newPassword.length}/12+ chars
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          passwordStrength.strength === 1
                            ? "bg-red-500 w-1/4"
                            : passwordStrength.strength === 2
                            ? "bg-orange-500 w-2/4"
                            : passwordStrength.strength === 3
                            ? "bg-yellow-500 w-3/4"
                            : passwordStrength.strength === 4
                            ? "bg-green-500 w-full"
                            : "w-0"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    required
                    className="h-12 pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <p
                    className={`text-xs mt-1 ${
                      formData.newPassword === formData.confirmPassword
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {formData.newPassword === formData.confirmPassword
                      ? "✓ Passwords match"
                      : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Password Requirements:</strong>
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                  <li>• At least 6 characters long</li>
                  <li>• Use a strong, unique password</li>
                  <li>• Consider using a password manager</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={
                  isLoading ||
                  formData.newPassword !== formData.confirmPassword ||
                  formData.newPassword.length < 6
                }
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg font-semibold transition-all duration-200"
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/admin/login"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Back to login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 pt-32">
          <Card className="w-full max-w-md border-border/50 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Key className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
