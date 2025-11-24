import { useEffect, useState } from 'react';
import { useAuthStore, getOrCreateClientId } from '../utils/storage';
import { useServerStore } from '../utils/serverContext';
import { selectBestConnection } from '../utils/connectionSelector';
import { plexFetch } from '../utils/plexFetch';

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
 * Uses API-level pagination for large playlists:
 * - Initial load: First 100 tracks for instant UI
 * - Background: Remaining tracks loaded in batches
 * 
 * @param playlistKey - The Plex key for the playlist (e.g., "/playlists/12345")
 * @param trackCount - Optional track count to optimize fetching (skip proxy for large playlists)
 * @returns Playlist details with tracks, loading state, and error
 */
export function usePlaylistTracks(playlistKey: string | null, trackCount?: number) {
  const { token } = useAuthStore();
  const { getSelectedServer } = useServerStore();
  const [playlistDetail, setPlaylistDetail] = useState<PlaylistDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<{ loaded: number; total: number } | null>(null);
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
      const serverUrl = selectBestConnection(selectedServer);

      if (!serverUrl) {
        setError('No valid connection found for selected server');
        return;
      }

      const endpointPath = playlistKey;
      const authToken = selectedServer.accessToken || token;

      // Batch size for API pagination
      const BATCH_SIZE = 500;
      const LARGE_PLAYLIST_THRESHOLD = 1000;
      
      // For large playlists, use API-level pagination
      const shouldUseBatchLoading = trackCount !== undefined && trackCount > LARGE_PLAYLIST_THRESHOLD;

      if (shouldUseBatchLoading) {
        console.log(`[Playlist] Large playlist (${trackCount} tracks) - using batched API loading`);
        
        // Fetch first batch immediately for instant UI
        const firstBatchUrl = `${serverUrl}${endpointPath}?X-Plex-Container-Start=0&X-Plex-Container-Size=${BATCH_SIZE}`;
        const startTime = Date.now();
        const firstData = await plexFetch(firstBatchUrl, {
          token: authToken,
          clientId,
        }) as PlexPlaylistDetailResponse;

        if (!firstData.MediaContainer) {
          setError('Invalid response from server');
          return;
        }

        // Helper to extract filename from media
        const getFileName = (track: any): string => {
          const file = track.Media?.[0]?.Part?.[0]?.file || track.Media?.[0]?.Part?.[0]?.key || '';
          if (!file) return 'Unknown Track';
          // Extract just the filename without path
          const parts = file.split(/[/\\]/);
          const filename = parts[parts.length - 1];
          // Remove extension for cleaner display
          return filename.replace(/\.[^.]+$/, '');
        };

        // Parse first batch
        let allTracks: Track[] = (firstData.MediaContainer.Metadata || []).map((track) => ({
          key: track.ratingKey || track.key || '',
          title: track.title || getFileName(track),
          artist: track.grandparentTitle || 'Unknown Artist',
          artistKey: track.grandparentKey,
          album: track.parentTitle || 'Unknown Album',
          albumKey: track.parentKey,
          thumb: track.thumb || track.parentThumb || track.grandparentThumb,
          duration: track.duration,
          index: track.index,
          year: track.year,
          rating: track.rating,
          userRating: track.userRating,
          playlistItemID: track.playlistItemID,
          Media: track.Media,
        }));

        // Set initial state with first batch (instant UI feedback)
        const initialDetail: PlaylistDetail = {
          key: playlistKey,
          title: firstData.MediaContainer.title1 || 'Playlist',
          summary: firstData.MediaContainer.summary,
          type: firstData.MediaContainer.title2,
          smart: firstData.MediaContainer.smart,
          leafCount: firstData.MediaContainer.leafCount,
          duration: firstData.MediaContainer.duration,
          thumb: firstData.MediaContainer.thumb,
          composite: firstData.MediaContainer.composite,
          tracks: allTracks,
        };
        setPlaylistDetail(initialDetail);
        setLoadingProgress({ loaded: allTracks.length, total: trackCount });

        console.log(`[Playlist] Loaded first ${allTracks.length} tracks in ${Date.now() - startTime}ms`);

        // Fetch remaining batches in background
        const totalBatches = Math.ceil(trackCount / BATCH_SIZE);
        for (let batchIndex = 1; batchIndex < totalBatches; batchIndex++) {
          const offset = batchIndex * BATCH_SIZE;
          const batchUrl = `${serverUrl}${endpointPath}?X-Plex-Container-Start=${offset}&X-Plex-Container-Size=${BATCH_SIZE}`;
          
          const batchData = await plexFetch(batchUrl, {
            token: authToken,
            clientId,
          }) as PlexPlaylistDetailResponse;

          const batchTracks: Track[] = (batchData.MediaContainer?.Metadata || []).map((track) => ({
            key: track.ratingKey || track.key || '',
            title: track.title || getFileName(track),
            artist: track.grandparentTitle || 'Unknown Artist',
            artistKey: track.grandparentKey,
            album: track.parentTitle || 'Unknown Album',
            albumKey: track.parentKey,
            thumb: track.thumb || track.parentThumb || track.grandparentThumb,
            duration: track.duration,
            index: track.index,
            year: track.year,
            rating: track.rating,
            userRating: track.userRating,
            playlistItemID: track.playlistItemID,
            Media: track.Media,
          }));

          allTracks = [...allTracks, ...batchTracks];

          // Update state progressively
          setPlaylistDetail({
            ...initialDetail,
            tracks: allTracks,
          });
          setLoadingProgress({ loaded: allTracks.length, total: trackCount });

          console.log(`[Playlist] Loaded batch ${batchIndex + 1}/${totalBatches} (${allTracks.length}/${trackCount} tracks)`);
        }

        console.log(`[Playlist] Completed loading all ${allTracks.length} tracks in ${Date.now() - startTime}ms`);
        setLoadingProgress(null);
      } else {
        // Small playlist - load all at once
        const directUrl = `${serverUrl}${endpointPath}`;
        
        const data = await plexFetch(directUrl, {
          token: authToken,
          clientId,
        }) as PlexPlaylistDetailResponse;

        if (!data.MediaContainer) {
          setError('Invalid response from server');
          return;
        }

        // Helper to extract filename from media (for tracks without metadata)
        const getFileName = (track: any): string => {
          const file = track.Media?.[0]?.Part?.[0]?.file || track.Media?.[0]?.Part?.[0]?.key || '';
          if (!file) return 'Unknown Track';
          const parts = file.split(/[/\\]/);
          const filename = parts[parts.length - 1];
          return filename.replace(/\.[^.]+$/, '');
        };

        const tracks: Track[] = (data.MediaContainer.Metadata || []).map((track) => ({
          key: track.ratingKey || track.key || '',
          title: track.title || getFileName(track),
          artist: track.grandparentTitle || 'Unknown Artist',
          artistKey: track.grandparentKey,
          album: track.parentTitle || 'Unknown Album',
          albumKey: track.parentKey,
          thumb: track.thumb || track.parentThumb || track.grandparentThumb,
          duration: track.duration,
          index: track.index,
          year: track.year,
          rating: track.rating,
          userRating: track.userRating,
          playlistItemID: track.playlistItemID,
          Media: track.Media,
        }));

        const totalDuration = data.MediaContainer.duration || 
          tracks.reduce((sum, track) => sum + (track.duration || 0), 0);

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
      }
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
    loadingProgress,
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
