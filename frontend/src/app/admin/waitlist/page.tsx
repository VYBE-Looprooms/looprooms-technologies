"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminSidebar from "@/components/admin-sidebar";
import MarketingSidebar from "@/components/marketing-sidebar";
import {
  Users,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Mail,
  Trash2,
} from "lucide-react";

interface AdminInfo {
  name?: string;
  role?: string;
  email?: string;
  lastLoginAt?: string;
}

interface WaitlistEntry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  type: "user" | "creator";
  location: string;
  primaryInterest: string;
  interests: string[];
  createdAt: string;
}

interface WaitlistData {
  waitlist: WaitlistEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

function WaitlistContent() {
  const router = useRouter();
  const [data, setData] = useState<WaitlistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");
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
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Get content offset based on sidebar state
  const getContentOffset = () => {
    if (sidebarMobile) {
      return 'ml-0';
    }
    return sidebarCollapsed ? 'ml-16' : 'ml-64';
  };

  const handleSidebarStateChange = (isCollapsed: boolean, isMobile: boolean) => {
    setSidebarCollapsed(isCollapsed);
    setSidebarMobile(isMobile);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    router.push("/admin/login");
  }, [router]);

  const fetchWaitlist = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        sortBy,
        sortOrder,
      });

      if (search) params.append("search", search);
      if (typeFilter) params.append("type", typeFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/waitlist?${params}`,
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
        throw new Error("Failed to fetch waitlist");
      }

      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error("Waitlist fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, typeFilter, sortBy, sortOrder, handleLogout]);

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem("adminToken");
    const admin = localStorage.getItem("adminInfo");

    if (!token || !admin) {
      router.push("/admin/login");
      return;
    }

    setAdminInfo(JSON.parse(admin));
    fetchWaitlist();
  }, [router, fetchWaitlist]);

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
      });

      if (search) params.append("search", search);
      if (typeFilter) params.append("type", typeFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/export/waitlist?${params}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            search,
            type: typeFilter,
            sortBy,
            sortOrder,
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
      a.download = `waitlist-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Please try again.");
    }
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchWaitlist();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("DESC");
    }
    setCurrentPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name} from the waitlist? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/waitlist/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete waitlist entry");
      }

      // Refresh the data
      fetchWaitlist();
      alert("Waitlist entry deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete waitlist entry. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading waitlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Sidebar - Role-based */}
      {adminInfo?.role === 'marketing' ? (
        <MarketingSidebar
          adminInfo={adminInfo}
          currentPage="waitlist"
          onLogout={handleLogout}
          onSidebarStateChange={handleSidebarStateChange}
        />
      ) : (
        <AdminSidebar
          adminInfo={adminInfo}
          currentPage="waitlist"
          onLogout={handleLogout}
          onSidebarStateChange={handleSidebarStateChange}
        />
      )}

      {/* Main Content - responsive offset */}
      <div className={`${getContentOffset()} min-h-screen flex flex-col transition-all duration-300`}>
        {/* Page Header - Fixed */}
        <header className="bg-background border-b border-border px-4 md:px-6 py-4 sticky top-0 z-5">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className={`text-xl md:text-2xl font-bold text-foreground truncate ${
                sidebarMobile ? 'ml-12' : ''
              }`}>
                Waitlist Management
              </h1>
              <p className={`text-sm text-muted-foreground truncate ${
                sidebarMobile ? 'ml-12' : ''
              }`}>
                Manage and export waitlist signups
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <Button onClick={handleExport} size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </header>

        {/* Waitlist Content - Scrollable */}
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
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">Total Signups</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">{data?.pagination.total || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">Creators</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {data?.waitlist.filter(entry => entry.type === 'creator').length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">Regular Users</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {data?.waitlist.filter(entry => entry.type === 'user').length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">Current Page</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">{currentPage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6 md:mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="">All Types</option>
                    <option value="user">Users</option>
                    <option value="creator">Creators</option>
                  </select>
                  <Button type="submit" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                  <Button onClick={handleExport} variant="outline" size="sm" className="sm:hidden">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Waitlist Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Waitlist Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 md:p-4">
                        <button
                          onClick={() => handleSort("firstName")}
                          className="font-medium text-foreground hover:text-primary text-sm md:text-base"
                        >
                          Name {sortBy === "firstName" && (sortOrder === "ASC" ? "↑" : "↓")}
                        </button>
                      </th>
                      <th className="text-left p-2 md:p-4">
                        <button
                          onClick={() => handleSort("email")}
                          className="font-medium text-foreground hover:text-primary text-sm md:text-base"
                        >
                          Email {sortBy === "email" && (sortOrder === "ASC" ? "↑" : "↓")}
                        </button>
                      </th>
                      <th className="text-left p-2 md:p-4">
                        <button
                          onClick={() => handleSort("type")}
                          className="font-medium text-foreground hover:text-primary text-sm md:text-base"
                        >
                          Type {sortBy === "type" && (sortOrder === "ASC" ? "↑" : "↓")}
                        </button>
                      </th>
                      <th className="text-left p-2 md:p-4 hidden sm:table-cell">
                        <button
                          onClick={() => handleSort("location")}
                          className="font-medium text-foreground hover:text-primary text-sm md:text-base"
                        >
                          Location {sortBy === "location" && (sortOrder === "ASC" ? "↑" : "↓")}
                        </button>
                      </th>
                      <th className="text-left p-2 md:p-4 hidden lg:table-cell">
                        <button
                          onClick={() => handleSort("primaryInterest")}
                          className="font-medium text-foreground hover:text-primary text-sm md:text-base"
                        >
                          Interest {sortBy === "primaryInterest" && (sortOrder === "ASC" ? "↑" : "↓")}
                        </button>
                      </th>
                      <th className="hidden md:table-cell text-left p-2 md:p-4">
                        <button
                          onClick={() => handleSort("createdAt")}
                          className="font-medium text-foreground hover:text-primary text-sm md:text-base"
                        >
                          Date {sortBy === "createdAt" && (sortOrder === "ASC" ? "↑" : "↓")}
                        </button>
                      </th>
                      <th className="text-left p-2 md:p-4">
                        <span className="font-medium text-foreground text-sm md:text-base">
                          Actions
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.waitlist.map((entry) => (
                      <tr key={entry.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-2 md:p-4">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate text-sm md:text-base">
                              {entry.firstName} {entry.lastName}
                            </p>
                            {/* Show location, interest and date on mobile */}
                            <div className="md:hidden mt-1 space-y-1">
                              {entry.location && (
                                <p className="text-xs text-muted-foreground truncate">
                                  📍 {entry.location}
                                </p>
                              )}
                              {entry.primaryInterest && (
                                <p className="text-xs text-green-600 truncate">
                                  🎯 {entry.primaryInterest}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {formatDate(entry.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 md:p-4">
                          <p className="text-muted-foreground truncate text-sm md:text-base">{entry.email}</p>
                        </td>
                        <td className="p-2 md:p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              entry.type === "creator"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            }`}
                          >
                            {entry.type}
                          </span>
                        </td>
                        <td className="p-2 md:p-4 hidden sm:table-cell">
                          <p className="text-muted-foreground truncate text-sm md:text-base">{entry.location}</p>
                        </td>
                        <td className="p-2 md:p-4 hidden lg:table-cell">
                          {entry.primaryInterest ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {entry.primaryInterest}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </td>
                        <td className="hidden md:table-cell p-2 md:p-4">
                          <p className="text-muted-foreground text-sm md:text-base">{formatDate(entry.createdAt)}</p>
                        </td>
                        <td className="p-2 md:p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(entry.id, `${entry.firstName} ${entry.lastName}`)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline ml-1">Delete</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data?.pagination && data.pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total)
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(data.pagination.pages, currentPage + 1))}
                      disabled={currentPage === data.pagination.pages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default function AdminWaitlistPage() {
  return <WaitlistContent />;
}