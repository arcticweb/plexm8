/**
 * Plex Status API Client
 * Handles playback sessions, history, and background tasks
 */

import { PlexApiClient, ApiClientConfig } from './base';
import {
  PlaybackSession,
  PlaybackHistory,
  BackgroundTask,
  MediaContainer,
  PaginationParams,
} from './types';

/**
 * Status API operations (sessions, history, tasks)
 */
export class StatusApi extends PlexApiClient {
  constructor(config: ApiClientConfig) {
    super(config);
  }

  /**
   * Get all current playback sessions
   */
  async getSessions(): Promise<PlaybackSession[]> {
    const response = await this.get<MediaContainer<PlaybackSession>>(
      `/status/sessions`
    );

    return response.Metadata || [];
  }

  /**
   * Get background tasks (transcode jobs, optimization, etc.)
   */
  async getBackgroundTasks(): Promise<BackgroundTask[]> {
    const response = await this.get<any>(`/status/backgroundTasks`);

    return response.TranscodeJob || [];
  }

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
  async getPlaybackHistory(
    params?: Record<string, any> & PaginationParams
  ): Promise<PlaybackHistory[]> {
    const queryString = this.buildQueryString(params || {});
    const response = await this.get<MediaContainer<PlaybackHistory>>(
      `/status/sessions/history/all${queryString}`
    );

    return response.Metadata || [];
  }

  /**
   * Get playback history for current user
   */
  async getMyPlaybackHistory(
    params?: Record<string, any> & PaginationParams
  ): Promise<PlaybackHistory[]> {
    const queryString = this.buildQueryString(params || {});
    const response = await this.get<MediaContainer<PlaybackHistory>>(
      `/status/sessions/history${queryString}`
    );

    return response.Metadata || [];
  }

  /**
   * Get a single history item by ID
   */
  async getHistoryItem(historyId: number): Promise<PlaybackHistory> {
    const response = await this.get<MediaContainer<PlaybackHistory>>(
      `/status/sessions/history/${historyId}`
    );

    const items = response.Metadata || [];
    return items[0];
  }

  /**
   * Get playback history for a specific account
   */
  async getAccountPlaybackHistory(
    accountID: number,
    params?: Record<string, any> & PaginationParams
  ): Promise<PlaybackHistory[]> {
    const allParams = {
      accountID,
      ...params,
    };

    return this.getPlaybackHistory(allParams);
  }

  /**
   * Get playback history for a specific library section
   */
  async getLibrarySectionHistory(
    librarySectionID: number,
    params?: Record<string, any> & PaginationParams
  ): Promise<PlaybackHistory[]> {
    const allParams = {
      librarySectionID,
      ...params,
    };

    return this.getPlaybackHistory(allParams);
  }

  /**
   * Get playback history for a specific item (or all episodes of a show)
   */
  async getItemPlaybackHistory(
    metadataItemID: number,
    params?: Record<string, any> & PaginationParams
  ): Promise<PlaybackHistory[]> {
    const allParams = {
      metadataItemID,
      ...params,
    };

    return this.getPlaybackHistory(allParams);
  }
}

/**
 * Factory function to create Status API instance
 */
export function createStatusApi(
  config: ApiClientConfig
): StatusApi {
  return new StatusApi(config);
}
