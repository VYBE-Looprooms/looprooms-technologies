"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminSidebar from "@/components/admin-sidebar";
import AdminRouteGuard from "@/components/admin-route-guard";
import {
  MessageSquare,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface AdminInfo {
  name?: string;
  role?: string;
  email?: string;
  lastLoginAt?: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: "general" | "support" | "partnership" | "creator" | "bug";
  status: "new" | "in_progress" | "resolved" | "closed";
  createdAt: string;
}

interface ContactData {
  messages: ContactMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

function ContactsContent() {
  const router = useRouter();
  const [data, setData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
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

  const fetchContacts = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        sortBy,
        sortOrder,
      });

      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("type", typeFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/contacts?${params}`,
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
        throw new Error("Failed to fetch contacts");
      }

      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error("Contacts fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, typeFilter, sortBy, sortOrder, handleLogout]);

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem("adminToken");
    const admin = localStorage.getItem("adminInfo");

    if (!token || !admin) {
      router.push("/admin/login");
      return;
    }

    setAdminInfo(JSON.parse(admin));
    fetchContacts();
  }, [router, fetchContacts]);

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
      });

      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("type", typeFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/export/contacts?${params}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            search,
            status: statusFilter,
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
      a.download = `contacts-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Please try again.");
    }
  };

  const updateMessageStatus = async (messageId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/contacts/${messageId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Refresh the data
      fetchContacts();
    } catch (error) {
      console.error("Status update error:", error);
      alert("Failed to update status. Please try again.");
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "closed":
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "general":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "support":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "partnership":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "creator":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "bug":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchContacts();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Sidebar */}
      <AdminSidebar
        adminInfo={adminInfo}
        currentPage="contacts"
        onLogout={handleLogout}
        onSidebarStateChange={handleSidebarStateChange}
      />

      {/* Main Content - responsive offset */}
      <div className={`${getContentOffset()} min-h-screen flex flex-col transition-all duration-300`}>
        {/* Page Header - Fixed */}
        <header className="bg-background border-b border-border px-4 md:px-6 py-4 sticky top-0 z-5">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className={`text-xl md:text-2xl font-bold text-foreground truncate ${
                sidebarMobile ? 'ml-12' : ''
              }`}>
                Contact Messages
              </h1>
              <p className={`text-sm text-muted-foreground truncate ${
                sidebarMobile ? 'ml-12' : ''
              }`}>
                Manage and respond to contact form submissions
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

        {/* Contacts Content - Scrollable */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">Total Messages</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">{data?.pagination.total || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">New Messages</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {data?.messages.filter(msg => msg.status === 'new').length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {data?.messages.filter(msg => msg.status === 'in_progress').length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                  </div>
                  <div className="ml-3 md:ml-4 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">Resolved</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {data?.messages.filter(msg => msg.status === 'resolved').length || 0}
                    </p>
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
                    placeholder="Search by name, email, or subject..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="">All Status</option>
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="">All Types</option>
                    <option value="general">General</option>
                    <option value="support">Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="creator">Creator</option>
                    <option value="bug">Bug Report</option>
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

          {/* Messages Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Contact Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 md:p-4">
                        <button
                          onClick={() => handleSort("name")}
                          className="font-medium text-foreground hover:text-primary text-sm md:text-base"
                        >
                          Name {sortBy === "name" && (sortOrder === "ASC" ? "↑" : "↓")}
                        </button>
                      </th>
                      <th className="text-left p-2 md:p-4 hidden sm:table-cell">
                        <button
                          onClick={() => handleSort("email")}
                          className="font-medium text-foreground hover:text-primary text-sm md:text-base"
                        >
                          Email {sortBy === "email" && (sortOrder === "ASC" ? "↑" : "↓")}
                        </button>
                      </th>
                      <th className="text-left p-2 md:p-4">
                        <button
                          onClick={() => handleSort("subject")}
                          className="font-medium text-foreground hover:text-primary text-sm md:text-base"
                        >
                          Subject {sortBy === "subject" && (sortOrder === "ASC" ? "↑" : "↓")}
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
                      <th className="text-left p-2 md:p-4">
                        <button
                          onClick={() => handleSort("status")}
                          className="font-medium text-foreground hover:text-primary text-sm md:text-base"
                        >
                          Status {sortBy === "status" && (sortOrder === "ASC" ? "↑" : "↓")}
                        </button>
                      </th>
                      <th className="text-left p-2 md:p-4">
                        <button
                          onClick={() => handleSort("createdAt")}
                          className="font-medium text-foreground hover:text-primary text-sm md:text-base"
                        >
                          Date {sortBy === "createdAt" && (sortOrder === "ASC" ? "↑" : "↓")}
                        </button>
                      </th>
                      <th className="text-left p-2 md:p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.messages.map((message) => (
                      <tr key={message.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-2 md:p-4">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate text-sm md:text-base">
                              {message.name}
                            </p>
                            <p className="text-xs text-muted-foreground sm:hidden truncate">{message.email}</p>
                          </div>
                        </td>
                        <td className="p-2 md:p-4 hidden sm:table-cell">
                          <p className="text-muted-foreground truncate text-sm md:text-base">{message.email}</p>
                        </td>
                        <td className="p-2 md:p-4">
                          <p className="text-foreground truncate text-sm md:text-base">{message.subject}</p>
                        </td>
                        <td className="p-2 md:p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(message.type)}`}>
                            {message.type}
                          </span>
                        </td>
                        <td className="p-2 md:p-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(message.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                              {message.status.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 md:p-4">
                          <p className="text-muted-foreground text-sm md:text-base">{formatDate(message.createdAt)}</p>
                        </td>
                        <td className="p-2 md:p-4">
                          <select
                            value={message.status}
                            onChange={(e) => updateMessageStatus(message.id, e.target.value)}
                            className="px-2 py-1 border border-border rounded text-xs bg-background"
                          >
                            <option value="new">New</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
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

export default function AdminContactsPage() {
  return (
    <AdminRouteGuard allowedRoles={['admin', 'super_admin']} redirectTo="/admin/marketing">
      <ContactsContent />
    </AdminRouteGuard>
  );
}