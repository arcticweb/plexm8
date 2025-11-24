/**
 * Plex API Type Definitions
 * Shared types across all API operations
 */
/**
 * Standard Plex API response wrapper
 */
export interface MediaContainer<T> {
    size: number;
    totalSize?: number;
    offset?: number;
    [key: string]: any;
    Metadata?: T[];
}
/**
 * Plex Playlist metadata
 */
export interface Playlist {
    key: string;
    ratingKey: string;
    title: string;
    type: string;
    composite: string;
    icon?: string;
    duration?: number;
    addedAt: number;
    updatedAt: number;
    leafCount: number;
    smart?: boolean;
    playlistType: 'audio' | 'video' | 'photo';
    guid?: string;
}
/**
 * Collection metadata
 */
export interface Collection {
    key: string;
    title: string;
    type: string;
    composite: string;
    art: string;
    thumb?: string;
    addedAt: number;
    updatedAt: number;
    contentRating?: string;
    summary?: string;
    childCount: number;
}
/**
 * Generic metadata item (movie, show, music, etc.)
 */
export interface MediaItem {
    key: string;
    ratingKey: string;
    title: string;
    type: string;
    thumb?: string;
    art?: string;
    summary?: string;
    duration?: number;
    year?: number;
    tagline?: string;
}
/**
 * Playback session
 */
export interface PlaybackSession {
    key: string;
    title: string;
    type: string;
    user: {
        id: number;
        title: string;
    };
    player: {
        title: string;
        machineIdentifier: string;
        protocolVersion: string;
        protocolCapabilities: string;
    };
    metadata: {
        key: string;
        title: string;
        type: string;
    };
    viewOffset: number;
    duration: number;
}
/**
 * Playback history item
 */
export interface PlaybackHistory {
    id: string;
    key: string;
    ratingKey: string;
    title: string;
    type: string;
    thumb?: string;
    viewedAt: number;
    accountID?: number;
    librarySectionID?: number;
}
/**
 * Background task (transcode job, optimization, etc.)
 */
export interface BackgroundTask {
    key: string;
    title: string;
    type: string;
    progress: number;
    [key: string]: any;
}
/**
 * Playlist generator for smart playlists
 */
export interface PlaylistGenerator {
    key: string;
    title: string;
    type: string;
    uri: string;
}
/**
 * Error response from Plex API
 */
export interface PlexError {
    error: string;
    code: number;
    message?: string;
}
/**
 * Pagination parameters
 */
export interface PaginationParams {
    offset?: number;
    limit?: number;
    sort?: string;
}
/**
 * Filter parameters for various endpoints
 */
export interface FilterParams {
    [key: string]: string | number | boolean;
}
