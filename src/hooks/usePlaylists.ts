import { useEffect, useState } from 'react';
import { useAuthStore, getOrCreateClientId } from '../utils/storage';
import { useServerStore } from '../utils/serverContext';
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

      // Get connection URL (prefer local)
      let serverUrl = selectedServer.connections?.[0]?.uri;
      if (selectedServer.connections && Array.isArray(selectedServer.connections)) {
        const localConnection = selectedServer.connections.find((c) => c.local === true);
        if (localConnection) {
          serverUrl = localConnection.uri;
        } else {
          serverUrl = selectedServer.connections[0]?.uri;
        }
      }

      if (!serverUrl) {
        setError('No valid connection found for selected server');
        return;
      }

      // Route through Netlify Function proxy to bypass CORS restrictions
      // Encode serverUrl as base64 for safe query parameter passing
      // Use btoa() for browser compatibility (instead of Buffer.from() which is Node.js only)
      const encodedServerUrl = btoa(serverUrl);

      const proxyResponse = await axios.get('/.netlify/functions/plex-proxy', {
        params: {
          endpoint: 'playlists',
          serverUrl: encodedServerUrl,
          token: selectedServer.accessToken || token,
          clientId,
        },
      });

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
