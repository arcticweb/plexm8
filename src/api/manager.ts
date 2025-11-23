/**
 * Unified Plex API Client
 * Main entry point for all Plex API operations
 * Provides easy access to Playlists, Collections, Status, and more
 */

import { PlaylistsApi, createPlaylistsApi } from './playlists';
import { CollectionsApi, createCollectionsApi } from './collections';
import { StatusApi, createStatusApi } from './status';

/**
 * Main Plex API Client with all operations
 */
export class PlexApiManager {
  public playlists: PlaylistsApi;
  public collections: CollectionsApi;
  public status: StatusApi;

  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string, token?: string, clientId?: string) {
    this.baseURL = baseURL;
    this.token = token || null;

    const config = {
      baseURL: this.baseURL,
      token: token,
      clientId: clientId,
    };

    this.playlists = createPlaylistsApi(config);
    this.collections = createCollectionsApi(config);
    this.status = createStatusApi(config);
  }

  /**
   * Set authentication token for all API operations
   */
  setToken(token: string): void {
    this.token = token;

    // Update token for all sub-APIs
    this.playlists.setToken(token);
    this.collections.setToken(token);
    this.status.setToken(token);
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Clear authentication token from all APIs
   */
  clearToken(): void {
    this.token = null;

    this.playlists.clearToken();
    this.collections.clearToken();
    this.status.clearToken();
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

/**
 * Create a new Plex API manager instance
 * @param baseURL - Base URL for API calls (typically proxied through Netlify Functions)
 * @param token - Optional authentication token
 * @param clientId - Optional client identifier
 */
export function createPlexApiManager(
  baseURL: string = '/.netlify/functions/plex',
  token?: string,
  clientId?: string
): PlexApiManager {
  return new PlexApiManager(baseURL, token, clientId);
}

// Export all types for external use
export * from './types';
export * from './base';
export * from './playlists';
export * from './collections';
export * from './status';
