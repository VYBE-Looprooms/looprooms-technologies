"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminSidebar from "@/components/admin-sidebar";
import AdminRouteGuard from "@/components/admin-route-guard";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  User,
  Mail,
  Lock,
  Palette,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "next-themes";

interface AdminInfo {
  id?: string;
  name?: string;
  role?: string;
  email?: string;
  lastLoginAt?: string;
}

function AdminSettingsContent() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adminSidebarCollapsed");
      return saved === "true";
    }
    return false;
  });
  const [sidebarMobile, setSidebarMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const getContentOffset = () => {
    if (sidebarMobile) {
      return "ml-0";
    }
    return sidebarCollapsed ? "ml-16" : "ml-64";
  };

  const handleSidebarStateChange = (
    isCollapsed: boolean,
    isMobile: boolean
  ) => {
    setSidebarCollapsed(isCollapsed);
    setSidebarMobile(isMobile);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    router.push("/admin/login");
  }, [router]);

  const fetchAdminInfo = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
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

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error("Failed to fetch admin info");
      }

      const result = await response.json();
      const admin = result.data;
      setAdminInfo(admin);
      setProfileForm({
        name: admin.name || "",
        email: admin.email || "",
      });
    } catch (error) {
      console.error("Admin info fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchAdminInfo();
  }, [router, fetchAdminInfo]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/admin/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileForm),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Profile update failed");
      }

      setAdminInfo(result.data);
      localStorage.setItem("adminInfo", JSON.stringify(result.data));
      setProfileMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
    } catch (error) {
      setProfileMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "Password must be at least 6 characters long",
      });
      setPasswordLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/admin/change-password`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(passwordForm),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Password change failed");
      }

      setPasswordMessage({
        type: "success",
        text: "Password changed successfully!",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to change password",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        adminInfo={adminInfo}
        currentPage="settings"
        onLogout={handleLogout}
        onSidebarStateChange={handleSidebarStateChange}
      />

      <div
        className={`${getContentOffset()} min-h-screen flex flex-col transition-all duration-300`}
      >
        <header className="bg-background border-b border-border px-4 md:px-6 py-4 sticky top-0 z-5">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1
                className={`text-xl md:text-2xl font-bold text-foreground truncate ${
                  sidebarMobile ? "ml-12" : ""
                }`}
              >
                Settings
              </h1>
              <p
                className={`text-sm text-muted-foreground truncate ${
                  sidebarMobile ? "ml-12" : ""
                }`}
              >
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Full Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          placeholder="Enter your email"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {profileMessage && (
                    <div
                      className={`flex items-center p-3 rounded-lg ${
                        profileMessage.type === "success"
                          ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {profileMessage.type === "success" ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <AlertCircle className="w-4 h-4 mr-2" />
                      )}
                      {profileMessage.text}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={profileLoading}
                    className="w-full md:w-auto"
                  >
                    {profileLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {profileLoading ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            current: !prev.current,
                          }))
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          placeholder="Enter new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              new: !prev.new,
                            }))
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              confirm: !prev.confirm,
                            }))
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {passwordMessage && (
                    <div
                      className={`flex items-center p-3 rounded-lg ${
                        passwordMessage.type === "success"
                          ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {passwordMessage.type === "success" ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <AlertCircle className="w-4 h-4 mr-2" />
                      )}
                      {passwordMessage.text}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full md:w-auto"
                  >
                    {passwordLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Lock className="w-4 h-4 mr-2" />
                    )}
                    {passwordLoading ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Theme Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme for the admin interface
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleThemeChange("light")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === "light"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-full h-20 bg-white rounded-md border mb-3 flex items-center justify-center">
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      </div>
                      <h3 className="font-medium text-foreground">Light</h3>
                      <p className="text-xs text-muted-foreground">
                        Clean and bright interface
                      </p>
                    </button>

                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === "dark"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-full h-20 bg-gray-900 rounded-md border mb-3 flex items-center justify-center">
                        <div className="w-8 h-8 bg-gray-700 rounded"></div>
                      </div>
                      <h3 className="font-medium text-foreground">Dark</h3>
                      <p className="text-xs text-muted-foreground">
                        Easy on the eyes
                      </p>
                    </button>

                    <button
                      onClick={() => handleThemeChange("colorful")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === "colorful"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-full h-20 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-md mb-3 flex items-center justify-center">
                        <div className="w-8 h-8 bg-white/20 rounded"></div>
                      </div>
                      <h3 className="font-medium text-foreground">Colorful</h3>
                      <p className="text-xs text-muted-foreground">
                        Vibrant and energetic
                      </p>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">
                        Current Theme
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {theme || "System"}
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <AdminRouteGuard
      allowedRoles={["admin", "super_admin"]}
      redirectTo="/admin/marketing"
    >
      <AdminSettingsContent />
    </AdminRouteGuard>
  );
}
