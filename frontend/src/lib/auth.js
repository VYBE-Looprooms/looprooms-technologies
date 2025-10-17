// Authentication utilities for Vybe platform
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Token management
export const tokenManager = {
  get: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userToken');
  },
  
  set: (token) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('userToken', token);
  },
  
  remove: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
  },
  
  getAdminToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  },
  
  setAdminToken: (token) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('adminToken', token);
  },
  
  removeAdminToken: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
  }
};

// User info management
export const userManager = {
  get: () => {
    if (typeof window === 'undefined') return null;
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  },
  
  set: (userInfo) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  },
  
  remove: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('userInfo');
  },
  
  getAdmin: () => {
    if (typeof window === 'undefined') return null;
    const adminInfo = localStorage.getItem('adminInfo');
    return adminInfo ? JSON.parse(adminInfo) : null;
  },
  
  setAdmin: (adminInfo) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
  }
};

// API client with authentication
export const apiClient = {
  // User API calls
  async call(endpoint, options = {}) {
    const token = tokenManager.get();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          tokenManager.remove();
          userManager.remove();
          // Don't redirect immediately to prevent loops
          throw new Error('Authentication failed');
        }
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`API call failed: ${endpoint}`, error);
      throw error;
    }
  },

  // Admin API calls
  async adminCall(endpoint, options = {}) {
    const token = tokenManager.getAdminToken();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          tokenManager.removeAdminToken();
          userManager.remove();
          // Don't redirect immediately to prevent loops
          throw new Error('Admin authentication failed');
        }
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`Admin API call failed: ${endpoint}`, error);
      throw error;
    }
  }
};

// Authentication functions
export const auth = {
  // User authentication
  async login(email, password) {
    const response = await apiClient.call('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success) {
      tokenManager.set(response.data.token);
      userManager.set(response.data.user);
    }

    return response;
  },

  async signup(userData) {
    const response = await apiClient.call('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    return response;
  },

  async logout() {
    try {
      await apiClient.call('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      tokenManager.remove();
      userManager.remove();
    }
  },

  async forgotPassword(email) {
    return await apiClient.call('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token, password) {
    return await apiClient.call('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  async verifyEmail(token) {
    return await apiClient.call(`/auth/verify-email?token=${token}`);
  },

  async getCurrentUser() {
    return await apiClient.call('/auth/me');
  },

  // Admin authentication
  async adminLogin(email, password) {
    // Use regular fetch for admin login to avoid circular dependency
    const url = `${API_BASE_URL}/admin/login`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Admin login failed');
      }

      if (data.success) {
        tokenManager.setAdminToken(data.data.token);
        userManager.setAdmin(data.data.admin);
      }

      return data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  },

  async adminLogout() {
    try {
      const token = tokenManager.getAdminToken();
      if (token) {
        await fetch(`${API_BASE_URL}/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Admin logout API call failed:', error);
    } finally {
      tokenManager.removeAdminToken();
      userManager.remove();
    }
  }
};

// Authentication state checks
export const authState = {
  isLoggedIn: () => {
    return !!tokenManager.get() && !!userManager.get();
  },
  
  isAdminLoggedIn: () => {
    return !!tokenManager.getAdminToken() && !!userManager.getAdmin();
  },
  
  getUser: () => {
    return userManager.get();
  },
  
  getAdmin: () => {
    return userManager.getAdmin();
  },
  
  getUserType: () => {
    const user = userManager.get();
    return user?.type || null;
  },
  
  isCreator: () => {
    const user = userManager.get();
    return user?.type === 'creator';
  },
  
  isUser: () => {
    const user = userManager.get();
    return user?.type === 'user';
  }
};

// Route protection utilities
export const routeProtection = {
  requireAuth: () => {
    if (typeof window === 'undefined') return true; // SSR
    
    if (!authState.isLoggedIn()) {
      window.location.href = '/login';
      return false;
    }
    return true;
  },
  
  requireAdmin: () => {
    if (typeof window === 'undefined') return true; // SSR
    
    if (!authState.isAdminLoggedIn()) {
      window.location.href = '/admin/login';
      return false;
    }
    return true;
  },
  
  requireCreator: () => {
    if (typeof window === 'undefined') return true; // SSR
    
    if (!authState.isLoggedIn() || !authState.isCreator()) {
      window.location.href = '/login';
      return false;
    }
    return true;
  },
  
  redirectIfLoggedIn: (redirectTo = '/feed') => {
    if (typeof window === 'undefined') return false; // SSR
    
    if (authState.isLoggedIn()) {
      window.location.href = redirectTo;
      return true;
    }
    return false;
  },
  
  redirectIfAdminLoggedIn: (redirectTo = '/admin/dashboard') => {
    if (typeof window === 'undefined') return false; // SSR
    
    if (authState.isAdminLoggedIn()) {
      window.location.href = redirectTo;
      return true;
    }
    return false;
  }
};

const authDefault = {
  tokenManager,
  userManager,
  apiClient,
  auth,
  authState,
  routeProtection
};

export default authDefault;