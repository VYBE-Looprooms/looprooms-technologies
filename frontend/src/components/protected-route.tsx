"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authState } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireCreator?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireCreator = false,
  redirectTo,
  fallback
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Admin check
        if (requireAdmin) {
          const isAdminLoggedIn = authState.isAdminLoggedIn();
          if (!isAdminLoggedIn) {
            setTimeout(() => router.push(redirectTo || '/admin/login'), 100);
            return;
          }
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // Creator check
        if (requireCreator) {
          const isLoggedIn = authState.isLoggedIn();
          const isCreator = authState.isCreator();
          
          if (!isLoggedIn) {
            setTimeout(() => router.push(redirectTo || '/login'), 100);
            return;
          }
          
          if (!isCreator) {
            setTimeout(() => router.push('/feed'), 100); // Redirect non-creators to feed
            return;
          }
          
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // Regular auth check
        if (requireAuth) {
          const isLoggedIn = authState.isLoggedIn();
          if (!isLoggedIn) {
            setTimeout(() => router.push(redirectTo || '/login'), 100);
            return;
          }
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // No auth required
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setTimeout(() => router.push(redirectTo || '/login'), 100);
      }
    };

    // Add a delay to prevent immediate redirects and allow localStorage to be available
    const timer = setTimeout(checkAuth, 200);
    return () => clearTimeout(timer);
  }, [router, requireAuth, requireAdmin, requireCreator, redirectTo]);

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    );
  }

  if (!isAuthorized) {
    return null; // Router will handle redirect
  }

  return <>{children}</>;
}

// Convenience components for specific use cases
export function UserProtectedRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireAuth'>) {
  return (
    <ProtectedRoute requireAuth={true} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminProtectedRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireAdmin'>) {
  return (
    <ProtectedRoute requireAdmin={true} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function CreatorProtectedRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireCreator'>) {
  return (
    <ProtectedRoute requireCreator={true} {...props}>
      {children}
    </ProtectedRoute>
  );
}