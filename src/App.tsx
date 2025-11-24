import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PlexAuth from './components/PlexAuth';
import Home from './pages/Home';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Settings from './pages/Settings';
import InstallPrompt from './components/InstallPrompt';
import NowPlaying from './components/NowPlaying';
import { useAuthStore } from './utils/storage';
import { getBasePath } from './utils/basePath';

function App() {
  const { token, initialized } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate auth initialization
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="spinner">PlexM8</div>
      </div>
    );
  }

  return (
    <Router basename={getBasePath()}>
      <div className="app">
        <InstallPrompt />
        {!token || !initialized ? (
          <PlexAuth />
        ) : (
          <>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
            <NowPlaying />
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
