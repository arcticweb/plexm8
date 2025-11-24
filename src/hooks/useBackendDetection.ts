/**
 * Backend Detection Hook
 * Detects available backends (Netlify proxy or local Python)
 * Enables conditional feature display based on availability
 */

import { useEffect, useState } from 'react';

export interface BackendInfo {
  available: boolean;
  type: 'local' | 'netlify';
  features: string[];
  url?: string;
  version?: string;
  error?: string;
}

const DEFAULT_LOCAL_URL = 'http://localhost:5000';
const HEALTH_CHECK_TIMEOUT = 3000;

/**
 * Hook to detect available backends
 * Attempts local backend first, falls back to Netlify proxy
 */
export function useBackendDetection() {
  const [backend, setBackend] = useState<BackendInfo>({
    available: true,
    type: 'netlify',
    features: ['playlists', 'browse'],
    url: '/.netlify/functions/plex-proxy',
  });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const detectBackend = async () => {
      try {
        // Try to reach local backend first
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

        try {
          const response = await fetch(`${DEFAULT_LOCAL_URL}/api/health`, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            
            // Local backend is available
            setBackend({
              available: true,
              type: 'local',
              features: data.features || ['playlists', 'ratings', 'recommendations'],
              url: DEFAULT_LOCAL_URL,
              version: data.version,
            });

            console.log('✅ Local backend detected:', data);
            setChecking(false);
            return;
          }
        } catch (err) {
          clearTimeout(timeoutId);
          // Local backend not available, continue to default
          if (err instanceof Error && err.name !== 'AbortError') {
            console.log('ℹ️ Local backend not detected (expected)');
          }
        }
      } catch (err) {
        console.error('Error during backend detection:', err);
      }

      // Default to Netlify proxy
      setBackend({
        available: true,
        type: 'netlify',
        features: ['playlists', 'browse'],
        url: '/.netlify/functions/plex-proxy',
      });

      setChecking(false);
    };

    detectBackend();
  }, []);

  return { backend, checking };
}

/**
 * Check if a specific feature is available
 */
export function useHasFeature(feature: string) {
  const { backend } = useBackendDetection();
  return backend.features.includes(feature);
}

/**
 * Get API URL for a specific endpoint
 */
export function useApiUrl(endpoint: string) {
  const { backend } = useBackendDetection();

  if (backend.type === 'local') {
    return `${backend.url}/api/${endpoint}`;
  } else {
    // For Netlify proxy, endpoint is handled differently
    return `${backend.url}?endpoint=${endpoint}`;
  }
}
