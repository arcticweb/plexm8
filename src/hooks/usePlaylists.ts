import { useEffect, useState } from 'react';
import { useAuthStore, getOrCreateClientId } from '../utils/storage';
import { useServerStore } from '../utils/serverContext';
import { selectBestConnection } from '../utils/connectionSelector';
import { plexFetch } from '../utils/plexFetch';

export interface Playlist {
  key: string;
  title: string;
  type?: string;
  smart?: number;
  summary?: string;
  leafCount?: number;
  thumb?: string;
  icon?: string;
  createdAt?: number;
  updatedAt?: number;
}

interface PlexPlaylistResponse {
  MediaContainer?: {
    Metadata?: Array<{
      key?: string;
      title?: string;
      type?: string;
      smart?: number;
      summary?: string;
      leafCount?: number;
      thumb?: string;
      icon?: string;
      addedAt?: number;
      updatedAt?: number;
    }>;
  };
}

/**
 * Hook to fetch playlists from Plex server
 * Queries the user's available playlists
 */
export function usePlaylists() {
  const { token } = useAuthStore();
  const { getSelectedServer } = useServerStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylists = async () => {
    if (!token) {
      setError('No authentication token available');
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

      // Use smart connection selector to pick best URL
      // (local IP for dev, public IP for production)
      const serverUrl = selectBestConnection(selectedServer);

      if (!serverUrl) {
        setError('No valid connection found for selected server');
        return;
      }

      // Use direct fetch with custom Plex headers to bypass CORS
      // Same approach as FLAC playback - works from browser
      const playlistsUrl = `${serverUrl}/playlists`;
      
      console.log('[Playlists] Fetching directly with custom headers:', playlistsUrl);
      
      const data = await plexFetch(playlistsUrl, {
        token: selectedServer.accessToken || token,
        clientId,
      }) as PlexPlaylistResponse;

      const fetchedPlaylists = (data as PlexPlaylistResponse)
        .MediaContainer?.Metadata?.map((p) => ({
          key: p.key || '',
          title: p.title || 'Untitled',
          type: p.type,
          smart: p.smart,
          summary: p.summary,
          leafCount: p.leafCount,
          thumb: p.thumb,
          icon: p.icon,
          createdAt: p.addedAt,
          updatedAt: p.updatedAt,
        })) || [];

      setPlaylists(fetchedPlaylists);
    } catch (err) {
      let message = err instanceof Error ? err.message : 'Failed to fetch playlists';
      
      // Provide helpful error messages for common issues
      if (err instanceof Error) {
        if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
          message = 'Network error: Cannot connect to Plex server. ' +
                   'Check your network connection and Plex server status.';
        } else if (message.includes('timeout')) {
          message = 'Connection timeout: Plex server is not responding.';
        } else if (message.includes('401')) {
          message = 'Authentication failed: Invalid Plex token. Please log in again.';
        }
      }
      
      console.error('Error fetching playlists:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch playlists when token or selected server changes
  useEffect(() => {
    if (token) {
      fetchPlaylists();
    }
  }, [token, getSelectedServer()?.clientIdentifier]);

  return { playlists, loading, error, refetch: fetchPlaylists };
}
