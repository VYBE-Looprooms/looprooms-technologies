"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AdminSidebar from "@/components/admin-sidebar";
import AdminRouteGuard from "@/components/admin-route-guard";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Lightbulb,
  Award,
  Mail,
  MapPin,
  Calendar,
  User,
} from "lucide-react";

interface AdminInfo {
  name?: string;
  role?: string;
  email?: string;
  lastLoginAt?: string;
}

interface Suggestion {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  looproomName: string;
  purpose: string;
  status: "new" | "reviewing" | "approved" | "rejected" | "implemented";
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface SuggestionStats {
  total: number;
  new: number;
  reviewing: number;
  approved: number;
  rejected: number;
  implemented: number;
  today: number;
  thisWeek: number;
}

function SuggestionsContent() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [stats, setStats] = useState<SuggestionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<Suggestion | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
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

  const fetchSuggestions = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        handleLogout();
        return;
      }

      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);

      console.log("Fetching suggestions from:", `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/suggestions?${params}`);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/suggestions?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Suggestions response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized, logging out");
          handleLogout();
          return;
        }
        const errorText = await response.text();
        console.error("Suggestions fetch error response:", errorText);
        throw new Error(`Failed to fetch suggestions: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Suggestions result:", result);
      
      if (result.success) {
        setSuggestions(result.data.suggestions);
      } else {
        console.error("Suggestions fetch failed:", result);
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, handleLogout]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        handleLogout();
        return;
      }

      console.log("Fetching stats from:", `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/suggestions/stats`);
      
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/suggestions/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Stats response status:", response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized, logging out");
          handleLogout();
          return;
        }
        const errorText = await response.text();
        console.error("Stats fetch error response:", errorText);
        throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Stats result:", result);
      
      if (result.success) {
        setStats(result.data);
      } else {
        console.error("Stats fetch failed:", result);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      // Set default stats to prevent UI issues
      setStats({
        total: 0,
        new: 0,
        reviewing: 0,
        approved: 0,
        rejected: 0,
        implemented: 0,
        today: 0,
        thisWeek: 0,
      });
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
    fetchSuggestions();
    fetchStats();
  }, [router, fetchSuggestions, fetchStats]);

  const updateSuggestionStatus = async (
    id: string,
    status: string,
    adminNotes?: string
  ) => {
    setUpdatingStatus(id);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/suggestions/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, adminNotes }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuggestions((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, status: status as Suggestion["status"], adminNotes }
              : s
          )
        );
        setSelectedSuggestion(null);
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: "bg-blue-500", text: "New", icon: Clock },
      reviewing: { color: "bg-yellow-500", text: "Reviewing", icon: Eye },
      approved: { color: "bg-green-500", text: "Approved", icon: CheckCircle },
      rejected: { color: "bg-red-500", text: "Rejected", icon: XCircle },
      implemented: { color: "bg-purple-500", text: "Implemented", icon: Award },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Sidebar */}
      <AdminSidebar
        adminInfo={adminInfo}
        currentPage="suggestions"
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
                Looproom Suggestions
              </h1>
              <p
                className={`text-sm text-muted-foreground truncate ${
                  sidebarMobile ? "ml-12" : ""
                }`}
              >
                Manage and review community Looproom suggestions
              </p>
            </div>
          </div>
        </header>

        {/* Dashboard Content - Scrollable */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6 md:mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {stats.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {stats.new}
                  </div>
                  <div className="text-sm text-muted-foreground">New</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {stats.reviewing}
                  </div>
                  <div className="text-sm text-muted-foreground">Reviewing</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {stats.approved}
                  </div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {stats.rejected}
                  </div>
                  <div className="text-sm text-muted-foreground">Rejected</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    {stats.implemented}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Implemented
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats.today}
                  </div>
                  <div className="text-sm text-muted-foreground">Today</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent">
                    {stats.thisWeek}
                  </div>
                  <div className="text-sm text-muted-foreground">This Week</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by name, email, or Looproom name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="implemented">Implemented</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions List */}
          <div className="grid gap-6">
            {suggestions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No suggestions found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "No Looproom suggestions have been submitted yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              suggestions.map((suggestion) => (
                <Card
                  key={suggestion.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-center space-x-2">
                          <Lightbulb className="w-5 h-5 text-primary" />
                          <span>{suggestion.looproomName}</span>
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>
                              {suggestion.firstName} {suggestion.lastName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{suggestion.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{suggestion.country}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(suggestion.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(suggestion.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-semibold text-foreground mb-2">
                        Purpose & Benefits:
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {suggestion.purpose.length > 200
                          ? `${suggestion.purpose.substring(0, 200)}...`
                          : suggestion.purpose}
                      </p>
                    </div>

                    {suggestion.adminNotes && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <h4 className="font-semibold text-foreground mb-1">
                          Admin Notes:
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.adminNotes}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSuggestion(suggestion)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>

                      {suggestion.status === "new" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateSuggestionStatus(suggestion.id, "reviewing")
                            }
                            disabled={updatingStatus === suggestion.id}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Mark Reviewing
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateSuggestionStatus(suggestion.id, "approved")
                            }
                            disabled={updatingStatus === suggestion.id}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateSuggestionStatus(suggestion.id, "rejected")
                            }
                            disabled={updatingStatus === suggestion.id}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {suggestion.status === "reviewing" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateSuggestionStatus(suggestion.id, "approved")
                            }
                            disabled={updatingStatus === suggestion.id}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateSuggestionStatus(suggestion.id, "rejected")
                            }
                            disabled={updatingStatus === suggestion.id}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {suggestion.status === "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateSuggestionStatus(suggestion.id, "implemented")
                          }
                          disabled={updatingStatus === suggestion.id}
                          className="text-purple-600 border-purple-600 hover:bg-purple-50"
                        >
                          <Award className="w-4 h-4 mr-1" />
                          Mark Implemented
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Suggestion Detail Modal */}
          {selectedSuggestion && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      <span>{selectedSuggestion.looproomName}</span>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSuggestion(null)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Suggester
                      </h4>
                      <p className="text-muted-foreground">
                        {selectedSuggestion.firstName}{" "}
                        {selectedSuggestion.lastName}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Email
                      </h4>
                      <p className="text-muted-foreground">
                        {selectedSuggestion.email}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Country
                      </h4>
                      <p className="text-muted-foreground">
                        {selectedSuggestion.country}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Status
                      </h4>
                      {getStatusBadge(selectedSuggestion.status)}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Purpose & Benefits
                    </h4>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedSuggestion.purpose}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Submitted
                      </h4>
                      <p className="text-muted-foreground">
                        {formatDate(selectedSuggestion.createdAt)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Last Updated
                      </h4>
                      <p className="text-muted-foreground">
                        {formatDate(selectedSuggestion.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {selectedSuggestion.adminNotes && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        Admin Notes
                      </h4>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {selectedSuggestion.adminNotes}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedSuggestion(null)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() =>
                        window.open(
                          `mailto:${selectedSuggestion.email}?subject=Re: Looproom Suggestion - ${selectedSuggestion.looproomName}`
                        )
                      }
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email Suggester
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SuggestionsAdminPage() {
  return (
    <AdminRouteGuard allowedRoles={['admin', 'super_admin']} redirectTo="/admin/marketing">
      <SuggestionsContent />
    </AdminRouteGuard>
  );
}
