import { useState } from 'react';
import { submitContact } from '@/lib/api';

export function useContact() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitContactForm = async (contactData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await submitContact(contactData);
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
    submitContactForm,
    isLoading,
    error,
    success,
    reset,
  };
}