"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  UserCheck,
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
  onSidebarStateChange: (isCollapsed: boolean, isMobile: boolean) => void;
}

export default function AdminSidebar({
  adminInfo,
  onLogout,
  onSidebarStateChange,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adminSidebarCollapsed');
      return saved === 'true';
    }
    return false;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsMobileOpen(false);
      }
      onSidebarStateChange(isCollapsed, mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isCollapsed, onSidebarStateChange]);

  // Save collapsed state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminSidebarCollapsed', isCollapsed.toString());
    }
  }, [isCollapsed]);

  const menuItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      id: "dashboard",
    },
    {
      href: "/admin/creator-verification",
      label: "Creator Review",
      icon: UserCheck,
      id: "creator-verification",
    },
    {
      href: "/admin/waitlist",
      label: "Waitlist",
      icon: Users,
      id: "waitlist",
    },
    {
      href: "/admin/contacts",
      label: "Messages",
      icon: MessageSquare,
      id: "contacts",
    },
    {
      href: "/admin/suggestions",
      label: "Suggestions",
      icon: Lightbulb,
      id: "suggestions",
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Shield,
      id: "users",
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
      id: "analytics",
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      id: "settings",
    },
  ];

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleCollapsed = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className={`p-4 border-b border-border ${isCollapsed && !isMobile ? 'px-2' : ''}`}>
        <div className="flex items-center justify-between">
          {(!isCollapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-foreground truncate">
                Vybe Admin
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                {adminInfo?.name}
              </p>
            </div>
          )}
          
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              className={`h-8 w-8 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobile}
              className="h-8 w-8 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.id === "dashboard" && pathname === "/admin/dashboard");
          
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => isMobile && setIsMobileOpen(false)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              } ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
            >
              <item.icon className={`h-4 w-4 flex-shrink-0 ${(!isCollapsed || isMobile) ? 'mr-3' : ''}`} />
              {(!isCollapsed || isMobile) && (
                <span className="truncate">{item.label}</span>
              )}
              
              {/* Tooltip for collapsed desktop mode */}
              {isCollapsed && !isMobile && (
                <div className="fixed left-20 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className={`p-2 border-t border-border ${isCollapsed && !isMobile ? 'px-1' : ''}`}>
        {(!isCollapsed || isMobile) && adminInfo && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium text-foreground truncate">
              {adminInfo.email}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {adminInfo.role?.replace('_', ' ')}
            </p>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onLogout();
            if (isMobile) setIsMobileOpen(false);
          }}
          className={`w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 group relative ${
            isCollapsed && !isMobile ? 'px-2' : ''
          }`}
        >
          <LogOut className={`h-4 w-4 ${(!isCollapsed || isMobile) ? 'mr-2' : ''}`} />
          {(!isCollapsed || isMobile) && "Logout"}
          
          {/* Tooltip for collapsed desktop mode */}
          {isCollapsed && !isMobile && (
            <div className="fixed left-20 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border">
              Logout
            </div>
          )}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button - Only show when sidebar is closed */}
      {isMobile && !isMobileOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobile}
          className="fixed top-4 left-4 z-50 h-10 w-10 bg-background border border-border shadow-md"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full bg-background border-r border-border flex flex-col transition-all duration-300 ${
          isMobile
            ? `w-64 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`
            : isCollapsed
            ? 'w-16'
            : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}


