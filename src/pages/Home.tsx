import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/storage';
import { usePlaylists } from '../hooks/usePlaylists';
import ServerSelector from '../components/ServerSelector';

/**
 * Home Page
 * 
 * Main dashboard showing all playlists from the selected Plex server.
 */

export default function Home() {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const { playlists, loading, error, refetch } = usePlaylists();
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const handleLogout = () => {
    clearAuth();
  };

  const handlePlaylistClick = (playlistKey: string, trackCount?: number) => {
    setSelectedPlaylist(playlistKey);
    const encodedKey = encodeURIComponent(playlistKey);
    navigate(`/playlists/${encodedKey}`, { 
      state: { trackCount } 
    });
  };

  const getThumbnailUrl = (thumb?: string) => {
    if (!thumb) return null;
    if (thumb.startsWith('http')) return thumb;
    return thumb;
  };

  return (
    <div className="page playlists-page">
      <header className="app-header">
        <h1>PlexM8</h1>
        <div className="header-controls">
          <ServerSelector />
          <button className="refresh-button" onClick={refetch} disabled={loading}>
            {loading ? 'Loading...' : '↻'}
          </button>
          <button onClick={() => navigate('/settings')} className="nav-button">
            ⚙️ Settings
          </button>
          <button onClick={handleLogout} className="nav-button logout">
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <p>Error loading playlists: {error}</p>
            <button onClick={refetch}>Retry</button>
          </div>
        )}

        {loading && playlists.length === 0 ? (
          <div className="loading-state">
            <div className="spinner">Loading playlists...</div>
          </div>
        ) : playlists.length === 0 ? (
          <div className="empty-state">
            <p>No playlists found</p>
            <p className="subtitle">Create a playlist in Plex to get started</p>
          </div>
        ) : (
          <div className="playlists-container">
            <div className="playlist-stats">
              <p>{playlists.length} playlist{playlists.length !== 1 ? 's' : ''} found</p>
            </div>

            <div className="playlist-list">
              {playlists.map((playlist) => {
                const thumbnailUrl = getThumbnailUrl(playlist.thumb);
                const isSelected = selectedPlaylist === playlist.key;
                
                return (
                  <div
                    key={playlist.key}
                    className={`playlist-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handlePlaylistClick(playlist.key, playlist.leafCount)}
                  >
                    <div className="playlist-thumbnail">
                      {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt={playlist.title} />
                      ) : (
                        <div className="placeholder-icon">🎵</div>
                      )}
                    </div>
                    
                    <div className="playlist-content">
                      <h3 className="playlist-title">{playlist.title}</h3>
                      
                      {playlist.summary && (
                        <p className="playlist-summary">{playlist.summary}</p>
                      )}
                      
                      <div className="playlist-meta">
                        <span className="track-count">
                          {playlist.leafCount || 0} track{playlist.leafCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
