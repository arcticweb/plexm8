import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/storage';
import Player from '../components/Player';
import PlaylistManager from '../components/PlaylistManager';

/**
 * Home Page
 * 
 * Main dashboard showing currently playing track and quick access to playlists.
 */

export default function Home() {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
  };

  const handleNavigateToPlaylists = () => {
    navigate('/playlists');
  };

  return (
    <div className="page home-page">
      <header className="app-header">
        <h1>PlexM8</h1>
        <nav className="app-nav">
          <button onClick={handleNavigateToPlaylists} className="nav-button">
            Playlists
          </button>
          <button onClick={() => navigate('/settings')} className="nav-button">
            ⚙️ Settings
          </button>
          <button onClick={handleLogout} className="nav-button logout">
            Logout
          </button>
        </nav>
      </header>

      <main className="app-main">
        <Player />
        <PlaylistManager />
      </main>
    </div>
  );
}
