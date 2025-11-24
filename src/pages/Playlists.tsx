import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaylists } from '../hooks/usePlaylists';
import ServerSelector from '../components/ServerSelector';

/**
 * Playlists Page
 * 
 * Displays all playlists from the selected Plex server with details.
 * Allows users to view, edit, and manage playlists.
 */

export default function Playlists() {
  const navigate = useNavigate();
  const { playlists, loading, error, refetch } = usePlaylists();
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const handlePlaylistClick = (playlistKey: string, trackCount?: number) => {
    setSelectedPlaylist(playlistKey);
    // Encode playlist key for URL (handles special characters like /)
    const encodedKey = encodeURIComponent(playlistKey);
    // Pass track count via location state for optimization
    navigate(`/playlists/${encodedKey}`, { 
      state: { trackCount } 
    });
  };

  const getThumbnailUrl = (thumb?: string) => {
    if (!thumb) return null;
    // Convert relative Plex paths to full URLs if needed
    if (thumb.startsWith('http')) return thumb;
    // For local paths, we'd need the server URL - for now just return the path
    return thumb;
  };

  return (
    <div className="page playlists-page">
      <header className="app-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back
        </button>
        <h1>Playlists</h1>
        <div className="header-controls">
          <ServerSelector />
          <button className="refresh-button" onClick={refetch} disabled={loading}>
            {loading ? 'Loading...' : '↻'}
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
                        {playlist.leafCount !== undefined && (
                          <span className="track-count">
                            🎵 {playlist.leafCount} track{playlist.leafCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {playlist.smart && (
                          <span className="smart-badge">Smart Playlist</span>
                        )}
                        {playlist.type && (
                          <span className="type-badge">{playlist.type}</span>
                        )}
                      </div>
                    </div>

                    <div className="playlist-actions">
                      <button
                        className="action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement edit
                        }}
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        className="action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement delete
                        }}
                        title="Delete"
                      >
                        🗑
                      </button>
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
