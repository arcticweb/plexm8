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
  
  // Helper function to build track URL on-demand
  const buildTrackUrl = (track: any): { url: string; requiresHeaders: boolean } => {
    if (!serverUrl || !token) return { url: '', requiresHeaders: false };
    
    // If URL already exists in track, use it
    if (track.url && track.url.trim() !== '') {
      return { url: track.url, requiresHeaders: false };
    }
    
    // Check format - WMA/ASF/WMV need transcoding
    const mediaPart = track.Media?.[0]?.Part?.[0];
    const container = mediaPart?.container?.toLowerCase();
    const fileExt = mediaPart?.key?.split('.').pop()?.toLowerCase();
    
    const problematicFormats = ['wma', 'wmv', 'asf', 'wv'];
    const needsTranscode = problematicFormats.includes(container || '') ||
                          problematicFormats.includes(fileExt || '');
    
    if (needsTranscode) {
      console.warn(`[NowPlaying] ⚠️ Unsupported format: ${track.title || 'Unknown'} (${fileExt || container}) - Skipping`);
      // WMA/ASF/WMV cannot be transcoded in browser - Plex API restriction
      return { url: '', requiresHeaders: false };
    }
    
    // Direct streaming for supported formats
    if (mediaPart?.key) {
      return {
        url: `${serverUrl}${mediaPart.key}?X-Plex-Token=${token}`,
        requiresHeaders: false,
      };
    }
    
    return { url: '', requiresHeaders: false };
  };
  
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
          const trackInfo = buildTrackUrl(nextTrack);
          if (trackInfo.url) {
            const clientId = localStorage.getItem('clientId') || 'plexm8';
            controls.loadTrack(trackInfo.url, trackInfo.requiresHeaders, clientId);
            controls.play();
          } else {
            // URL is empty (unsupported format) - skip to next track
            console.log('[NowPlaying] Skipping unsupported track, moving to next');
            // Recursively skip (will be handled by next render cycle)
          }
        }
      }
    }
  }, [playerState.isPlaying, playerState.isLoading, playerState.currentTime, playerState.duration, currentTrack, hasNext, playNext, controls]);

  // Track if we've tried transcoding for current track
  const [retriedWithTranscode, setRetriedWithTranscode] = useState(false);
  const [lastErrorTime, setLastErrorTime] = useState(0);

  // Handle playback errors with transcode fallback and rate limiting
  useEffect(() => {
    if (playerState.error) {
      // Rate limit error handling to prevent React error #185 (too many renders)
      const now = Date.now();
      if (now - lastErrorTime < 500) {
        console.warn('[NowPlaying] Error handling rate limited, skipping');
        return;
      }
      setLastErrorTime(now);
      
      console.error('Playback error:', playerState.error);
      
      // Skip to next track on error
      console.log('[NowPlaying] Error occurred, skipping to next track');
      setRetriedWithTranscode(false);
      if (hasNext()) {
        const nextTrack = playNext();
        if (nextTrack) {
          const trackInfo = buildTrackUrl(nextTrack);
          if (trackInfo.url) {
            const clientId = localStorage.getItem('clientId') || 'plexm8';
            controls.loadTrack(trackInfo.url, trackInfo.requiresHeaders, clientId);
            controls.play();
          } else {
            // Next track also has no URL - will be handled by next error cycle
            console.log('[NowPlaying] Next track also has no URL, will skip again');
          }
        }
      }
    }
  }, [playerState.error, hasNext, playNext, controls, currentTrack, retriedWithTranscode, lastErrorTime]);

  // Reset retry flag when track changes successfully
  useEffect(() => {
    if (playerState.isPlaying && !playerState.error) {
      setRetriedWithTranscode(false);
    }
  }, [playerState.isPlaying, playerState.error]);

  const handlePlayPause = () => {
    controls.togglePlayPause();
  };

  const handleNext = () => {
    // Stop current track before loading next
    controls.pause();
    const nextTrack = playNext();
    if (nextTrack) {
      const trackInfo = buildTrackUrl(nextTrack);
      if (trackInfo.url) {
        const clientId = localStorage.getItem('clientId') || 'plexm8';
        controls.loadTrack(trackInfo.url, trackInfo.requiresHeaders, clientId);
        controls.play();
      }
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
        const trackInfo = buildTrackUrl(prevTrack);
        if (trackInfo.url) {
          const clientId = localStorage.getItem('clientId') || 'plexm8';
          controls.loadTrack(trackInfo.url, trackInfo.requiresHeaders, clientId);
          controls.play();
        }
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
