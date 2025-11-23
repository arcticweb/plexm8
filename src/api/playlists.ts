/**
 * Plex Playlists API Client
 * Handles all playlist operations (create, read, update, delete, manage items)
 */

import { PlexApiClient, ApiClientConfig } from './base';
import {
  Playlist,
  MediaContainer,
  PaginationParams,
  PlaylistGenerator,
} from './types';

/**
 * Playlists API operations
 */
export class PlaylistsApi extends PlexApiClient {
  constructor(config: ApiClientConfig) {
    super(config);
  }

  /**
   * Get all playlists
   * Includes both smart and dumb playlists
   */
  async getPlaylists(params?: PaginationParams): Promise<Playlist[]> {
    const queryString = this.buildQueryString({
      offset: params?.offset,
      limit: params?.limit,
    });

    const response = await this.get<MediaContainer<Playlist>>(
      `/playlists${queryString}`
    );

    return response.Metadata || [];
  }

  /**
   * Create a new blank playlist
   * @param title - Name of the playlist
   * @param playlistType - 'audio', 'video', or 'photo'
   * @param uri - Optional: Content URI for what to add (e.g., library://...)
   * @param playQueueID - Optional: Create from existing play queue
   */
  async createPlaylist(
    title: string,
    playlistType: 'audio' | 'video' | 'photo' = 'audio',
    uri?: string,
    playQueueID?: number
  ): Promise<Playlist> {
    const params: any = {
      title,
      type: playlistType,
    };

    if (uri) {
      params.uri = uri;
    }

    if (playQueueID) {
      params.playQueueID = playQueueID;
    }

    const queryString = this.buildQueryString(params);
    const response = await this.post<MediaContainer<Playlist>>(
      `/playlists${queryString}`,
      null
    );

    const playlists = response.Metadata || [];
    return playlists[0];
  }

  /**
   * Get a specific playlist by ID
   */
  async getPlaylist(playlistId: number): Promise<Playlist> {
    const response = await this.get<MediaContainer<Playlist>>(
      `/playlists/${playlistId}`
    );

    const playlists = response.Metadata || [];
    return playlists[0];
  }

  /**
   * Delete a playlist by ID
   */
  async deletePlaylist(playlistId: number): Promise<void> {
    await this.delete(`/playlists/${playlistId}`);
  }

  /**
   * Edit playlist metadata (title, etc.)
   */
  async editPlaylist(
    playlistId: number,
    updates: Record<string, any>
  ): Promise<Playlist> {
    const queryString = this.buildQueryString(updates);
    const response = await this.put<MediaContainer<Playlist>>(
      `/playlists/${playlistId}${queryString}`,
      null
    );

    const playlists = response.Metadata || [];
    return playlists[0];
  }

  /**
   * Clear a playlist (only works with dumb playlists)
   */
  async clearPlaylist(playlistId: number): Promise<Playlist> {
    const response = await this.delete<MediaContainer<Playlist>>(
      `/playlists/${playlistId}/items`
    );

    const playlists = response.Metadata || [];
    return playlists[0];
  }

  /**
   * Add items to a playlist
   * For dumb playlists: adds specified items
   * For smart playlists: replaces the rules
   * @param playlistId - Playlist ID
   * @param uri - Content URI for items to add (e.g., library://..., library://metadata/123)
   * @param playQueueID - Optional: Add existing play queue instead of URI
   */
  async addToPlaylist(
    playlistId: number,
    uri?: string,
    playQueueID?: number
  ): Promise<Playlist> {
    const params: any = {};

    if (uri) {
      params.uri = uri;
    }

    if (playQueueID) {
      params.playQueueID = playQueueID;
    }

    if (!uri && !playQueueID) {
      throw new Error('Either uri or playQueueID must be provided');
    }

    const queryString = this.buildQueryString(params);
    const response = await this.put<MediaContainer<Playlist>>(
      `/playlists/${playlistId}/items${queryString}`,
      null
    );

    const playlists = response.Metadata || [];
    return playlists[0];
  }

  /**
   * Get all generators in a smart playlist
   */
  async getPlaylistGenerators(
    playlistId: number
  ): Promise<PlaylistGenerator[]> {
    const response = await this.get<any>(
      `/playlists/${playlistId}/generators`
    );

    return response.PlayQueueGenerator || [];
  }

