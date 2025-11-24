/**
 * Backend Detection Utility
 * 
 * Detects available backend services and routes requests appropriately.
 * Handles both Netlify Functions (production) and local Python backend (development).
 * 
 * Related docs:
 * - ../../docs/setup/local-backend-setup.md
 * - ../../docs/backend/README.md
 */

export interface BackendConfig {
  type: 'netlify' | 'local-python' | 'direct' | 'none';
  baseUrl: string;
  available: boolean;
}

/**
 * Check if Netlify Functions are available
 * (Only works on Netlify platform, not in local dev)
 */
async function checkNetlifyFunctions(): Promise<boolean> {
  try {
    const response = await fetch('/.netlify/functions/plex-proxy?healthcheck=true', {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    return response.status !== 404;
  } catch (error) {
    return false;
  }
}

/**
 * Check if local Python backend is running
 * (http://localhost:5000)
 */
async function checkLocalPythonBackend(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:5000/api/health', {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Detect available backend services
 * Returns configuration for the best available option
 */
export async function detectBackend(): Promise<BackendConfig> {
  // Check if we're on Netlify (production)
  if (window.location.hostname.includes('netlify.app')) {
    return {
      type: 'netlify',
      baseUrl: '/.netlify/functions',
      available: true,
    };
  }

  // In local development, check what's available
  const [netlifyAvailable, pythonAvailable] = await Promise.all([
    checkNetlifyFunctions(),
    checkLocalPythonBackend(),
  ]);

  if (pythonAvailable) {
    return {
      type: 'local-python',
      baseUrl: 'http://localhost:5000/api',
      available: true,
    };
  }

  if (netlifyAvailable) {
    return {
      type: 'netlify',
      baseUrl: '/.netlify/functions',
      available: true,
    };
  }

  // No proxy available - will need direct connections
  // (may fail due to CORS from Plex servers)
  return {
    type: 'direct',
    baseUrl: '',
    available: false,
  };
}

/**
 * Get the appropriate proxy URL for playlists endpoint
 */
export async function getPlaylistsProxyUrl(
  serverUrl: string,
  token: string,
  clientId: string
): Promise<string> {
  const backend = await detectBackend();
  const encodedServerUrl = btoa(serverUrl);

  switch (backend.type) {
    case 'netlify':
      // Netlify Functions proxy
      return `${backend.baseUrl}/plex-proxy?endpoint=playlists&serverUrl=${encodedServerUrl}&token=${token}&clientId=${clientId}`;

    case 'local-python':
      // Local Python backend proxy
      return `${backend.baseUrl}/playlists?serverUrl=${encodedServerUrl}&token=${token}&clientId=${clientId}`;

    case 'direct':
      // Direct connection (no proxy)
      // This will likely fail due to CORS, but we'll try anyway
      console.warn('No proxy available, attempting direct connection (may fail due to CORS)');
      return `${serverUrl}/playlists`;

    default:
      throw new Error('No backend available for playlist requests');
  }
}

/**
 * Get the appropriate proxy URL for authentication endpoint
 */
export async function getAuthProxyUrl(action: 'createPin' | 'checkPin', clientId: string, pinId?: string): Promise<string> {
  const backend = await detectBackend();

  switch (backend.type) {
    case 'netlify':
      // Netlify Functions auth proxy
      return pinId
        ? `${backend.baseUrl}/auth?action=${action}&clientId=${clientId}&pinId=${pinId}`
        : `${backend.baseUrl}/auth?action=${action}&clientId=${clientId}`;

    case 'local-python':
      // Local Python backend auth
      return pinId
        ? `${backend.baseUrl}/auth/${action}?clientId=${clientId}&pinId=${pinId}`
        : `${backend.baseUrl}/auth/${action}?clientId=${clientId}`;

    case 'direct':
      // Direct Plex API calls (no proxy needed for auth)
      const plexApiBase = 'https://plex.tv/api/v2';
      if (action === 'createPin') {
        return `${plexApiBase}/pins?strong=true`;
      } else {
        return `${plexApiBase}/pins/${pinId}`;
      }

    default:
      throw new Error('No backend available for authentication');
  }
}

/**
 * Cache the backend detection result to avoid repeated checks
 * (Backend type shouldn't change during a session)
 */
let cachedBackend: BackendConfig | null = null;

export async function getCachedBackend(): Promise<BackendConfig> {
  if (!cachedBackend) {
    cachedBackend = await detectBackend();
    console.log('Backend detected:', cachedBackend);
  }
  return cachedBackend;
}

/**
 * Force re-detection of backend
 * (useful after backend starts/stops during development)
 */
export function resetBackendCache(): void {
  cachedBackend = null;
}
