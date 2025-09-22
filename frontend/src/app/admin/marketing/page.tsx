"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MarketingSidebar from "@/components/marketing-sidebar";
import {
  Users,
  UserPlus,
  TrendingUp,
  Calendar,
  Download,
  BarChart3,
  Globe,
  Target,
} from "lucide-react";

interface AdminInfo {
  name?: string;
  role?: string;
  email?: string;
  lastLoginAt?: string;
}

interface MarketingStats {
  waitlist: {
    total: number;
    users: number;
    creators: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    yesterdaySignups: number;
    lastWeekSignups: number;
    lastMonthSignups: number;
  };
  growth: Array<{
    date: string;
    signups: number;
    users: number;
    creators: number;
  }>;
  locationStats: Array<{
    location: string;
    count: number;
  }>;
  conversionMetrics: Array<{
    month: string;
    total: number;
    creators: number;
    creatorConversionRate: number;
  }>;
  activityHours: Array<{
    hour: number;
    signups: number;
  }>;
  interestStats: Array<{
    primaryInterest: string;
    count: number;
  }>;
}

function MarketingDashboardContent() {
  const router = useRouter();
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('marketingSidebarCollapsed');
      return saved === 'true';
    }
    return false;
  });
  const [sidebarMobile, setSidebarMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
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

  const fetchMarketingStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/admin/marketing/analytics`,
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
        throw new Error("Failed to fetch marketing stats");
      }

      const result = await response.json();
      setStats(result.data);
    } catch (error) {
      console.error("Marketing stats fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const admin = localStorage.getItem("adminInfo");

    if (!token || !admin) {
      router.push("/admin/login");
      return;
    }

    const adminData = JSON.parse(admin);
    
    // Check if user has marketing access (admin, super_admin, or marketing role)
    if (!['admin', 'super_admin', 'marketing'].includes(adminData.role)) {
      router.push("/admin/dashboard");
      return;
    }

    setAdminInfo(adminData);
    fetchMarketingStats();
  }, [router, fetchMarketingStats]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const handleExportWaitlist = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/admin/export/waitlist`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `vybe-waitlist-${new Date().toISOString().split("T")[0]}.xlsx`;
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
          <p className="text-muted-foreground">Loading marketing dashboard...</p>
        </div>
      </div>
    );
  }

  const todayGrowth = calculateGrowthRate(
    stats?.waitlist.today || 0,
    stats?.waitlist.yesterdaySignups || 0
  );
  const weekGrowth = calculateGrowthRate(
    stats?.waitlist.thisWeek || 0,
    stats?.waitlist.lastWeekSignups || 0
  );
  const monthGrowth = calculateGrowthRate(
    stats?.waitlist.thisMonth || 0,
    stats?.waitlist.lastMonthSignups || 0
  );

  return (
    <div className="min-h-screen bg-background">
      <MarketingSidebar
        adminInfo={adminInfo}
        currentPage="dashboard"
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
                Marketing Dashboard
              </h1>
              <p
                className={`text-sm text-muted-foreground truncate ${
                  sidebarMobile ? "ml-12" : ""
                }`}
              >
                Welcome back, {adminInfo?.name}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Key Metrics */}
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
                  <TrendingUp className={`w-3 h-3 md:w-4 md:h-4 mr-1 ${monthGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={monthGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {monthGrowth >= 0 ? '+' : ''}{monthGrowth}%
                  </span>
                  <span className="text-muted-foreground ml-1">this month</span>
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
                      Creator Signups
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stats?.waitlist.creators || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm">
                  <span className="text-muted-foreground">
                    {Math.round(((stats?.waitlist.creators || 0) / (stats?.waitlist.total || 1)) * 100)}% of total
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      This Week
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stats?.waitlist.thisWeek || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm">
                  <TrendingUp className={`w-3 h-3 md:w-4 md:h-4 mr-1 ${weekGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={weekGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {weekGrowth >= 0 ? '+' : ''}{weekGrowth}%
                  </span>
                  <span className="text-muted-foreground ml-1">vs last week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
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
                  <TrendingUp className={`w-3 h-3 md:w-4 md:h-4 mr-1 ${todayGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={todayGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {todayGrowth >= 0 ? '+' : ''}{todayGrowth}%
                  </span>
                  <span className="text-muted-foreground ml-1">vs yesterday</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Marketing Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base md:text-lg">
                  <Users className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Waitlist Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  View and analyze all user signups
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
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Detailed growth and conversion metrics
                </p>
                <Button
                  onClick={() => router.push("/admin/analytics")}
                  className="w-full"
                  size="sm"
                >
                  View Analytics
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
                  Download waitlist data for campaigns
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={handleExportWaitlist}
                >
                  Export Excel
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Growth Chart & Geographic Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Interest Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base md:text-lg">
                  <Target className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Top Looproom Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.interestStats.slice(0, 8).map((interest, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">
                          {interest.primaryInterest}
                        </p>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (interest.count / (stats?.interestStats[0]?.count || 1)) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-lg font-bold text-foreground">
                          {interest.count}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((interest.count / (stats?.waitlist.total || 1)) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!stats?.interestStats || stats.interestStats.length === 0) && (
                    <p className="text-muted-foreground text-center py-4 text-sm">
                      No interest data available yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Recent Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  Recent Growth (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.growth.slice(-7).map((day, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {formatDate(day.date)}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-blue-600">
                            {day.users} users
                          </span>
                          <span className="text-xs text-purple-600">
                            {day.creators} creators
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          {day.signups}
                        </p>
                        <p className="text-xs text-muted-foreground">signups</p>
                      </div>
                    </div>
                  ))}
                  {(!stats?.growth || stats.growth.length === 0) && (
                    <p className="text-muted-foreground text-center py-4 text-sm">
                      No growth data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base md:text-lg">
                  <Globe className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Top Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.locationStats.slice(0, 8).map((location, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">
                          {location.location}
                        </p>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (location.count / (stats?.locationStats[0]?.count || 1)) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-lg font-bold text-foreground">
                          {location.count}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((location.count / (stats?.waitlist.total || 1)) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!stats?.locationStats || stats.locationStats.length === 0) && (
                    <p className="text-muted-foreground text-center py-4 text-sm">
                      No location data available
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

export default function MarketingDashboard() {
  return <MarketingDashboardContent />;
}