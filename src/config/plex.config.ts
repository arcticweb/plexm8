/**
 * Plex API Configuration
 * 
 * Centralized configuration for all Plex API interactions.
 * Used by both frontend and backend to ensure consistency.
 */

export const PLEX_CONFIG = {
  // Plex API endpoints
  api: {
    // Public Plex API (authentication, user info, resources)
    public: 'https://plex.tv/api/v2',
    // Plex client API (for accessing PMS instances)
    clients: 'https://clients.plex.tv/api/v2',
  },

  // Product identification
  product: {
    name: 'PlexM8',
    // Should be stored/persisted on client
    clientIdentifierKey: 'plexm8_client_id',
  },

  // Authentication configuration
  auth: {
    // PIN authentication endpoints
    pins: {
      create: '/pins?strong=true',
      check: '/pins/{pinId}',
    },
    // User info endpoint
    user: '/user',
  },

  // Playlist endpoints
  playlists: {
    // Get all playlists (requires server URL + token)
    list: '/playlists',
    // Create new playlist
    create: '/playlists',
    // Get specific playlist details
    get: '/playlists/{playlistId}',
    // Delete playlist
    delete: '/playlists/{playlistId}',
    // Clear all items from playlist (dumb playlists only)
    clear: '/playlists/{playlistId}/items/clear',
    // Add items to playlist
    addItems: '/playlists/{playlistId}/items',
    // Move item within playlist
    moveItem: '/playlists/{playlistId}/items/{itemId}/move',
    // Get playlist generators (smart playlists)
    generators: '/playlists/{playlistId}/generators',
    // Upload m3u playlists
    upload: '/playlists/upload',
  },

  // Collections endpoints
  collections: {
    // Add items to collection
    addItems: '/library/collections/{collectionId}',
    // Remove item from collection
    removeItem: '/library/collections/{collectionId}/items/{itemId}',
    // Reorder items in collection
    reorderItem: '/library/collections/{collectionId}/items/{itemId}',
  },

  // Status/Session endpoints
  status: {
    // List active sessions
    sessions: '/status/sessions',
    // Get background tasks
    tasks: '/status/tasks',
    // Playback history
    history: '/status/sessions/history/all',
  },

  // Library endpoints
  library: {
    // Get library sections
    sections: '/library/sections',
    // Get all items in section
    all: '/library/sections/{sectionId}/all',
    // Search library
    search: '/library/sections/search',
  },

  // HTTP headers
  headers: {
    product: 'X-Plex-Product',
    clientId: 'X-Plex-Client-Identifier',
    token: 'X-Plex-Token',
    contentType: 'Content-Type',
    accept: 'Accept',
  },

  // API defaults
  defaults: {
    contentType: 'application/json',
    accept: 'application/json',
    // Request timeout in milliseconds
    timeout: 30000,
  },

  // Rate limiting / polling intervals (in milliseconds)
  polling: {
    // How often to check if PIN has been claimed
    pinCheckInterval: 1000,
    // Maximum time to wait for PIN claim
    pinCheckTimeout: 300000, // 5 minutes
  },

  // Feature flags
  features: {
    // Use JWT authentication (Phase 2)
    jwt: false,
    // Support smart playlists
    smartPlaylists: true,
    // Support collection operations
    collections: true,
  },
} as const;

/**
 * Build full URL for Plex API endpoint
 * @param base Base URL ('public' or 'clients')
 * @param endpoint Endpoint path
 * @returns Full URL
 */
export function buildPlexUrl(
  base: keyof typeof PLEX_CONFIG.api,
  endpoint: string
): string {
  return `${PLEX_CONFIG.api[base]}${endpoint}`;
}

/**
 * Replace path parameters in endpoint
 * @param endpoint Endpoint path with {param} placeholders
 * @param params Object with replacement values
 * @returns Endpoint with parameters replaced
 */
export function fillEndpointParams(
  endpoint: string,
  params: Record<string, string | number>
): string {
  let result = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`{${key}}`, String(value));
  });
  return result;
}

/**
 * Build Plex API request headers
 * @param token Optional authentication token
 * @param clientId Optional client identifier
 * @returns Headers object
 */
export function buildPlexHeaders(
  token?: string,
  clientId?: string
): Record<string, string> {
  const headers: Record<string, string> = {
    [PLEX_CONFIG.headers.product]: PLEX_CONFIG.product.name,
    [PLEX_CONFIG.headers.accept]: PLEX_CONFIG.defaults.accept,
    [PLEX_CONFIG.headers.contentType]: PLEX_CONFIG.defaults.contentType,
  };

  if (token) {
    headers[PLEX_CONFIG.headers.token] = token;
  }

  if (clientId) {
    headers[PLEX_CONFIG.headers.clientId] = clientId;
  }

  return headers;
}

export default PLEX_CONFIG;
