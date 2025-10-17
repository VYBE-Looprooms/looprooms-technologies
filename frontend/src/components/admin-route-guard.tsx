"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminRouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function AdminRouteGuard({ 
  children, 
  allowedRoles = ['admin', 'super_admin'], 
  redirectTo 
}: AdminRouteGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("adminToken");
      const adminInfo = localStorage.getItem("adminInfo");

      if (!token || !adminInfo) {
        setTimeout(() => router.push("/admin/login"), 100);
        return;
      }

      try {
        const admin = JSON.parse(adminInfo);
        
        if (!allowedRoles.includes(admin.role)) {
          // Redirect based on role
          if (admin.role === 'marketing') {
            setTimeout(() => router.push(redirectTo || "/admin/marketing"), 100);
          } else {
            setTimeout(() => router.push("/admin/dashboard"), 100);
          }
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Error parsing admin info:", error);
        setTimeout(() => router.push("/admin/login"), 100);
      } finally {
        setIsLoading(false);
      }
    };

    // Add delay to allow localStorage to be available
    const timer = setTimeout(checkAuth, 200);
    return () => clearTimeout(timer);
  }, [router, allowedRoles, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}