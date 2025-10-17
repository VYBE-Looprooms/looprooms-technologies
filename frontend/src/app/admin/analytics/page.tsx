"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminSidebar from "@/components/admin-sidebar";
import MarketingSidebar from "@/components/marketing-sidebar";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Globe,
  Clock,
  Target,
  Download,
  Calendar,
  Activity,
} from "lucide-react";

interface AdminInfo {
  name?: string;
  role?: string;
  email?: string;
  lastLoginAt?: string;
}

interface AnalyticsData {
  summary: {
    totalSignups: number;
    totalUsers: number;
    totalCreators: number;
    todaySignups: number;
    weekSignups: number;
    monthSignups: number;
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
  contactTrends: Array<{
    date: string;
    messages: number;
    support: number;
    partnership: number;
    creator: number;
  }>;
  locationStats: Array<{
    location: string;
    count: number;
  }>;
  typeDistribution: Array<{
    week: string;
    type: string;
    count: number;
  }>;
  messageTypeStats: Array<{
    type: string;
    count: number;
    resolved: number;
  }>;
  responseTimeStats: Array<{
    type: string;
    avgResponseHours: number;
    totalMessages: number;
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
}

function AnalyticsContent() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
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

  const handleExportReport = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/admin/export/analytics`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
      a.download = `vybe-analytics-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Please try again.");
    }
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/admin/analytics`,
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
        throw new Error("Failed to fetch analytics");
      }

      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error("Analytics fetch error:", error);
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

    setAdminInfo(JSON.parse(admin));
    fetchAnalytics();
  }, [router, fetchAnalytics]);

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? "+" : ""}${num}%`;
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (rate < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return "text-green-500";
    if (rate < 0) return "text-red-500";
    return "text-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const todayGrowth = calculateGrowthRate(
    data?.summary.todaySignups || 0,
    data?.summary.yesterdaySignups || 0
  );
  const weekGrowth = calculateGrowthRate(
    data?.summary.weekSignups || 0,
    data?.summary.lastWeekSignups || 0
  );
  const monthGrowth = calculateGrowthRate(
    data?.summary.monthSignups || 0,
    data?.summary.lastMonthSignups || 0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Sidebar - Role-based */}
      {adminInfo?.role === "marketing" ? (
        <MarketingSidebar
          adminInfo={adminInfo}
          currentPage="analytics"
          onLogout={handleLogout}
          onSidebarStateChange={handleSidebarStateChange}
        />
      ) : (
        <AdminSidebar
          adminInfo={adminInfo}
          currentPage="analytics"
          onLogout={handleLogout}
          onSidebarStateChange={handleSidebarStateChange}
        />
      )}

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
                Analytics Dashboard
              </h1>
              <p
                className={`text-sm text-muted-foreground truncate ${
                  sidebarMobile ? "ml-12" : ""
                }`}
              >
                Comprehensive insights and growth metrics
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={handleExportReport}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Mobile Export Button */}
          <div className="sm:hidden mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Analytics Report
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Total Signups
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {formatNumber(data?.summary.totalSignups || 0)}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                  </div>
                </div>
                <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm">
                  {getGrowthIcon(monthGrowth)}
                  <span className={`ml-1 ${getGrowthColor(monthGrowth)}`}>
                    {formatPercentage(monthGrowth)}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    vs last month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      This Week
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {formatNumber(data?.summary.weekSignups || 0)}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm">
                  {getGrowthIcon(weekGrowth)}
                  <span className={`ml-1 ${getGrowthColor(weekGrowth)}`}>
                    {formatPercentage(weekGrowth)}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    vs last week
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Today
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {formatNumber(data?.summary.todaySignups || 0)}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                  </div>
                </div>
                <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm">
                  {getGrowthIcon(todayGrowth)}
                  <span className={`ml-1 ${getGrowthColor(todayGrowth)}`}>
                    {formatPercentage(todayGrowth)}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    vs yesterday
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Creator Rate
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {data?.summary.totalSignups
                        ? Math.round(
                            (data.summary.totalCreators /
                              data.summary.totalSignups) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                  </div>
                </div>
                <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm">
                  <span className="text-muted-foreground">
                    {formatNumber(data?.summary.totalCreators || 0)} creators
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base md:text-lg">
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  30-Day Growth Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.growth.slice(-7).map((day) => (
                    <div
                      key={day.date}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{day.signups}</p>
                          <p className="text-xs text-muted-foreground">
                            {day.creators}c / {day.users}u
                          </p>
                        </div>
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                100,
                                (day.signups /
                                  Math.max(
                                    ...(data?.growth.map((d) => d.signups) || [
                                      1,
                                    ])
                                  )) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                <div className="space-y-4">
                  {data?.locationStats.slice(0, 8).map((location, index) => (
                    <div
                      key={location.location}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-sm font-medium truncate">
                          {location.location}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-muted-foreground">
                          {location.count}
                        </span>
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                (location.count /
                                  (data?.locationStats[0]?.count || 1)) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Message Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base md:text-lg">
                  <MessageSquare className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Message Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.messageTypeStats.map((type) => (
                    <div key={type.type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {type.type}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-medium">
                            {type.count}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({Math.round((type.resolved / type.count) * 100)}%
                            resolved)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(type.resolved / type.count) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Response Times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base md:text-lg">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Avg Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.responseTimeStats.map((stat) => (
                    <div
                      key={stat.type}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {stat.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stat.totalMessages} messages
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {Math.round(stat.avgResponseHours)}h
                        </p>
                        <p className="text-xs text-muted-foreground">
                          avg time
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base md:text-lg">
                <Activity className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Peak Activity Hours (This Month)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-2">
                {Array.from({ length: 24 }, (_, hour) => {
                  const activity = data?.activityHours.find(
                    (a) => a.hour === hour
                  );
                  const signups = activity?.signups || 0;
                  const maxSignups = Math.max(
                    ...(data?.activityHours.map((a) => a.signups) || [1])
                  );
                  const intensity = signups / maxSignups;

                  return (
                    <div key={hour} className="text-center">
                      <div
                        className={`w-full h-8 rounded mb-1 transition-all duration-300 ${
                          intensity > 0.7
                            ? "bg-red-500"
                            : intensity > 0.4
                            ? "bg-orange-500"
                            : intensity > 0.2
                            ? "bg-yellow-500"
                            : intensity > 0
                            ? "bg-green-500"
                            : "bg-muted"
                        }`}
                        title={`${hour}:00 - ${signups} signups`}
                        style={{ opacity: Math.max(0.2, intensity) }}
                      ></div>
                      <span className="text-xs text-muted-foreground">
                        {hour.toString().padStart(2, "0")}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-muted rounded"></div>
                  <span>Low</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span>High</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Peak</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return <AnalyticsContent />;
}
