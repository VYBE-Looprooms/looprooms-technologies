"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminSidebar from "@/components/admin-sidebar";
import {
  Users,
  Mail,
  UserPlus,
  MessageSquare,
  TrendingUp,
  Calendar,
  Download,
} from "lucide-react";

interface AdminInfo {
  name?: string;
  role?: string;
  email?: string;
  lastLoginAt?: string;
}

interface DashboardStats {
  waitlist: {
    total: number;
    users: number;
    creators: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  contacts: {
    total: number;
    new: number;
    inProgress: number;
    today: number;
    thisWeek: number;
  };
  recentSignups: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    type: string;
    location: string;
    createdAt: string;
  }>;
  recentMessages: Array<{
    id: string;
    name: string;
    email: string;
    subject: string;
    type: string;
    status: string;
    createdAt: string;
  }>;
}

function DashboardContent() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Initialize collapsed state from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adminSidebarCollapsed');
      return saved === 'true';
    }
    return false;
  });
  const [sidebarMobile, setSidebarMobile] = useState(() => {
    // Initialize mobile state immediately to prevent flash
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Get content offset based on sidebar state
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

  const fetchDashboardStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/admin/dashboard`,
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
        throw new Error("Failed to fetch dashboard stats");
      }

      const result = await response.json();
      setStats(result.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem("adminToken");
    const admin = localStorage.getItem("adminInfo");

    if (!token || !admin) {
      router.push("/admin/login");
      return;
    }

    setAdminInfo(JSON.parse(admin));
    fetchDashboardStats();
  }, [router, fetchDashboardStats]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExportAll = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/admin/export/all`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            waitlistFilters: {},
            contactFilters: {},
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Download the Excel file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `vybe-data-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Sidebar */}
      <AdminSidebar
        adminInfo={adminInfo}
        currentPage="dashboard"
        onLogout={handleLogout}
        onSidebarStateChange={handleSidebarStateChange}
      />

      {/* Main Content - responsive offset */}
      <div
        className={`${getContentOffset()} min-h-screen flex flex-col transition-all duration-300`}
      >
        {/* Page Header - Fixed */}
        <header className="bg-background border-b border-border px-4 md:px-6 py-4 sticky top-0 z-5">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1
                className={`text-xl md:text-2xl font-bold text-foreground truncate ${
                  sidebarMobile ? "ml-12" : ""
                }`}
              >
                Dashboard
              </h1>
              <p
                className={`text-sm text-muted-foreground truncate ${
                  sidebarMobile ? "ml-12" : ""
                }`}
              >
                Welcome back, {adminInfo?.name}
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">
                Last login:{" "}
                {adminInfo?.lastLoginAt
                  ? new Date(adminInfo.lastLoginAt).toLocaleDateString()
                  : "First time"}
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Content - Scrollable */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Total Signups
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stats?.waitlist.total || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm">
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-1" />
                  <span className="text-green-500">
                    +{stats?.waitlist.thisWeek || 0}
                  </span>
                  <span className="text-muted-foreground ml-1">this week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Creators
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stats?.waitlist.creators || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm">
                  <span className="text-muted-foreground">
                    {stats?.waitlist.users || 0} regular users
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Messages
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stats?.contacts.total || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm">
                  <span className="text-orange-500">
                    {stats?.contacts.new || 0} new
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {stats?.contacts.inProgress || 0} in progress
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Today
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stats?.waitlist.today || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm">
                  <span className="text-muted-foreground">
                    {stats?.contacts.today || 0} messages today
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base md:text-lg">
                  <Users className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Manage Waitlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  View and manage all waitlist signups
                </p>
                <Button
                  onClick={() => router.push("/admin/waitlist")}
                  className="w-full"
                  size="sm"
                >
                  View Waitlist
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base md:text-lg">
                  <Mail className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Contact Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Respond to contact form submissions
                </p>
                <Button
                  onClick={() => router.push("/admin/contacts")}
                  className="w-full"
                  size="sm"
                >
                  View Messages
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base md:text-lg">
                  <Download className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Download waitlist and contact data
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={handleExportAll}
                >
                  Export Excel
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Recent Signups */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  Recent Signups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:space-y-4">
                  {stats?.recentSignups.map((signup) => (
                    <div
                      key={signup.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm md:text-base truncate">
                          {signup.firstName} {signup.lastName}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                          {signup.email}
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              signup.type === "creator"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            }`}
                          >
                            {signup.type}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {signup.location}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(signup.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!stats?.recentSignups ||
                    stats.recentSignups.length === 0) && (
                    <p className="text-muted-foreground text-center py-4 text-sm">
                      No recent signups
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  Recent Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:space-y-4">
                  {stats?.recentMessages.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm md:text-base truncate">
                          {message.name}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                          {message.subject}
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              message.status === "new"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : message.status === "in_progress"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            }`}
                          >
                            {message.status.replace("_", " ")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {message.type}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!stats?.recentMessages ||
                    stats.recentMessages.length === 0) && (
                    <p className="text-muted-foreground text-center py-4 text-sm">
                      No recent messages
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return <DashboardContent />;
}
