import { useState, useEffect } from 'react';
import { 
  getLoopchains, 
  getLoopchain, 
  startLoopchain, 
  updateLoopchainProgress, 
  completeLoopchain,
  getTrendingLoopchains 
} from '@/lib/api-client';

export function useLoopchains(params = {}) {
  const [loopchains, setLoopchains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
    hasMore: false
  });

  const fetchLoopchains = async (newParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedParams = { ...params, ...newParams };
      const response = await getLoopchains(mergedParams);
      
      if (response.success) {
        setLoopchains(response.loopchains || []);
        setPagination(response.pagination || {
          page: 1,
          totalPages: 1,
          totalCount: response.loopchains?.length || 0,
          hasMore: false
        });
      } else {
        setError(response.message || 'Failed to fetch loopchains');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoopchains();
  }, []);

  return {
    loopchains,
    loading,
    error,
    pagination,
    fetchLoopchains,
    refetch: fetchLoopchains
  };
}

export function useLoopchain(chainId) {
  const [loopchain, setLoopchain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLoopchain = async () => {
    if (!chainId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await getLoopchain(chainId);
      
      if (response.success) {
        setLoopchain(response.loopchain);
      } else {
        setError(response.message || 'Failed to fetch loopchain');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const startJourney = async (data = {}) => {
    try {
      const response = await startLoopchain(chainId, data);
      if (response.success) {
        fetchLoopchain();
        return { success: true, journey: response.journey };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateProgress = async (data) => {
    try {
      const response = await updateLoopchainProgress(chainId, data);
      if (response.success) {
        fetchLoopchain();
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const completeJourney = async (data = {}) => {
    try {
      const response = await completeLoopchain(chainId, data);
      if (response.success) {
        fetchLoopchain();
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchLoopchain();
  }, [chainId]);

  return {
    loopchain,
    loading,
    error,
    startJourney,
    updateProgress,
    completeJourney,
    refetch: fetchLoopchain
  };
}

export function useTrendingLoopchains() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getTrendingLoopchains();
      
      if (response.success) {
        setTrending(response.loopchains || []);
      } else {
        setError(response.message || 'Failed to fetch trending loopchains');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  return {
    trending,
    loading,
    error,
    refetch: fetchTrending
  };
}
