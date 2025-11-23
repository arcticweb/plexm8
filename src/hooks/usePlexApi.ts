import { useState, useCallback } from 'react';
import { getPlexClient } from '../api/plex';

/**
 * usePlexApi Hook
 * 
 * Provides convenient access to Plex API with loading and error states.
 * Handles API calls and state management for components.
 */

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function usePlexApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const call = useCallback(async (fn: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await fn();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'API Error';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return { ...state, call };
}

/**
 * Hook to get current user information
 */
export function useCurrentUser() {
  const api = usePlexApi();

  const fetchUser = useCallback(async () => {
    try {
      const client = getPlexClient();
      const result = await api.call(() => client.getCurrentUser());
      return result;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  }, [api]);

  return { ...api, fetchUser };
}

/**
 * Hook to get available Plex servers
 */
export function useResources() {
  const api = usePlexApi();

  const fetchResources = useCallback(async () => {
    try {
      const client = getPlexClient();
      const result = await api.call(() => client.getResources());
      return result;
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      throw error;
    }
  }, [api]);

  return { ...api, fetchResources };
}
