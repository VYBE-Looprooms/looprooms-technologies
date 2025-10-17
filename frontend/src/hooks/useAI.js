import { useState, useEffect } from 'react';
import { 
  getAIPersonalities, 
  getAIContent, 
  chatWithAI, 
  getLoopchainRecommendations,
  getAIRoomStatus,
  enterAIRoom 
} from '@/lib/api-client';

export function useAIPersonalities() {
  const [personalities, setPersonalities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPersonalities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAIPersonalities();
      
      if (response.success) {
        setPersonalities(response.personalities || []);
      } else {
        setError(response.message || 'Failed to fetch AI personalities');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalities();
  }, []);

  return {
    personalities,
    loading,
    error,
    refetch: fetchPersonalities
  };
}

export function useAIChat(personalityId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (message, context = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add user message immediately
      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      
      const response = await chatWithAI({
        personalityId,
        message,
        context
      });
      
      if (response.success) {
        // Add AI response
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
        return { success: true, response: response.response };
      } else {
        setError(response.message || 'Failed to send message');
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages
  };
}

export function useAIContent(category) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContent = async () => {
    if (!category) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAIContent(category);
      
      if (response.success) {
        setContent(response.content);
      } else {
        setError(response.message || 'Failed to fetch AI content');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [category]);

  return {
    content,
    loading,
    error,
    refetch: fetchContent
  };
}

export function useLoopchainRecommendations(params = {}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async (newParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedParams = { ...params, ...newParams };
      const response = await getLoopchainRecommendations(mergedParams);
      
      if (response.success) {
        setRecommendations(response.recommendations || []);
      } else {
        setError(response.message || 'Failed to fetch recommendations');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.mood || params.preferences) {
      fetchRecommendations();
    }
  }, [params.mood, params.preferences]);

  return {
    recommendations,
    loading,
    error,
    fetchRecommendations,
    refetch: fetchRecommendations
  };
}

export function useAIRoomStatus() {
  const [roomStatus, setRoomStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoomStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAIRoomStatus();
      
      if (response.success) {
        setRoomStatus(response.rooms || []);
      } else {
        setError(response.message || 'Failed to fetch room status');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const enterRoom = async (category, data = {}) => {
    try {
      const response = await enterAIRoom(category, data);
      if (response.success) {
        fetchRoomStatus();
        return { success: true, room: response.room };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchRoomStatus();
  }, []);

  return {
    roomStatus,
    loading,
    error,
    enterRoom,
    refetch: fetchRoomStatus
  };
}
