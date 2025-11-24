/**
 * Unified Plex API Client
 * Main entry point for all Plex API operations
 * Provides easy access to Playlists, Collections, Status, and more
 */
import { PlaylistsApi } from './playlists';
import { CollectionsApi } from './collections';
import { StatusApi } from './status';
/**
 * Main Plex API Client with all operations
 */
export declare class PlexApiManager {
    playlists: PlaylistsApi;
    collections: CollectionsApi;
    status: StatusApi;
    private baseURL;
    private token;
    constructor(baseURL: string, token?: string, clientId?: string);
    /**
     * Set authentication token for all API operations
     */
    setToken(token: string): void;
    /**
     * Get current authentication token
     */
    getToken(): string | null;
    /**
     * Clear authentication token from all APIs
     */
    clearToken(): void;
    /**
     * Check if authenticated
     */
    isAuthenticated(): boolean;
}
/**
 * Create a new Plex API manager instance
 * @param baseURL - Base URL for API calls (typically proxied through Netlify Functions)
 * @param token - Optional authentication token
 * @param clientId - Optional client identifier
 */
export declare function createPlexApiManager(baseURL?: string, token?: string, clientId?: string): PlexApiManager;
export * from './types';
export * from './base';
export * from './playlists';
export * from './collections';
export * from './status';
