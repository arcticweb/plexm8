/**
 * Plex API Configuration (Backend)
 * 
 * Re-exports frontend config for backend use.
 * This ensures both frontend and backend use identical configuration.
 */

// Plex API endpoints
export const PLEX_API_PUBLIC = 'https://plex.tv/api/v2';
export const PLEX_API_CLIENTS = 'https://clients.plex.tv/api/v2';

// Product identification
export const PLEX_PRODUCT = 'PlexM8';

// Configuration object (mirroring frontend config structure)
export const PLEX_CONFIG = {
  api: {
    public: PLEX_API_PUBLIC,
    clients: PLEX_API_CLIENTS,
  },
  product: {
    name: PLEX_PRODUCT,
  },
  auth: {
    pins: {
      create: '/pins?strong=true',
      check: '/pins/{pinId}',
    },
    user: '/user',
  },
  playlists: {
    list: '/playlists',
    create: '/playlists',
    get: '/playlists/{playlistId}',
    delete: '/playlists/{playlistId}',
    clear: '/playlists/{playlistId}/items/clear',
    addItems: '/playlists/{playlistId}/items',
    moveItem: '/playlists/{playlistId}/items/{itemId}/move',
    generators: '/playlists/{playlistId}/generators',
    upload: '/playlists/upload',
  },
  headers: {
    product: 'X-Plex-Product',
    clientId: 'X-Plex-Client-Identifier',
    token: 'X-Plex-Token',
    contentType: 'Content-Type',
    accept: 'Accept',
  },
  defaults: {
    contentType: 'application/json',
    accept: 'application/json',
    timeout: 30000,
  },
} as const;

/**
 * Get common Plex API headers
 */
export function getPlexHeaders(
  token?: string,
  clientId?: string
): Record<string, string> {
  const headers: Record<string, string> = {
    [PLEX_CONFIG.headers.product]: PLEX_CONFIG.product.name,
    [PLEX_CONFIG.headers.accept]: PLEX_CONFIG.defaults.accept,
  };

  if (token) {
    headers[PLEX_CONFIG.headers.token] = token;
  }

  if (clientId) {
    headers[PLEX_CONFIG.headers.clientId] = clientId;
  }

  return headers;
}

/**
 * Replace path parameters in endpoint
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
