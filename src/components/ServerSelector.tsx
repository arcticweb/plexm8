import { useState } from 'react';
import { useServerStore } from '../utils/serverContext';
import { useAuthStore, getOrCreateClientId } from '../utils/storage';
import axios from 'axios';
import { PLEX_CONFIG, buildPlexHeaders } from '../config/plex.config';

/**
 * Server Selector Component
 * 
 * Sticky menu for selecting which Plex server to use
 * Fetches and displays all accessible servers
 */

export default function ServerSelector() {
  const { token } = useAuthStore();
  const { servers, selectedServerId, setServers, selectServer } = useServerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedServer = servers.find((s) => s.clientIdentifier === selectedServerId);

  const fetchServers = async () => {
    if (!token) {
      setError('Not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const clientId = getOrCreateClientId();

      const response = await axios.get(
        `${PLEX_CONFIG.api.clients}/resources?includeHttps=1&includeRelay=1&includeIPv6=1`,
        {
          headers: buildPlexHeaders(token, clientId),
        }
      );

      // Response is an array at root level, not under MediaContainer
      // Show all devices that provide server capability (includes online and offline servers)
      const fetchedServers = (Array.isArray(response.data) ? response.data : response.data?.MediaContainer?.Device || [])
        .filter((device: any) => device.provides && device.provides.includes('server'));

      if (fetchedServers.length === 0) {
        setError('No Plex servers found');
        return;
      }

      setServers(fetchedServers);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch servers';
      console.error('Error fetching servers:', err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch servers on first open
  const handleOpen = async () => {
    if (!isOpen && servers.length === 0) {
      await fetchServers();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="server-selector">
      <button
        className="server-selector-button"
        onClick={handleOpen}
        title="Select Plex server"
      >
        <span className="server-icon">📺</span>
        <span className="server-name">
          {selectedServer ? selectedServer.name : 'Select Server'}
        </span>
        <span className="server-dropdown-icon">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="server-selector-menu">
          <div className="server-menu-header">
            <h3>Plex Servers</h3>
            <button
              className="server-refresh-button"
              onClick={fetchServers}
              disabled={isLoading}
              title="Refresh servers"
            >
              {isLoading ? '⟳' : '↻'}
            </button>
          </div>

          {error && (
            <div className="server-menu-error">
              <p>{error}</p>
              <button onClick={fetchServers}>Retry</button>
            </div>
          )}

          {servers.length > 0 ? (
            <div className="server-menu-list">
              {servers.map((server) => {
                const isOffline = !server.presence;
                return (
                <button
                  key={server.clientIdentifier}
                  className={`server-menu-item ${
                    server.clientIdentifier === selectedServerId ? 'selected' : ''
                  } ${isOffline ? 'offline' : ''}`}
                  onClick={() => {
                    if (!isOffline) {
                      selectServer(server.clientIdentifier);
                      setIsOpen(false);
                    }
                  }}
                  disabled={isOffline}
                  title={isOffline ? 'Server is offline' : `Select ${server.name}`}
                >
                  <div className="server-item-main">
                    <span className="server-item-name">{server.name}</span>
                    <span className="server-item-product">{server.product}</span>
                  </div>
                  <div className="server-item-meta">
                    <span className="server-item-version">v{server.productVersion}</span>
                    <span className="server-item-device">{server.device}</span>
                    {isOffline && <span className="server-item-status">⊖ Offline</span>}
                  </div>
                </button>
                );
              })}
            </div>
          ) : !isLoading && !error ? (
            <div className="server-menu-empty">
              <p>No servers found</p>
              <button onClick={fetchServers}>Search</button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
