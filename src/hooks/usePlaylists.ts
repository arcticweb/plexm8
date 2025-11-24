import { useEffect, useState } from 'react';
import { useAuthStore, getOrCreateClientId } from '../utils/storage';
import axios from 'axios';
import { PLEX_CONFIG, fillEndpointParams, buildPlexHeaders } from '../config/plex.config';

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
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylists = async () => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const clientId = getOrCreateClientId();

      // First, get the user's resources (Plex servers)
      const resourcesResponse = await axios.get(
        `${PLEX_CONFIG.api.clients}/resources?includeHttps=1&includeRelay=1&includeIPv6=1`,
        {
          headers: buildPlexHeaders(token, clientId),
        }
      );

      const resources = resourcesResponse.data?.MediaContainer?.Device || [];
      if (resources.length === 0) {
        setError('No Plex servers found');
        return;
      }

      // Get the first server (primary)
      const server = resources[0];
      const serverAccessToken = server.accessToken;
      
      // Get connection URL (prefer local)
      let serverUrl = server.baseuri;
      if (server.Connection && Array.isArray(server.Connection)) {
        const localConnection = server.Connection.find((c: any) => c.local === '1');
        if (localConnection) {
          serverUrl = localConnection.uri;
        } else {
          serverUrl = server.Connection[0]?.uri || serverUrl;
        }
      }

      // Now fetch playlists from the server
      const playlistsEndpoint = fillEndpointParams(PLEX_CONFIG.playlists.list, {});
      const playlistsResponse = await axios.get(
        `${serverUrl}${playlistsEndpoint}`,
        {
          headers: buildPlexHeaders(serverAccessToken || token, clientId),
        }
      );

      const fetchedPlaylists = (playlistsResponse.data as PlexPlaylistResponse)
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

  // Fetch playlists on mount or when token changes
  useEffect(() => {
    if (token) {
      fetchPlaylists();
    }
  }, [token]);

  return { playlists, loading, error, refetch: fetchPlaylists };
}
