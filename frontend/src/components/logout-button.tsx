"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { auth } from '@/lib/auth';

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
  children?: React.ReactNode;
  className?: string;
  isAdmin?: boolean;
}

export default function LogoutButton({
  variant = 'ghost',
  size = 'default',
  showIcon = true,
  children,
  className,
  isAdmin = false
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      if (isAdmin) {
        await auth.adminLogout();
        router.push('/admin/login');
      } else {
        await auth.logout();
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if API call fails
      if (isAdmin) {
        router.push('/admin/login');
      } else {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
      ) : (
        showIcon && <LogOut className="h-4 w-4 mr-2" />
      )}
      {children || (isLoading ? 'Signing out...' : 'Sign Out')}
    </Button>
  );
}