  /**
   * Get a specific generator from a smart playlist
   */
  async getPlaylistGenerator(
    playlistId: number,
    generatorId: number
  ): Promise<any> {
    const response = await this.get<any>(
      `/playlists/${playlistId}/generators/${generatorId}`
    );

    return response.Item || {};
  }

  /**
   * Get items for a specific generator
   */
  async getGeneratorItems(
    playlistId: number,
    generatorId: number,
    params?: PaginationParams
  ): Promise<any[]> {
    const queryString = this.buildQueryString({
      offset: params?.offset,
      limit: params?.limit,
    });

    const response = await this.get<any>(
      `/playlists/${playlistId}/generators/${generatorId}/items${queryString}`
    );

    return response.Metadata || [];
  }

  /**
   * Delete a generator from a smart playlist
   */
  async deleteGenerator(
    playlistId: number,
    generatorId: number
  ): Promise<Playlist> {
    const response = await this.delete<MediaContainer<Playlist>>(
      `/playlists/${playlistId}/generators/${generatorId}`
    );

    const playlists = response.Metadata || [];
    return playlists[0];
  }

  /**
   * Modify a generator (optimizer only)
   */
  async modifyGenerator(
    playlistId: number,
    generatorId: number,
    updates: Record<string, any>
  ): Promise<Playlist> {
    const queryString = this.buildQueryString(updates);
    const response = await this.put<MediaContainer<Playlist>>(
      `/playlists/${playlistId}/generators/${generatorId}${queryString}`,
      null
    );

    const playlists = response.Metadata || [];
    return playlists[0];
  }

  /**
   * Reprocess a generator (refresh it)
   */
  async reprocessGenerator(
    playlistId: number,
    generatorId: number,
    metadataId: number,
    action: 'reprocess' | 'disable' | 'enable'
  ): Promise<void> {
    const queryString = this.buildQueryString({
      action,
    });

    await this.put(
      `/playlists/${playlistId}/generators/${generatorId}/${metadataId}${queryString}`,
      null
    );
  }

  /**
   * Move an item within a playlist (dumb playlists only)
   * @param playlistId - Playlist ID
   * @param playlistItemId - Item to move
   * @param afterItemId - Optional: Move after this item; if not provided, moves to beginning
   */
  async movePlaylistItem(
    playlistId: number,
    playlistItemId: number,
    afterItemId?: number
  ): Promise<Playlist> {
    const params: any = {
      after: afterItemId,
    };

    const queryString = this.buildQueryString(params);
    const response = await this.put<MediaContainer<Playlist>>(
      `/playlists/${playlistId}/items/${playlistItemId}${queryString}`,
      null
    );

    const playlists = response.Metadata || [];
    return playlists[0];
  }

  /**
   * Get items in a playlist
   */
  async getPlaylistItems(
    playlistId: number,
    params?: PaginationParams
  ): Promise<any[]> {
    const queryString = this.buildQueryString({
      offset: params?.offset,
      limit: params?.limit,
    });

    const response = await this.get<MediaContainer<any>>(
      `/playlists/${playlistId}/items${queryString}`
    );

    return response.Metadata || [];
  }

  /**
   * Remove an item from a playlist (dumb playlists only)
   */
  async removeFromPlaylist(
    playlistId: number,
    playlistItemId: number
  ): Promise<Playlist> {
    const response = await this.delete<MediaContainer<Playlist>>(
      `/playlists/${playlistId}/items/${playlistItemId}`
    );

    const playlists = response.Metadata || [];
    return playlists[0];
  }

  /**
   * Upload m3u playlists from server path
   * @param path - Absolute path to file or directory on server
   * @param force - 0 = create new with timestamp suffix for duplicates, 1 = overwrite
   */
  async uploadPlaylists(path: string, force: 0 | 1 = 1): Promise<void> {
    const queryString = this.buildQueryString({
      path,
      force,
    });

    await this.post(`/playlists/upload${queryString}`, null);
  }
}

/**
 * Factory function to create Playlists API instance
 */
export function createPlaylistsApi(
  config: ApiClientConfig
): PlaylistsApi {
  return new PlaylistsApi(config);
}
