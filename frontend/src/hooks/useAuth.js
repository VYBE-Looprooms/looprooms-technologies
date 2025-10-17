import { useState, useEffect, useCallback } from 'react';
import { auth, authState, tokenManager, userManager } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = authState.getUser();
        const token = tokenManager.get();

        if (storedUser && token) {
          // Verify token is still valid
          try {
            const response = await auth.getCurrentUser();
            if (response.success) {
              setUser(response.data.user);
              setIsLoggedIn(true);
            } else {
              // Token invalid, clear storage
              tokenManager.remove();
              userManager.remove();
              setUser(null);
              setIsLoggedIn(false);
            }
          } catch (error) {
            // Token invalid or network error
            tokenManager.remove();
            userManager.remove();
            setUser(null);
            setIsLoggedIn(false);
          }
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await auth.login(email, password);
      if (response.success) {
        setUser(response.data.user);
        setIsLoggedIn(true);
        return { success: true, user: response.data.user };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await auth.signup(userData);
      return response;
    } catch (error) {
      return { success: false, error: error.message || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await auth.logout();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      return await auth.forgotPassword(email);
    } catch (error) {
      return { success: false, error: error.message || 'Password reset failed' };
    }
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    try {
      return await auth.resetPassword(token, password);
    } catch (error) {
      return { success: false, error: error.message || 'Password reset failed' };
    }
  }, []);

  const verifyEmail = useCallback(async (token) => {
    try {
      return await auth.verifyEmail(token);
    } catch (error) {
      return { success: false, error: error.message || 'Email verification failed' };
    }
  }, []);

  return {
    user,
    loading,
    isLoggedIn,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    isCreator: user?.type === 'creator',
    isUser: user?.type === 'user'
  };
}

export function useAdminAuth() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize admin auth state
  useEffect(() => {
    const initializeAdminAuth = () => {
      try {
        const storedAdmin = authState.getAdmin();
        const token = tokenManager.getAdminToken();

        if (storedAdmin && token) {
          setAdmin(storedAdmin);
          setIsLoggedIn(true);
        } else {
          setAdmin(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Admin auth initialization error:', error);
        setAdmin(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAdminAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await auth.adminLogin(email, password);
      if (response.success) {
        setAdmin(response.data.admin);
        setIsLoggedIn(true);
        return { success: true, admin: response.data.admin };
      } else {
        return { success: false, error: response.message || 'Admin login failed' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Admin login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await auth.adminLogout();
      setAdmin(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Admin logout error:', error);
      // Still clear local state even if API call fails
      setAdmin(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    admin,
    loading,
    isLoggedIn,
    login,
    logout,
    role: admin?.role || null
  };
}

export default useAuth;