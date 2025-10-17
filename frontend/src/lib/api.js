// API client for Vybe backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Waitlist API
  async joinWaitlist(userData) {
    return this.request('/waitlist', {
      method: 'POST',
      body: userData,
    });
  }

  async getWaitlistStats() {
    return this.request('/waitlist/stats');
  }

  // Contact API
  async submitContact(contactData) {
    return this.request('/contact', {
      method: 'POST',
      body: contactData,
    });
  }

  async getContactMessages(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/contact/messages?${queryString}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();

// Convenience functions
export const joinWaitlist = (userData) => apiClient.joinWaitlist(userData);
export const submitContact = (contactData) => apiClient.submitContact(contactData);
export const getWaitlistStats = () => apiClient.getWaitlistStats();
export const healthCheck = () => apiClient.healthCheck();