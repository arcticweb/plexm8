/**
 * Plex Playlists API Client
 * Handles all playlist operations (create, read, update, delete, manage items)
 */
import { PlexApiClient, ApiClientConfig } from './base';
import { Playlist, PaginationParams, PlaylistGenerator } from './types';
/**
 * Playlists API operations
 */
export declare class PlaylistsApi extends PlexApiClient {
    constructor(config: ApiClientConfig);
    /**
     * Get all playlists
     * Includes both smart and dumb playlists
     */
    getPlaylists(params?: PaginationParams): Promise<Playlist[]>;
    /**
     * Create a new blank playlist
     * @param title - Name of the playlist
     * @param playlistType - 'audio', 'video', or 'photo'
     * @param uri - Optional: Content URI for what to add (e.g., library://...)
     * @param playQueueID - Optional: Create from existing play queue
     */
    createPlaylist(title: string, playlistType?: 'audio' | 'video' | 'photo', uri?: string, playQueueID?: number): Promise<Playlist>;
    /**
     * Get a specific playlist by ID
     */
    getPlaylist(playlistId: number): Promise<Playlist>;
    /**
     * Delete a playlist by ID
     */
    deletePlaylist(playlistId: number): Promise<void>;
    /**
     * Edit playlist metadata (title, etc.)
     */
    editPlaylist(playlistId: number, updates: Record<string, any>): Promise<Playlist>;
    /**
     * Clear a playlist (only works with dumb playlists)
     */
    clearPlaylist(playlistId: number): Promise<Playlist>;
    /**
     * Add items to a playlist
     * For dumb playlists: adds specified items
     * For smart playlists: replaces the rules
     * @param playlistId - Playlist ID
     * @param uri - Content URI for items to add (e.g., library://..., library://metadata/123)
     * @param playQueueID - Optional: Add existing play queue instead of URI
     */
    addToPlaylist(playlistId: number, uri?: string, playQueueID?: number): Promise<Playlist>;
    /**
     * Get all generators in a smart playlist
     */
    getPlaylistGenerators(playlistId: number): Promise<PlaylistGenerator[]>;
    /**
     * Get a specific generator from a smart playlist
     */
    getPlaylistGenerator(playlistId: number, generatorId: number): Promise<any>;
    /**
     * Get items for a specific generator
     */
    getGeneratorItems(playlistId: number, generatorId: number, params?: PaginationParams): Promise<any[]>;
    /**
     * Delete a generator from a smart playlist
     */
    deleteGenerator(playlistId: number, generatorId: number): Promise<Playlist>;
    /**
     * Modify a generator (optimizer only)
     */
    modifyGenerator(playlistId: number, generatorId: number, updates: Record<string, any>): Promise<Playlist>;
    /**
     * Reprocess a generator (refresh it)
     */
    reprocessGenerator(playlistId: number, generatorId: number, metadataId: number, action: 'reprocess' | 'disable' | 'enable'): Promise<void>;
    /**
     * Move an item within a playlist (dumb playlists only)
     * @param playlistId - Playlist ID
     * @param playlistItemId - Item to move
     * @param afterItemId - Optional: Move after this item; if not provided, moves to beginning
     */
    movePlaylistItem(playlistId: number, playlistItemId: number, afterItemId?: number): Promise<Playlist>;
    /**
     * Get items in a playlist
     */
    getPlaylistItems(playlistId: number, params?: PaginationParams): Promise<any[]>;
    /**
     * Remove an item from a playlist (dumb playlists only)
     */
    removeFromPlaylist(playlistId: number, playlistItemId: number): Promise<Playlist>;
    /**
     * Upload m3u playlists from server path
     * @param path - Absolute path to file or directory on server
     * @param force - 0 = create new with timestamp suffix for duplicates, 1 = overwrite
     */
    uploadPlaylists(path: string, force?: 0 | 1): Promise<void>;
}
/**
 * Factory function to create Playlists API instance
 */
export declare function createPlaylistsApi(config: ApiClientConfig): PlaylistsApi;
//# sourceMappingURL=playlists.d.ts.map