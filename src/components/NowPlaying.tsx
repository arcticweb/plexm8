import { useEffect, useState } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useQueueStore } from '../utils/queueStore';
import { formatTime } from '../hooks/useAudioPlayer';
import { useAuthStore } from '../utils/storage';
import { useServerStore } from '../utils/serverContext';
import { selectBestConnection } from '../utils/connectionSelector';
import { getArtworkUrl } from '../hooks/usePlaylistTracks';

/**
 * Now Playing Component
 * 
 * Sticky bottom bar showing current track and playback controls.
 * Displays album artwork, track info, progress bar, and player controls.
 * Responsive: Full controls on desktop, minimal on mobile.
 * Can be minimized to reduce screen space usage.
 * 
 * Note: This component persists across route changes since it's placed
 * outside <Routes> in App.tsx. The audio player state is maintained
 * via useRef in the useAudioPlayer hook.
 */

export default function NowPlaying() {
  const [playerState, controls] = useAudioPlayer();
  const { token } = useAuthStore();
  const { getSelectedServer } = useServerStore();
  const selectedServer = getSelectedServer();
  const serverUrl = selectedServer ? selectBestConnection(selectedServer) : null;
  
  // Persist minimize state in localStorage
  const [isMinimized, setIsMinimized] = useState(() => {
    const saved = localStorage.getItem('plexm8-player-minimized');
    return saved === 'true';
  });
  
  // Save minimize state
  useEffect(() => {
    localStorage.setItem('plexm8-player-minimized', String(isMinimized));
  }, [isMinimized]);
  const {
    getCurrentTrack,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
    shuffle,
    repeat,
    toggleShuffle,
    cycleRepeat,
  } = useQueueStore();

  const currentTrack = getCurrentTrack();
  
  // Build full artwork URL from relative path
  const artworkUrl = currentTrack?.thumb && serverUrl && token
    ? getArtworkUrl(serverUrl, currentTrack.thumb, token)
    : currentTrack?.thumb; // Fallback to stored URL if already full

  // Auto-play next track when current track ends
  useEffect(() => {
    // Track ended (time reset to 0, not playing, not loading)
    if (!playerState.isPlaying && 
        !playerState.isLoading && 
        playerState.currentTime === 0 && 
        playerState.duration > 0 &&
        currentTrack) {
      // Track finished - play next
      if (hasNext()) {
        const nextTrack = playNext();
        if (nextTrack) {
          controls.loadTrack(nextTrack.url);
          controls.play();
        }
      }
    }
  }, [playerState.isPlaying, playerState.isLoading, playerState.currentTime, playerState.duration, currentTrack, hasNext, playNext, controls]);

  // Handle playback errors
  useEffect(() => {
    if (playerState.error) {
      console.error('Playback error:', playerState.error);
      // Auto-skip to next track on error
      if (hasNext()) {
        const nextTrack = playNext();
        if (nextTrack) {
          controls.loadTrack(nextTrack.url);
          controls.play();
        }
      }
    }
  }, [playerState.error, hasNext, playNext, controls]);

  const handlePlayPause = () => {
    controls.togglePlayPause();
  };

  const handleNext = () => {
    // Stop current track before loading next
    controls.pause();
    const nextTrack = playNext();
    if (nextTrack) {
      controls.loadTrack(nextTrack.url);
      controls.play();
    }
  };

  const handlePrevious = () => {
    // If more than 3 seconds played, restart current track
    if (playerState.currentTime > 3) {
      controls.seek(0);
      controls.play();
    } else {
      // Stop current track before loading previous
      controls.pause();
      const prevTrack = playPrevious();
      if (prevTrack) {
        controls.loadTrack(prevTrack.url);
        controls.play();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    controls.seek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    controls.setVolume(newVolume);
  };

  const getRepeatIcon = () => {
    switch (repeat) {
      case 'one':
        return '🔂'; // Repeat one
      case 'all':
        return '🔁'; // Repeat all
      default:
        return '↻'; // No repeat
    }
  };

  // Don't render if no track is loaded
  if (!currentTrack) {
    return null;
  }

  return (
    <div className={`now-playing ${isMinimized ? 'minimized' : ''}`}>
      {/* Minimize/Maximize Button */}
      <button
        className="now-playing-minimize"
        onClick={() => setIsMinimized(!isMinimized)}
        title={isMinimized ? 'Expand player' : 'Minimize player'}
      >
        {isMinimized ? '▲' : '▼'}
      </button>

      <div className="now-playing-container">
        {/* Track Info */}
        <div className="now-playing-info">
          {artworkUrl && (
            <img
              src={artworkUrl}
              alt={currentTrack.title}
              className="now-playing-artwork"
            />
          )}
          <div className="now-playing-text">
            <div className="now-playing-title">{currentTrack.title}</div>
            {currentTrack.artist && (
              <div className="now-playing-artist">{currentTrack.artist}</div>
            )}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="now-playing-controls">
          <div className="playback-buttons">
            <button
              className={`control-btn shuffle ${shuffle ? 'active' : ''}`}
              onClick={toggleShuffle}
              title="Shuffle"
            >
              🔀
            </button>

            <button
              className="control-btn"
              onClick={handlePrevious}
              disabled={!hasPrevious() && playerState.currentTime <= 3}
              title="Previous"
            >
              ⏮
            </button>

            <button
              className="control-btn play-pause"
              onClick={handlePlayPause}
              title={playerState.isPlaying ? 'Pause' : 'Play'}
            >
              {playerState.isLoading ? (
                <span className="spinner-small">⏳</span>
              ) : playerState.isPlaying ? (
                '⏸'
              ) : (
                '▶'
              )}
            </button>

            <button
              className="control-btn"
              onClick={handleNext}
              disabled={!hasNext()}
              title="Next"
            >
              ⏭
            </button>

            <button
              className={`control-btn repeat ${repeat !== 'off' ? 'active' : ''}`}
              onClick={cycleRepeat}
              title={`Repeat: ${repeat}`}
            >
              {getRepeatIcon()}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="progress-container">
            <span className="time-display">
              {formatTime(playerState.currentTime)}
            </span>
            <input
              type="range"
              className="progress-bar"
              min="0"
              max={playerState.duration || 100}
              value={playerState.currentTime}
              onChange={handleSeek}
              step="0.1"
            />
            <span className="time-display">
              {formatTime(playerState.duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="now-playing-volume">
          <button
            className="control-btn"
            onClick={controls.toggleMute}
            title={playerState.isMuted ? 'Unmute' : 'Mute'}
          >
            {playerState.isMuted ? '🔇' : '🔊'}
          </button>
          <input
            type="range"
            className="volume-slider"
            min="0"
            max="1"
            step="0.01"
            value={playerState.isMuted ? 0 : playerState.volume}
            onChange={handleVolumeChange}
          />
        </div>
      </div>
    </div>
  );
}
