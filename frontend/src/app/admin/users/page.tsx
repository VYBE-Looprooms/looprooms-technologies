"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminSidebar from "@/components/admin-sidebar";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  User,
  Crown,
  Plus,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface AdminInfo {
  id?: string;
  name?: string;
  role?: string;
  email?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  type: 'user' | 'creator' | 'admin';
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminData {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

function AdminUsersContent() {
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adminSidebarCollapsed');
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

  // Users data
  const [users, setUsers] = useState<UserData[]>([]);
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [adminsLoading, setAdminsLoading] = useState(false);

  // Filters and search
  const [activeTab, setActiveTab] = useState<'users' | 'admins'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Create admin modal
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [createAdminForm, setCreateAdminForm] = useState({
    name: '',
    email: '',
    role: 'admin' as 'admin' | 'moderator'
  });
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [createAdminMessage, setCreateAdminMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [tempPassword, setTempPassword] = useState<string>('');
  const [showTempPassword, setShowTempPassword] = useState(false);

  const getContentOffset = () => {
    if (sidebarMobile) {
      return "ml-0";
    }
    return sidebarCollapsed ? "ml-16" : "ml-64";
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

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams({
        limit: '100',
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/admin/users?${params}`,
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
        throw new Error("Failed to fetch users");
      }

      const result = await response.json();
      setUsers(result.data.users);
    } catch (error) {
      console.error("Users fetch error:", error);
    } finally {
      setUsersLoading(false);
    }
  }, [handleLogout, typeFilter, searchTerm]);

  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/admin/admins`,
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
        if (response.status === 403) {
          // Not a super admin, can't view admins
          return;
        }
        throw new Error("Failed to fetch admins");
      }

      const result = await response.json();
      setAdmins(result.data);
    } catch (error) {
      console.error("Admins fetch error:", error);
    } finally {
      setAdminsLoading(false);
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
    setAdminInfo(adminData);
    setLoading(false);

    // Always fetch both users and admins on initial load to get counts
    fetchUsers();
    if (adminData.role === 'super_admin') {
      fetchAdmins();
    }
  }, [router, fetchUsers, fetchAdmins]);

  // Separate effect for tab changes
  useEffect(() => {
    if (loading) return; // Don't fetch if still loading initial data
    
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'admins' && adminInfo?.role === 'super_admin') {
      fetchAdmins();
    }
  }, [activeTab, loading, fetchUsers, fetchAdmins, adminInfo?.role]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateAdminLoading(true);
    setCreateAdminMessage(null);
    setTempPassword('');

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/admin/create-admin`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createAdminForm),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create admin');
      }

      setCreateAdminMessage({ type: 'success', text: 'Admin account created successfully!' });
      setTempPassword(result.data.tempPassword);
      setCreateAdminForm({ name: '', email: '', role: 'admin' });
      
      // Refresh admins list
      fetchAdmins();
    } catch (error) {
      setCreateAdminMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create admin' });
    } finally {
      setCreateAdminLoading(false);
    }
  };

  const toggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/admin/admins/${adminId}/status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to update admin status');
      }

      // Refresh admins list
      fetchAdmins();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update admin status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'moderator':
        return <User className="w-4 h-4 text-green-500" />;
      case 'creator':
        return <User className="w-4 h-4 text-purple-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'moderator':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'creator':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        adminInfo={adminInfo}
        currentPage="users"
        onLogout={handleLogout}
        onSidebarStateChange={handleSidebarStateChange}
      />

      <div className={`${getContentOffset()} min-h-screen flex flex-col transition-all duration-300`}>
        <header className="bg-background border-b border-border px-4 md:px-6 py-4 sticky top-0 z-5">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className={`text-xl md:text-2xl font-bold text-foreground truncate ${sidebarMobile ? "ml-12" : ""}`}>
                User Management
              </h1>
              <p className={`text-sm text-muted-foreground truncate ${sidebarMobile ? "ml-12" : ""}`}>
                Manage users and admin accounts
              </p>
            </div>
            {adminInfo?.role === 'super_admin' && (
              <Button onClick={() => setShowCreateAdmin(true)} className="hidden sm:flex">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Admin
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4 mr-2 inline" />
              Users ({users.length})
            </button>
            {adminInfo?.role === 'super_admin' && (
              <button
                onClick={() => setActiveTab('admins')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'admins'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Shield className="w-4 h-4 mr-2 inline" />
                Admins ({admins.length})
              </button>
            )}
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${activeTab}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                {activeTab === 'users' && (
                  <div className="sm:w-48">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="all">All Types</option>
                      <option value="user">Users</option>
                      <option value="creator">Creators</option>
                    </select>
                  </div>
                )}
                {adminInfo?.role === 'super_admin' && activeTab === 'admins' && (
                  <Button onClick={() => setShowCreateAdmin(true)} className="sm:hidden">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Admin
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle>Platform Users</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                          <th className="hidden sm:table-cell text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                  <span className="text-sm font-medium">
                                    {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-foreground truncate">{user.name || 'No name'}</p>
                                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                  {/* Show join date on mobile as subtitle */}
                                  <p className="text-xs text-muted-foreground sm:hidden">
                                    Joined: {formatDate(user.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {getRoleIcon(user.type)}
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.type)}`}>
                                  {user.type}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.verified 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {user.verified ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td className="hidden sm:table-cell py-3 px-4 text-sm text-muted-foreground">
                              {formatDate(user.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Admins Table */}
          {activeTab === 'admins' && adminInfo?.role === 'super_admin' && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                {adminsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : admins.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No admin accounts found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Admin</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                          <th className="hidden md:table-cell text-left py-3 px-4 font-medium text-muted-foreground">Last Login</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.map((admin) => (
                          <tr key={admin.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
                                  <span className="text-sm font-medium">
                                    {admin.name.charAt(0)}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-foreground truncate">{admin.name}</p>
                                  <p className="text-sm text-muted-foreground truncate">{admin.email}</p>
                                  {/* Show last login on mobile as subtitle */}
                                  <p className="text-xs text-muted-foreground md:hidden">
                                    Last login: {admin.lastLoginAt ? formatDate(admin.lastLoginAt) : 'Never'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {getRoleIcon(admin.role)}
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(admin.role)}`}>
                                  {admin.role.replace('_', ' ')}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                admin.isActive 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {admin.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="hidden md:table-cell py-3 px-4 text-sm text-muted-foreground">
                              {admin.lastLoginAt ? formatDate(admin.lastLoginAt) : 'Never'}
                            </td>
                            <td className="py-3 px-4">
                              {admin.id !== adminInfo?.id && admin.role !== 'super_admin' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleAdminStatus(admin.id, admin.isActive)}
                                  className={`text-xs ${admin.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                                >
                                  {admin.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Create Admin Account</h2>
              
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label htmlFor="adminName" className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <Input
                    id="adminName"
                    type="text"
                    value={createAdminForm.name}
                    onChange={(e) => setCreateAdminForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter admin name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={createAdminForm.email}
                    onChange={(e) => setCreateAdminForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter admin email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="adminRole" className="block text-sm font-medium text-foreground mb-2">
                    Role
                  </label>
                  <select
                    id="adminRole"
                    value={createAdminForm.role}
                    onChange={(e) => setCreateAdminForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'moderator' }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>

                {createAdminMessage && (
                  <div className={`flex items-center p-3 rounded-lg ${
                    createAdminMessage.type === 'success' 
                      ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {createAdminMessage.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2" />
                    )}
                    {createAdminMessage.text}
                  </div>
                )}

                {tempPassword && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                      Temporary Password Created:
                    </p>
                    <div className="flex items-center space-x-2">
                      <Input
                        type={showTempPassword ? "text" : "password"}
                        value={tempPassword}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTempPassword(!showTempPassword)}
                      >
                        {showTempPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                      Share this password securely with the new admin. They should change it on first login.
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateAdmin(false);
                      setCreateAdminForm({ name: '', email: '', role: 'admin' });
                      setCreateAdminMessage(null);
                      setTempPassword('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAdminLoading} className="flex-1">
                    {createAdminLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    {createAdminLoading ? 'Creating...' : 'Create Admin'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsers() {
  return <AdminUsersContent />;
}