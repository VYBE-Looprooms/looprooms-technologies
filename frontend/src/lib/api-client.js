// API client for posts and social features
import { apiClient } from './auth';

export const postsAPI = {
  // Get feed posts
  async getFeedPosts(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/posts${queryParams ? `?${queryParams}` : ''}`;
    return await apiClient.call(url);
  },

  // Create new post
  async createPost(postData) {
    return await apiClient.call('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  // Get specific post
  async getPost(postId) {
    return await apiClient.call(`/posts/${postId}`);
  },

  // React to post
  async reactToPost(postId, reactionType = 'heart') {
    return await apiClient.call(`/posts/${postId}/react`, {
      method: 'POST',
      body: JSON.stringify({ type: reactionType }),
    });
  },

  // Get post comments
  async getComments(postId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/posts/${postId}/comments${queryParams ? `?${queryParams}` : ''}`;
    return await apiClient.call(url);
  },

  // Add comment to post
  async addComment(postId, commentData) {
    return await apiClient.call(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  },

  // Delete post
  async deletePost(postId) {
    return await apiClient.call(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }
};

export const reactionsAPI = {
  // Available reaction types
  types: {
    heart: { emoji: '❤️', label: 'Heart', color: 'text-red-500' },
    celebrate: { emoji: '🎉', label: 'Celebrate', color: 'text-yellow-500' },
    support: { emoji: '🤗', label: 'Support', color: 'text-blue-500' },
    inspire: { emoji: '✨', label: 'Inspire', color: 'text-purple-500' },
    grateful: { emoji: '🙏', label: 'Grateful', color: 'text-green-500' }
  },

  // Get reaction info
  getReactionInfo(type) {
    return this.types[type] || this.types.heart;
  }
};

const apiClientDefault = {
  posts: postsAPI,
  reactions: reactionsAPI
};

export default apiClientDefault;