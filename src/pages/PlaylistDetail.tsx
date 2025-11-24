import { useParams, useNavigate } from 'react-router-dom';
import { usePlaylistTracks, formatDuration, formatTotalDuration, getArtworkUrl, Track } from '../hooks/usePlaylistTracks';
import { useAuthStore } from '../utils/storage';
import { useServerStore } from '../utils/serverContext';
import { selectBestConnection } from '../utils/connectionSelector';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useQueueStore, QueueTrack } from '../utils/queueStore';

/**
 * Playlist Detail Component
 * 
 * Displays full playlist information with track listing.
 * Shows album artwork, metadata, and playback controls for each track.
 * 
 * Route: /playlists/:playlistId
 */

export default function PlaylistDetail() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { getSelectedServer } = useServerStore();
  
  // Decode playlist key from URL (base64 encoded to handle special chars)
  const playlistKey = playlistId ? decodeURIComponent(playlistId) : null;
  
  const { playlistDetail, loading, error } = usePlaylistTracks(playlistKey);
  const [, controls] = useAudioPlayer();
  const { setQueue, getCurrentTrack } = useQueueStore();

  const selectedServer = getSelectedServer();
  const serverUrl = selectedServer ? selectBestConnection(selectedServer) : null;
  const currentTrack = getCurrentTrack();

  const buildTrackUrl = (trackKey: string): string => {
    if (!serverUrl || !token) return '';
    // Plex universal transcode endpoint for audio streaming
    // This endpoint handles format conversion and works with HTML5 audio
    // Ensure trackKey has the full path format: /library/metadata/{ratingKey}
    const fullPath = trackKey.startsWith('/library/metadata/') 
      ? trackKey 
      : `/library/metadata/${trackKey}`;
    
    // Build URL with all required parameters for Plex universal transcoder
    const params = new URLSearchParams({
      path: fullPath,
      mediaIndex: '0',
      partIndex: '0',
      protocol: 'http',
      audioCodec: 'mp3',
      audioBitrate: '320',
      maxAudioChannels: '2',
      'X-Plex-Token': token,
    });
    
    return `${serverUrl}/audio/:/transcode/universal/start.mp3?${params.toString()}`;
  };

  const handlePlayTrack = (trackIndex: number) => {
    if (!playlistDetail || !serverUrl || !token) return;

    // Build queue from all tracks
    const queueTracks: QueueTrack[] = playlistDetail.tracks.map((track: Track) => ({
      key: track.key,
      title: track.title,
      artist: track.artist,
      album: track.album,
      thumb: track.thumb ? getArtworkUrl(serverUrl, track.thumb, token) : undefined,
      duration: track.duration,
      url: buildTrackUrl(track.key),
    }));

    // Set queue starting at clicked track
    setQueue(queueTracks, trackIndex);

    // Load and play the track
    const selectedTrack = queueTracks[trackIndex];
    controls.loadTrack(selectedTrack.url);
    controls.play();
  };

  const handlePlayAll = () => {
    handlePlayTrack(0); // Start from first track
  };

  const handleBack = () => {
    navigate('/playlists');
  };

  if (loading) {
    return (
      <div className="playlist-detail">
        <div className="playlist-detail-loading">
          <div className="spinner">Loading tracks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="playlist-detail">
        <div className="playlist-detail-error">
          <p>Error loading playlist</p>
          <p className="error-message">{error}</p>
          <button onClick={handleBack} className="btn-back">
            ← Back to Playlists
          </button>
        </div>
      </div>
    );
  }

  if (!playlistDetail) {
    return (
      <div className="playlist-detail">
        <div className="playlist-detail-error">
          <p>Playlist not found</p>
          <button onClick={handleBack} className="btn-back">
            ← Back to Playlists
          </button>
        </div>
      </div>
    );
  }

  const artworkUrl = playlistDetail.composite && serverUrl && token
    ? getArtworkUrl(serverUrl, playlistDetail.composite, token)
    : undefined;

  return (
    <div className="playlist-detail">
      {/* Header with playlist info */}
      <div className="playlist-detail-header">
        <button onClick={handleBack} className="btn-back">
          ← Back to Playlists
        </button>
        
        <div className="playlist-info">
          {artworkUrl && (
            <div className="playlist-artwork">
              <img src={artworkUrl} alt={playlistDetail.title} />
            </div>
          )}
          
          <div className="playlist-meta">
            <h1>{playlistDetail.title}</h1>
            
            {playlistDetail.summary && (
              <p className="playlist-summary">{playlistDetail.summary}</p>
            )}
            
            <div className="playlist-stats">
              <span className="stat">
                {playlistDetail.leafCount || 0} tracks
              </span>
              {playlistDetail.duration && (
                <>
                  <span className="stat-separator">•</span>
                  <span className="stat">
                    {formatTotalDuration(playlistDetail.duration)}
                  </span>
                </>
              )}
              {playlistDetail.smart === 1 && (
                <>
                  <span className="stat-separator">•</span>
                  <span className="stat smart-badge">Smart Playlist</span>
                </>
              )}
            </div>

            <div className="playlist-actions">
              <button 
                className="btn-play-all"
                onClick={handlePlayAll}
              >
                ▶ Play All
              </button>
              <button className="btn-shuffle" disabled>
                🔀 Shuffle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Track listing */}
      <div className="track-list">
        <div className="track-list-header">
          <span className="track-header-index">#</span>
          <span className="track-header-title">Title</span>
          <span className="track-header-artist">Artist</span>
          <span className="track-header-album">Album</span>
          <span className="track-header-duration">⏱</span>
        </div>

        {playlistDetail.tracks.length === 0 ? (
          <div className="track-list-empty">
            <p>This playlist is empty</p>
          </div>
        ) : (
          <div className="track-list-items">
            {playlistDetail.tracks.map((track, index) => {
              const isPlaying = currentTrack?.key === track.key;
              const trackArtworkUrl = track.thumb && serverUrl && token
                ? getArtworkUrl(serverUrl, track.thumb, token)
                : undefined;

              return (
                <div
                  key={track.playlistItemID || track.key || index}
                  className={`track-item ${isPlaying ? 'playing' : ''}`}
                  onClick={() => handlePlayTrack(index)}
                >
                  <span className="track-index">
                    {isPlaying ? '▶' : index + 1}
                  </span>

                  <div className="track-info">
                    {trackArtworkUrl && (
                      <img
                        src={trackArtworkUrl}
                        alt={track.album || 'Album art'}
                        className="track-thumb"
                      />
                    )}
                    <div className="track-title-wrapper">
                      <span className="track-title">{track.title}</span>
                      {track.year && (
                        <span className="track-year">({track.year})</span>
                      )}
                    </div>
                  </div>

                  <span className="track-artist">
                    {track.artist || 'Unknown Artist'}
                  </span>

                  <span className="track-album">
                    {track.album || 'Unknown Album'}
                  </span>

                  <span className="track-duration">
                    {formatDuration(track.duration)}
                  </span>

                  <div className="track-actions">
                    <button
                      className="btn-track-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Add to queue:', track.key);
                      }}
                      title="Add to queue"
                    >
                      ➕
                    </button>
                    <button
                      className="btn-track-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('More options:', track.key);
                      }}
                      title="More options"
                    >
                      ⋯
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
