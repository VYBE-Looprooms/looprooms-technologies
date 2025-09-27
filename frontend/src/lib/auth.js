// Authentication utilities for Vybe platform

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Token management
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userToken');
};

export const setAuthToken = (token) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('userToken', token);
};

export const removeAuthToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('userToken');
  localStorage.removeItem('userInfo');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// User info management
export const getUserInfo = () => {
  if (typeof window === 'undefined') return null;
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

export const setUserInfo = (userInfo) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

// API request helper with auth
export const authenticatedRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        removeAuthToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      throw new Error(data.message || data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication API calls
export const login = async (email, password) => {
  const response = await authenticatedRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  if (response.success && response.data.token) {
    setAuthToken(response.data.token);
    setUserInfo(response.data.user);
  }

  return response;
};

export const signup = async (userData) => {
  const response = await authenticatedRequest('/auth/signup', {
    method: 'POST',
    body: userData,
  });

  return response;
};

export const logout = async () => {
  try {
    await authenticatedRequest('/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
};

export const forgotPassword = async (email) => {
  return authenticatedRequest('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
};

export const resetPassword = async (token, password) => {
  return authenticatedRequest('/auth/reset-password', {
    method: 'POST',
    body: { token, password },
  });
};

export const verifyEmail = async (token) => {
  return authenticatedRequest(`/auth/verify-email?token=${token}`);
};

export const getCurrentUser = async () => {
  return authenticatedRequest('/auth/me');
};

export const updateProfile = async (profileData) => {
  return authenticatedRequest('/auth/profile', {
    method: 'PUT',
    body: profileData,
  });
};

// Check if user is a creator
export const isCreator = () => {
  const userInfo = getUserInfo();
  return userInfo?.type === 'creator';
};

// Check if user is verified
export const isVerified = () => {
  const userInfo = getUserInfo();
  return userInfo?.verified === true;
};