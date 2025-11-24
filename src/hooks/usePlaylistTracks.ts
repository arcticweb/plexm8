import { useEffect, useState } from 'react';
import { useAuthStore, getOrCreateClientId } from '../utils/storage';
import { useServerStore } from '../utils/serverContext';
import { selectBestConnection } from '../utils/connectionSelector';
import { getPlaylistsProxyUrl } from '../utils/backendDetector';
import axios from 'axios';

/**
 * Track metadata from Plex
 */
export interface Track {
  key: string;
  title: string;
  artist?: string;
  artistKey?: string;
  album?: string;
  albumKey?: string;
  thumb?: string;
  duration?: number;
  index?: number;
  year?: number;
  rating?: number;
  userRating?: number;
  playlistItemID?: number;
  // Media information for streaming
  Media?: Array<{
    Part?: Array<{
      key?: string;
      file?: string;
      size?: number;
      container?: string;
    }>;
  }>;
}

/**
 * Detailed playlist information with tracks
 */
export interface PlaylistDetail {
  key: string;
  title: string;
  summary?: string;
  type?: string;
  smart?: number;
  leafCount?: number;
  duration?: number;
  thumb?: string;
  composite?: string;
  tracks: Track[];
}

interface PlexPlaylistDetailResponse {
  MediaContainer?: {
    Metadata?: Array<{
      ratingKey?: string;
      key?: string;
      guid?: string;
      type?: string;
      title?: string;
      grandparentTitle?: string; // Artist
      parentTitle?: string; // Album
      grandparentKey?: string;
      parentKey?: string;
      thumb?: string;
      parentThumb?: string;
      grandparentThumb?: string;
      duration?: number;
      index?: number;
      year?: number;
      rating?: number;
      userRating?: number;
      playlistItemID?: number;
      // Media parts (like python-plexapi Audio.Media)
      Media?: Array<{
        Part?: Array<{
          key?: string;
          file?: string;
          size?: number;
          container?: string;
        }>;
      }>;
    }>;
    title1?: string;
    title2?: string;
    summary?: string;
    smart?: number;
    leafCount?: number;
    duration?: number;
    thumb?: string;
    composite?: string;
  };
}

/**
 * Hook to fetch tracks from a specific playlist
 * 
 * @param playlistKey - The Plex key for the playlist (e.g., "/playlists/12345")
 * @returns Playlist details with tracks, loading state, and error
 */
export function usePlaylistTracks(playlistKey: string | null) {
  const { token } = useAuthStore();
  const { getSelectedServer } = useServerStore();
  const [playlistDetail, setPlaylistDetail] = useState<PlaylistDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylistTracks = async () => {
    if (!token || !playlistKey) {
      setError('Missing authentication or playlist key');
      return;
    }

    const selectedServer = getSelectedServer();
    if (!selectedServer) {
      setError('No server selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const clientId = getOrCreateClientId();

      // Get best connection URL
      const serverUrl = selectBestConnection(selectedServer);

      if (!serverUrl) {
        setError('No valid connection found for selected server');
        return;
      }

      // Build endpoint path for playlist items
      // Plex API: GET /playlists/{playlistId}/items
      // Note: playlistKey already includes the full path (e.g., "/playlists/42850/items")
      const endpointPath = playlistKey;

      let data: PlexPlaylistDetailResponse;

      try {
        // Try proxy first (for CORS)
        const proxyUrl = await getPlaylistsProxyUrl(
          serverUrl,
          selectedServer.accessToken || token,
          clientId,
          endpointPath
        );

        const response = await axios.get(proxyUrl);
        data = response.data as PlexPlaylistDetailResponse;
      } catch (proxyError: any) {
        // If proxy fails (e.g., 6MB limit), try direct Plex API
        // This works because we have valid authentication
        console.warn('Proxy failed, attempting direct Plex connection:', proxyError.message);
        
        const directUrl = `${serverUrl}${endpointPath}?X-Plex-Token=${selectedServer.accessToken || token}`;
        const directResponse = await axios.get(directUrl, {
          headers: {
            'Accept': 'application/json',
          },
        });
        data = directResponse.data as PlexPlaylistDetailResponse;
      }

      if (!data.MediaContainer) {
        setError('Invalid response from server');
        return;
      }

      // Parse tracks from response
      const tracks: Track[] = (data.MediaContainer.Metadata || []).map((track) => ({
        key: track.ratingKey || track.key || '',
        title: track.title || 'Unknown Track',
        artist: track.grandparentTitle,
        artistKey: track.grandparentKey,
        album: track.parentTitle,
        albumKey: track.parentKey,
        thumb: track.thumb || track.parentThumb || track.grandparentThumb,
        duration: track.duration,
        index: track.index,
        year: track.year,
        rating: track.rating,
        userRating: track.userRating,
        playlistItemID: track.playlistItemID,
        // Extract Media parts for streaming (like python-plexapi does)
        Media: track.Media,
      }));

      // Calculate total duration if not provided by API
      const totalDuration = data.MediaContainer.duration || 
        tracks.reduce((sum, track) => sum + (track.duration || 0), 0);

      // Build playlist detail object
      const detail: PlaylistDetail = {
        key: playlistKey,
        title: data.MediaContainer.title1 || 'Playlist',
        summary: data.MediaContainer.summary,
        type: data.MediaContainer.title2,
        smart: data.MediaContainer.smart,
        leafCount: data.MediaContainer.leafCount,
        duration: totalDuration,
        thumb: data.MediaContainer.thumb,
        composite: data.MediaContainer.composite,
        tracks,
      };

      setPlaylistDetail(detail);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch playlist tracks';
      console.error('Error fetching playlist tracks:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when playlistKey changes
  useEffect(() => {
    if (playlistKey) {
      fetchPlaylistTracks();
    } else {
      setPlaylistDetail(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistKey, token, getSelectedServer()?.clientIdentifier]);

  return {
    playlistDetail,
    loading,
    error,
    refetch: fetchPlaylistTracks,
  };
}

/**
 * Format duration in milliseconds to MM:SS format
 */
export function formatDuration(ms: number | undefined): string {
  if (!ms) return '0:00';
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format total playlist duration to human-readable format
 */
export function formatTotalDuration(ms: number | undefined): string {
  if (!ms) return '0 min';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins} min`;
}

/**
 * Get full artwork URL from Plex server
 */
export function getArtworkUrl(
  serverUrl: string,
  thumbPath: string | undefined,
  token: string
): string | undefined {
  if (!thumbPath) return undefined;
  // Plex thumbnail paths are relative, need to prepend server URL
  return `${serverUrl}${thumbPath}?X-Plex-Token=${token}`;
}
