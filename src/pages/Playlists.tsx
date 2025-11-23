import { useNavigate } from 'react-router-dom';
import { usePlaylistStore } from '../utils/storage';

/**
 * Playlists Page
 * 
 * Displays all playlists with options to create, edit, and delete.
 */

export default function Playlists() {
  const navigate = useNavigate();
  const { playlists } = usePlaylistStore();

  return (
    <div className="page playlists-page">
      <header className="app-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back
        </button>
        <h1>Playlists</h1>
      </header>

      <main className="app-main">
        {playlists.length === 0 ? (
          <div className="empty-state">
            <p>No playlists yet. Create your first playlist to get started!</p>
          </div>
        ) : (
          <div className="playlist-grid">
            {playlists.map((playlist) => (
              <div key={playlist.key} className="playlist-card">
                <h3>{playlist.title}</h3>
                {playlist.summary && <p>{playlist.summary}</p>}
                {playlist.leafCount && <span className="track-count">{playlist.leafCount} tracks</span>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
