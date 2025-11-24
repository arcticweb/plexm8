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
 * Detect available backend services
 * Returns configuration for the best available option
 */
export declare function detectBackend(): Promise<BackendConfig>;
/**
 * Get the appropriate proxy URL for playlists endpoint
 *
 * @param serverUrl - Base Plex server URL (e.g., "https://...:32400")
 * @param token - Plex authentication token
 * @param clientId - Client identifier
 * @param endpointPath - Optional endpoint path (e.g., "/playlists/123/items")
 */
export declare function getPlaylistsProxyUrl(serverUrl: string, token: string, clientId: string, endpointPath?: string): Promise<string>;
/**
 * Get the appropriate proxy URL for authentication endpoint
 */
export declare function getAuthProxyUrl(action: 'createPin' | 'checkPin', clientId: string, pinId?: string): Promise<string>;
export declare function getCachedBackend(): Promise<BackendConfig>;
/**
 * Force re-detection of backend
 * (useful after backend starts/stops during development)
 */
export declare function resetBackendCache(): void;
