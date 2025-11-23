/**
 * Plex Status API Client
 * Handles playback sessions, history, and background tasks
 */
import { PlexApiClient, ApiClientConfig } from './base';
import { PlaybackSession, PlaybackHistory, BackgroundTask, PaginationParams } from './types';
/**
 * Status API operations (sessions, history, tasks)
 */
export declare class StatusApi extends PlexApiClient {
    constructor(config: ApiClientConfig);
    /**
     * Get all current playback sessions
     */
    getSessions(): Promise<PlaybackSession[]>;
    /**
     * Get background tasks (transcode jobs, optimization, etc.)
     */
    getBackgroundTasks(): Promise<BackgroundTask[]>;
    /**
     * Get playback history
     * @param params - Filter parameters
     *   - accountID: Filter by account
     *   - viewedAt: Time filter (e.g., "viewedAt>=1234567890")
     *   - librarySectionID: Filter by library section
     *   - metadataItemID: Filter by specific item or show
     *   - sort: Sort field (e.g., "viewedAt:desc")
     *   - offset: Pagination offset
     *   - limit: Pagination limit
     */
    getPlaybackHistory(params?: Record<string, any> & PaginationParams): Promise<PlaybackHistory[]>;
    /**
     * Get playback history for current user
     */
    getMyPlaybackHistory(params?: Record<string, any> & PaginationParams): Promise<PlaybackHistory[]>;
    /**
     * Get a single history item by ID
     */
    getHistoryItem(historyId: number): Promise<PlaybackHistory>;
    /**
     * Get playback history for a specific account
     */
    getAccountPlaybackHistory(accountID: number, params?: Record<string, any> & PaginationParams): Promise<PlaybackHistory[]>;
    /**
     * Get playback history for a specific library section
     */
    getLibrarySectionHistory(librarySectionID: number, params?: Record<string, any> & PaginationParams): Promise<PlaybackHistory[]>;
    /**
     * Get playback history for a specific item (or all episodes of a show)
     */
    getItemPlaybackHistory(metadataItemID: number, params?: Record<string, any> & PaginationParams): Promise<PlaybackHistory[]>;
}
/**
 * Factory function to create Status API instance
 */
export declare function createStatusApi(config: ApiClientConfig): StatusApi;
//# sourceMappingURL=status.d.ts.map