import { useState, useEffect, useCallback } from 'react';
import { 
  login as authLogin, 
  signup as authSignup, 
  logout as authLogout,
  getCurrentUser,
  getUserInfo,
  isAuthenticated,
  forgotPassword as authForgotPassword,
  resetPassword as authResetPassword,
  verifyEmail as authVerifyEmail,
  updateProfile as authUpdateProfile
} from '@/lib/auth';

import type { User, SignupData, ProfileData, ApiResponse } from '@/types/auth';

// Re-export User type for convenience
export type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isCreator: boolean;
  isVerified: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<ApiResponse>;
  signup: (userData: SignupData) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<ApiResponse>;
  resetPassword: (token: string, password: string) => Promise<ApiResponse>;
  verifyEmail: (token: string) => Promise<ApiResponse>;
  updateProfile: (profileData: ProfileData) => Promise<ApiResponse>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isAuthenticated()) {
          const userInfo = getUserInfo();
          if (userInfo) {
            setUser(userInfo);
          } else {
            // Try to fetch current user from server
            const response = await getCurrentUser();
            if (response.success) {
              setUser(response.data.user);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError(error instanceof Error ? error.message : 'Authentication error');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authLogin(email, password);
      if (response.success) {
        setUser(response.data.user);
        return response;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (userData: SignupData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authSignup(userData);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authLogout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authForgotPassword(email);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authResetPassword(token, password);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authVerifyEmail(token);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData: ProfileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authUpdateProfile(profileData);
      if (response.success) {
        setUser(response.data.user);
      }
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getCurrentUser();
      if (response.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isCreator: user?.type === 'creator',
    isVerified: user?.verified === true,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updateProfile,
    refreshUser,
    clearError: () => setError(null)
  };
}