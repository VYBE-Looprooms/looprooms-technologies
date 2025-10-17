"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import LogoutButton from "@/components/logout-button";
import { authState } from "@/lib/auth";
import {
  Search,
  Bell,
  Plus,
  Home,
  User,
  Menu,
  X,
  Sparkles,
  MessageCircle,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  type: "user" | "creator";
  verified: boolean;
}

interface ModernNavProps {
  onCreatePost: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function ModernNav({ onCreatePost, onToggleSidebar, sidebarOpen }: ModernNavProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = authState.getUser();
    setUser(currentUser);
  }, []);

  return (
    <nav className="bg-background/95 border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-r from-primary via-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Vybe
              </h1>
            </div>
          </div>

          {/* Center Search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className={`relative w-full transition-all duration-200 ${searchFocused ? 'scale-105' : ''}`}>
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search posts, creators, looprooms..."
                className={`pl-12 pr-4 py-3 bg-muted border-0 rounded-full text-sm transition-all duration-200 ${
                  searchFocused 
                    ? 'bg-background shadow-lg ring-2 ring-primary/20' 
                    : 'hover:bg-muted/80 focus:bg-background focus:shadow-lg focus:ring-2 focus:ring-primary/20'
                }`}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Quick Actions */}
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="relative hover:bg-muted rounded-full p-2">
                <Home className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="sm" className="relative hover:bg-muted rounded-full p-2">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                  3
                </Badge>
              </Button>
              <Button variant="ghost" size="sm" className="relative hover:bg-muted rounded-full p-2">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </Button>
            </div>

            {/* Create Button */}
            <Button 
              onClick={onCreatePost}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create</span>
            </Button>

            {/* Profile & Logout */}
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {user?.name || 'User'}
                </span>
                {user?.type === 'creator' && (
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Creator
                  </Badge>
                )}
              </div>
              
              <div className="relative">
                <Button variant="ghost" className="p-1 rounded-full hover:bg-muted">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </Button>
              </div>
              
              <LogoutButton variant="ghost" size="sm" className="hidden sm:flex" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-muted border-0 rounded-full"
          />
        </div>
      </div>
    </nav>
  );
}