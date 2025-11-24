import { useEffect, useState } from 'react';
import { useAuthStore, getOrCreateClientId } from '../utils/storage';
import { useServerStore } from '../utils/serverContext';
import { selectBestConnection } from '../utils/connectionSelector';
import { getPlaylistsProxyUrl } from '../utils/backendDetector';
import axios from 'axios';

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

      // Automatically detect and use the best available backend
      // (Netlify Functions in production, Python backend in local dev, or direct)
      const proxyUrl = await getPlaylistsProxyUrl(
        serverUrl,
        selectedServer.accessToken || token,
        clientId
      );

      const proxyResponse = await axios.get(proxyUrl);

      const fetchedPlaylists = (proxyResponse.data as PlexPlaylistResponse)
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
      const message = err instanceof Error ? err.message : 'Failed to fetch playlists';
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
