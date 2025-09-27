"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Compass,
  Activity,
  Link2,
  Bookmark,
  User,
  Settings,
  TrendingUp,
  Users,
  Heart,
  Brain,
  Dumbbell,
  Coffee,
  Sparkles,
  BarChart3,
  HelpCircle,
  LogOut,
} from "lucide-react";

interface ModernSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { icon: Home, label: "Home", href: "/feed", active: true, count: null },
  { icon: Compass, label: "Explore", href: "/explore", active: false, count: null },
  { icon: Activity, label: "Looprooms", href: "/looprooms", active: false, count: "12" },
  { icon: Link2, label: "Loopchains", href: "/loopchains", active: false, count: null },
  { icon: TrendingUp, label: "Trending", href: "/trending", active: false, count: null },
  { icon: Bookmark, label: "Saved", href: "/saved", active: false, count: "5" },
  { icon: Users, label: "Following", href: "/following", active: false, count: null },
  { icon: User, label: "Profile", href: "/profile", active: false, count: null },
];

const quickAccessRooms = [
  { icon: Heart, label: "Recovery", color: "text-green-600", bgColor: "bg-green-500/20", participants: 27 },
  { icon: Brain, label: "Meditation", color: "text-blue-600", bgColor: "bg-blue-500/20", participants: 45 },
  { icon: Dumbbell, label: "Fitness", color: "text-red-600", bgColor: "bg-red-500/20", participants: 38 },
  { icon: Coffee, label: "Healthy Living", color: "text-orange-600", bgColor: "bg-orange-500/20", participants: 22 },
  { icon: Sparkles, label: "Wellness", color: "text-primary", bgColor: "bg-primary/20", participants: 31 },
];

const bottomItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Help & Support", href: "/help" },
  { icon: LogOut, label: "Log Out", href: "/logout" },
];

export default function ModernSidebar({ isOpen, onClose }: ModernSidebarProps) {
  return (
    <>
      {/* Mobile Overlay - Only show on mobile when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border z-50 transform transition-all duration-300 ease-in-out overflow-y-auto
        ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}
      `}>
        <div className={`p-6 space-y-6 ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0'} transition-opacity duration-300`}>
          {/* User Profile Section */}
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sidebar-foreground">Welcome back!</h3>
              <p className="text-sm text-sidebar-foreground/70">Ready for your wellness journey?</p>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1">
            <h4 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3">
              Navigation
            </h4>
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant={item.active ? "default" : "ghost"}
                className={`w-full justify-start h-11 px-3 ${
                  item.active 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" 
                    : "hover:bg-sidebar-accent text-sidebar-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count && (
                  <Badge 
                    variant={item.active ? "secondary" : "outline"} 
                    className={`ml-auto text-xs ${
                      item.active ? "bg-white/20 text-white border-white/30" : ""
                    }`}
                  >
                    {item.count}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          {/* Quick Access to AI Rooms */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              Quick Access
            </h4>
            <div className="space-y-2">
              {quickAccessRooms.map((room) => (
                <Button
                  key={room.label}
                  variant="ghost"
                  className="w-full justify-start h-10 px-3 hover:bg-sidebar-accent"
                >
                  <div className={`w-8 h-8 ${room.bgColor} rounded-lg flex items-center justify-center mr-3`}>
                    <room.icon className={`w-4 h-4 ${room.color}`} />
                  </div>
                  <span className="flex-1 text-left text-sm font-medium text-sidebar-foreground">
                    {room.label}
                  </span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-sidebar-foreground/60">{room.participants}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 rounded-xl border border-green-500/20">
            <h4 className="font-semibold text-sidebar-foreground mb-3 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-green-600" />
              Your Progress
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-sidebar-foreground/70">Sessions this week</span>
                <span className="font-semibold text-green-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-sidebar-foreground/70">Loopchains completed</span>
                <span className="font-semibold text-green-600">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-sidebar-foreground/70">Streak</span>
                <span className="font-semibold text-green-600">7 days 🔥</span>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="pt-4 border-t border-sidebar-border space-y-1">
            {bottomItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start h-10 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent"
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}