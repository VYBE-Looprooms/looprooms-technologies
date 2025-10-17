import { useState, useEffect } from 'react';
import { 
  getLooprooms, 
  getLooproom, 
  joinLooproom, 
  leaveLooproom, 
  createLooproom,
  getLooproomCategories,
  getAILooproom 
} from '@/lib/api-client';

export function useLooprooms(params = {}) {
  const [looprooms, setLooprooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
    hasMore: false
  });

  const fetchLooprooms = async (newParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedParams = { ...params, ...newParams };
      const response = await getLooprooms(mergedParams);
      
      if (response.success) {
        setLooprooms(response.looprooms || []);
        setPagination(response.pagination || {
          page: 1,
          totalPages: 1,
          totalCount: response.looprooms?.length || 0,
          hasMore: false
        });
      } else {
        setError(response.message || 'Failed to fetch looprooms');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomId, data = {}) => {
    try {
      const response = await joinLooproom(roomId, data);
      if (response.success) {
        fetchLooprooms();
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const leaveRoom = async (roomId) => {
    try {
      const response = await leaveLooproom(roomId);
      if (response.success) {
        fetchLooprooms();
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const createRoom = async (data) => {
    try {
      const response = await createLooproom(data);
      if (response.success) {
        fetchLooprooms();
        return { success: true, looproom: response.looproom };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchLooprooms();
  }, []);

  return {
    looprooms,
    loading,
    error,
    pagination,
    fetchLooprooms,
    joinRoom,
    leaveRoom,
    createRoom,
    refetch: fetchLooprooms
  };
}

export function useLooproom(roomId) {
  const [looproom, setLooproom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLooproom = async () => {
    if (!roomId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await getLooproom(roomId);
      
      if (response.success) {
        setLooproom(response.looproom);
        setParticipants(response.participants || []);
      } else {
        setError(response.message || 'Failed to fetch looproom');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (data = {}) => {
    try {
      const response = await joinLooproom(roomId, data);
      if (response.success) {
        fetchLooproom();
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const leaveRoom = async () => {
    try {
      const response = await leaveLooproom(roomId);
      if (response.success) {
        fetchLooproom();
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchLooproom();
  }, [roomId]);

  return {
    looproom,
    participants,
    loading,
    error,
    joinRoom,
    leaveRoom,
    refetch: fetchLooproom
  };
}

export function useLooproomCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getLooproomCategories();
      
      if (response.success) {
        setCategories(response.categories || []);
      } else {
        setError(response.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
}

export function useAILooproom(category) {
  const [aiRoom, setAIRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAIRoom = async () => {
    if (!category) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAILooproom(category);
      
      if (response.success) {
        setAIRoom(response.looproom);
      } else {
        setError(response.message || 'Failed to fetch AI room');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIRoom();
  }, [category]);

  return {
    aiRoom,
    loading,
    error,
    refetch: fetchAIRoom
  };
}
