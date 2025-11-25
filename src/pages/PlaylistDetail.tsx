import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlaylistTracks, formatDuration, formatTotalDuration, getArtworkUrl, Track } from '../hooks/usePlaylistTracks';
import { useAuthStore } from '../utils/storage';
import { useServerStore } from '../utils/serverContext';
import { selectBestConnection } from '../utils/connectionSelector';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useQueueStore, QueueTrack } from '../utils/queueStore';
import TrackInfoModal from '../components/TrackInfoModal';
import { useSettingsStore } from '../utils/settingsStore';

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
  
  // Get location state to access track count hint (passed from Playlists page)
  const locationState = (window.history.state as any)?.usr;
  const trackCountHint = locationState?.trackCount;
  
  // Decode playlist key from URL (base64 encoded to handle special chars)
  const playlistKey = playlistId ? decodeURIComponent(playlistId) : null;
  
  const { playlistDetail, loading, loadingProgress, error } = usePlaylistTracks(playlistKey, trackCountHint);
  const [, controls] = useAudioPlayer();
  const { setQueue, getCurrentTrack } = useQueueStore();

  const selectedServer = getSelectedServer();
  const serverUrl = selectedServer ? selectBestConnection(selectedServer) : null;
  const currentTrack = getCurrentTrack();

  // Track info modal state
  const [selectedTrackForInfo, setSelectedTrackForInfo] = useState<Track | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [tracksPerPage, setTracksPerPage] = useState(50); // Default 50 tracks per page
  const [searchQuery, setSearchQuery] = useState('');

  // Get filtering settings
  const { filtering } = useSettingsStore();

  // Filter and paginate tracks
  const filteredTracks = useMemo(() => {
    if (!playlistDetail?.tracks) return [];
    
    let tracks = playlistDetail.tracks;
    
    // Filter by format compatibility if hideIncompatible is enabled
    if (filtering.hideIncompatible) {
      tracks = tracks.filter((track: Track) => {
        const { supported } = isTrackSupported(track);
        return supported;
      });
    }
    
    // Filter by search query
    if (!searchQuery.trim()) {
      return tracks;
    }

    const query = searchQuery.toLowerCase();
    return tracks.filter((track: Track) => 
      track.title.toLowerCase().includes(query) ||
      (track.artist && track.artist.toLowerCase().includes(query)) ||
      (track.album && track.album.toLowerCase().includes(query))
    );
  }, [playlistDetail?.tracks, searchQuery, filtering.hideIncompatible, filtering.hiddenFormats]);

  // Calculate pagination
  const totalTracks = filteredTracks.length;
  const totalPages = Math.ceil(totalTracks / tracksPerPage);
  const startIndex = (currentPage - 1) * tracksPerPage;
  const endIndex = Math.min(startIndex + tracksPerPage, totalTracks);
  const paginatedTracks = filteredTracks.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    setCurrentPage((prev: number) => prev + 1);
  };

  const handleShowAll = () => {
    setCurrentPage(1);
    setTracksPerPage(totalTracks); // Show all tracks
  };

  // Check if track format is supported in browser
  const isTrackSupported = (track: Track): { supported: boolean; format: string; reason: string } => {
    const mediaPart = track.Media?.[0]?.Part?.[0];
    const container = mediaPart?.container?.toLowerCase();
    const fileExt = mediaPart?.key?.split('.').pop()?.toLowerCase() || 'unknown';
    
    // Use hiddenFormats from settings instead of hardcoded list
    const isUnsupported = filtering.hiddenFormats.includes(container || '') ||
                          filtering.hiddenFormats.includes(fileExt || '');
    
    if (isUnsupported) {
      return {
        supported: false,
        format: fileExt.toUpperCase(),
        reason: 'Not supported in web browsers. Use Plex app or convert to MP3/FLAC/M4A.',
      };
    }
    
    return { supported: true, format: fileExt.toUpperCase(), reason: '' };
  };

  const buildTrackUrl = (track: Track): { url: string; requiresHeaders: boolean } => {
    if (!serverUrl || !token) return { url: '', requiresHeaders: false };
    
    const { supported } = isTrackSupported(track);
    if (!supported) {
      return { url: '', requiresHeaders: false };
    }
    
    // Build URL for supported formats
    // Try direct playback first - fetch+blob as fallback only if needed
    const mediaPart = track.Media?.[0]?.Part?.[0];
    
    if (mediaPart?.key) {
      return {
        url: `${serverUrl}${mediaPart.key}?X-Plex-Token=${token}`,
        requiresHeaders: false, // Try direct first, let error handler deal with CORB if it happens
      };
    }
    
    // No media part available
    return { url: '', requiresHeaders: false };
  };

  const handlePlayTrack = (trackIndex: number) => {
    if (!serverUrl || !token) return;

    // ALWAYS use lazy URL building - don't build URLs until track is about to play
    // This works for playlists of any size and supports shuffle/random perfectly
    const queueTracks: QueueTrack[] = filteredTracks.map((track: Track) => ({
      key: track.key,
      title: track.title,
      artist: track.artist,
      album: track.album,
      thumb: track.thumb,
      duration: track.duration,
      // Empty URL - will be built on-demand by queueStore when track plays
      url: '',
      Media: track.Media,
      ratingKey: track.key.replace('/library/metadata/', ''),
    }));

    // Set queue and play selected track
    setQueue(queueTracks, trackIndex);
    
    // Build URL only for the track we're about to play
    const selectedTrack = queueTracks[trackIndex];
    const trackInfo = buildTrackUrl(filteredTracks[trackIndex]);
    selectedTrack.url = trackInfo.url;
    
    if (trackInfo.url) {
      const clientId = localStorage.getItem('clientId') || 'plexm8';
      controls.loadTrack(trackInfo.url, trackInfo.requiresHeaders, clientId);
      controls.play();
    } else {
      // Track is unsupported - user will see visual indicator, don't play
      const { format, reason } = isTrackSupported(filteredTracks[trackIndex]);
      console.warn(`[PlaylistDetail] Cannot play: ${filteredTracks[trackIndex].title} (${format}) - ${reason}`);
    }
  };

  const handlePlayAll = () => {
    handlePlayTrack(0); // Start from first track
  };

  const handleBack = () => {
    navigate('/playlists');
  };

  if (loading && !playlistDetail) {
    return (
      <div className="playlist-detail">
        <div className="playlist-detail-loading">
          <div className="spinner">Loading playlist...</div>
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
              <img 
                src={artworkUrl} 
                alt={playlistDetail.title}
                loading="lazy"
              />
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

            {/* Show loading progress for large playlists being loaded in batches */}
            {loadingProgress && (
              <div className="loading-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(loadingProgress.loaded / loadingProgress.total) * 100}%` }}
                  />
                </div>
                <div className="progress-text">
                  Loading tracks: {loadingProgress.loaded.toLocaleString()} / {loadingProgress.total.toLocaleString()}
                </div>
              </div>
            )}

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

      {/* Search and pagination controls */}
      <div className="track-controls">
        <div className="track-search">
          <input
            type="text"
            placeholder="Search tracks, artists, albums..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => handleSearchChange('')}
              className="btn-clear-search"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <div className="track-pagination-info">
          <span>
            Showing {startIndex + 1}-{endIndex} of {totalTracks} tracks
            {filtering.hideIncompatible && playlistDetail?.tracks && totalTracks < playlistDetail.tracks.length && (
              <span className="filter-notice" title="Some tracks are hidden due to incompatible formats">
                {' '}({playlistDetail.tracks.length - totalTracks} hidden)
              </span>
            )}
          </span>
          <select 
            value={tracksPerPage} 
            onChange={(e) => {
              setTracksPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="pagination-select"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value={200}>200 per page</option>
          </select>
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

        {filteredTracks.length === 0 ? (
          <div className="track-list-empty">
            <p>{searchQuery ? 'No tracks found matching your search' : 'This playlist is empty'}</p>
          </div>
        ) : (
          <div className="track-list-items">
            {paginatedTracks.map((track, pageIndex) => {
              // Calculate actual index in the full filtered list
              const actualIndex = startIndex + pageIndex;
              const isPlaying = currentTrack?.key === track.key;
              const trackArtworkUrl = track.thumb && serverUrl && token
                ? getArtworkUrl(serverUrl, track.thumb, token)
                : undefined;
              
              // Check if track is supported
              const { supported, format, reason } = isTrackSupported(track);

              return (
                <div
                  key={track.playlistItemID || track.key || pageIndex}
                  className={`track-item ${isPlaying ? 'playing' : ''} ${!supported ? 'unsupported' : ''}`}
                  onClick={() => supported && handlePlayTrack(actualIndex)}
                  title={!supported ? `${format}: ${reason}` : undefined}
                  style={{ cursor: supported ? 'pointer' : 'not-allowed' }}
                >
                  <span className="track-index">
                    {isPlaying ? '▶' : actualIndex + 1}
                  </span>

                  <div className="track-info">
                    {trackArtworkUrl && (
                      <img
                        src={trackArtworkUrl}
                        alt={track.album || 'Album art'}
                        className="track-thumb"
                        loading="lazy"
                      />
                    )}
                    <div className="track-title-wrapper">
                      <span className="track-title">{track.title}</span>
                      {track.year && (
                        <span className="track-year">({track.year})</span>
                      )}
                      {!supported && (
                        <span className="track-format-badge" title={reason}>
                          {format}
                        </span>
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
                        setSelectedTrackForInfo(track);
                      }}
                      title="Get Info"
                    >
                      ℹ️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {filteredTracks.length > tracksPerPage && (
        <div className="track-pagination">
          <div className="pagination-buttons">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="btn-pagination"
              title="First page"
            >
              ⏮ First
            </button>
            <button
              onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn-pagination"
              title="Previous page"
            >
              ◀ Prev
            </button>
            <span className="pagination-pages">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleLoadMore}
              disabled={currentPage >= totalPages}
              className="btn-pagination"
              title="Next page"
            >
              Next ▶
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="btn-pagination"
              title="Last page"
            >
              Last ⏭
            </button>
          </div>
          {totalTracks > 200 && tracksPerPage < totalTracks && (
            <button
              onClick={handleShowAll}
              className="btn-show-all"
              title="Load all tracks (may be slow)"
            >
              Show All {totalTracks} Tracks
            </button>
          )}
        </div>
      )}

      {/* Track Info Modal */}
      {selectedTrackForInfo && serverUrl && token && (
        <TrackInfoModal
          track={selectedTrackForInfo}
          serverUrl={serverUrl}
          token={token}
          onClose={() => setSelectedTrackForInfo(null)}
        />
      )}
    </div>
  );
}
