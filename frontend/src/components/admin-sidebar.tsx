"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Shield,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AdminInfo {
  name?: string;
  role?: string;
  email?: string;
}

interface AdminSidebarProps {
  adminInfo: AdminInfo | null;
  currentPage: string;
  onLogout: () => void;
  onSidebarStateChange?: (isCollapsed: boolean, isMobile: boolean) => void;
}

export default function AdminSidebar({
  adminInfo,
  currentPage,
  onLogout,
  onSidebarStateChange,
}: AdminSidebarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize collapsed state from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adminSidebarCollapsed");
      return saved === "true";
    }
    return false;
  });
  const [isMobile, setIsMobile] = useState(() => {
    // Initialize mobile state immediately to prevent flash
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
        setIsCollapsed(false);
      }
      if (!isInitialized) {
        setIsInitialized(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isInitialized]);

  // Save collapsed state to localStorage
  useEffect(() => {
    if (isInitialized && !isMobile) {
      localStorage.setItem("adminSidebarCollapsed", isCollapsed.toString());
    }
  }, [isCollapsed, isMobile, isInitialized]);

  // Notify parent of state changes
  useEffect(() => {
    if (isInitialized) {
      onSidebarStateChange?.(isCollapsed, isMobile);
    }
  }, [isCollapsed, isMobile, onSidebarStateChange, isInitialized]);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/admin/dashboard",
      active: currentPage === "dashboard",
    },
    {
      icon: Users,
      label: "Waitlist",
      path: "/admin/waitlist",
      active: currentPage === "waitlist",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      path: "/admin/contacts",
      active: currentPage === "contacts",
    },
    {
      icon: Shield,
      label: "Users",
      path: "/admin/users",
      active: currentPage === "users",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      path: "/admin/analytics",
      active: currentPage === "analytics",
    },
    {
      icon: FileText,
      label: "Reports",
      path: "/admin/reports",
      active: currentPage === "reports",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/admin/settings",
      active: currentPage === "settings",
    },
  ];

  const handleMenuClick = (path: string) => {
    router.push(path);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <>
      {/* Mobile Menu Button - Hidden when sidebar is open */}
      {isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isCollapsed && !isMobile ? "w-16" : "w-64"} 
          bg-card border-r border-border h-screen flex flex-col fixed left-0 top-0 z-40 
          transition-all duration-300 ease-in-out
          ${
            isMobile
              ? isOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          }
        `}
      >
        {/* Logo/Brand with Toggle */}
        <div className="border-b border-border flex-shrink-0 p-4 flex items-center justify-between">
          {/* Show logo when expanded, hide when collapsed */}
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1 ml-3">
                <h2 className="text-lg font-bold text-foreground truncate">
                  Vybe Admin
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  Management Panel
                </p>
              </div>
            </div>
          )}

          {/* Desktop Toggle Button - Centered when collapsed */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className={`p-1.5 rounded-md hover:bg-muted transition-colors ${
                isCollapsed ? "mx-auto" : "flex-shrink-0 ml-2"
              }`}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleMenuClick(item.path)}
                  className={`w-full flex items-center rounded-lg transition-colors group relative overflow-hidden ${
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  } ${
                    isCollapsed && !isMobile
                      ? "justify-center p-3"
                      : "px-3 py-2.5"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {(!isCollapsed || isMobile) && (
                    <span className="font-medium truncate ml-3 min-w-0">
                      {item.label}
                    </span>
                  )}

                  {/* Tooltip for collapsed desktop mode */}
                  {isCollapsed && !isMobile && (
                    <div className="fixed left-20 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border">
                      {item.label}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-border flex-shrink-0 p-3">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center mb-3 min-w-0">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-foreground">
                  {adminInfo?.name?.charAt(0) || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0 ml-3">
                <p className="text-sm font-medium text-foreground truncate">
                  {adminInfo?.name || "Admin"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {adminInfo?.role || "Administrator"}
                </p>
              </div>
            </div>
          )}

          {/* Collapsed mode - centered elements */}
          {isCollapsed && !isMobile && (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center group relative">
                <span className="text-sm font-medium text-foreground">
                  {adminInfo?.name?.charAt(0) || "A"}
                </span>
                {/* Tooltip for collapsed mode */}
                <div className="fixed left-20 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border">
                  {adminInfo?.name || "Admin"}
                </div>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className={`${
              isCollapsed && !isMobile
                ? "w-10 h-10 p-0 flex items-center justify-center mt-3"
                : "w-full"
            } group relative overflow-hidden`}
            title={isCollapsed && !isMobile ? "Logout" : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="ml-2 truncate">Logout</span>
            )}

            {/* Tooltip for collapsed desktop mode */}
            {isCollapsed && !isMobile && (
              <div className="fixed left-20 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border">
                Logout
              </div>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

// Hook to get content offset based on sidebar state
export function useContentOffset(isCollapsed: boolean, isMobile: boolean) {
  if (isMobile) {
    return "ml-0";
  }
  return isCollapsed ? "ml-16" : "ml-64";
}
