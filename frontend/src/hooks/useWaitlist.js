import { useState } from 'react';
import { joinWaitlist } from '@/lib/api';

export function useWaitlist() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitWaitlist = async (userData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await joinWaitlist(userData);
      setSuccess(true);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
    setIsLoading(false);
  };

  return {
    submitWaitlist,
    isLoading,
    error,
    success,
    reset,
  };
}