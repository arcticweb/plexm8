import { useState } from 'react';
import { Track } from '../hooks/usePlaylistTracks';

interface TrackInfoModalProps {
  track: Track;
  serverUrl: string;
  token: string;
  onClose: () => void;
}

/**
 * Track Info Modal Component
 * 
 * Displays detailed metadata for a track, similar to Plex's "Get Info" modal.
 * Shows file path, duration, bitrate, codec, container, and all available metadata.
 */
export default function TrackInfoModal({ track, serverUrl, token, onClose }: TrackInfoModalProps) {
  const [showRawXML, setShowRawXML] = useState(false);

  const mediaPart = track.Media?.[0]?.Part?.[0];
  
  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  // Format duration
  const formatDuration = (ms?: number): string => {
    if (!ms) return 'Unknown';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleViewXML = () => {
    const xmlUrl = `${serverUrl}${track.key}?X-Plex-Token=${token}`;
    window.open(xmlUrl, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content track-info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Media Info</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Track Title */}
          <div className="info-section">
            <h3>{track.title}</h3>
            <p className="track-subtitle">
              {track.artist} • {track.album}
              {track.year && ` (${track.year})`}
            </p>
          </div>

          {/* File Path */}
          <div className="info-section">
            <h4>File</h4>
            <div className="info-item">
              <span className="info-label">Path:</span>
              <span className="info-value file-path">{mediaPart?.file || mediaPart?.key || 'Unknown'}</span>
            </div>
          </div>

          {/* Media Info */}
          <div className="info-section">
            <h4>Media</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Duration:</span>
                <span className="info-value">{formatDuration(track.duration)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Container:</span>
                <span className="info-value">{mediaPart?.container?.toUpperCase() || 'Unknown'}</span>
              </div>
              <div className="info-item info-item-full">
                <span className="info-label">File Extension:</span>
                <span className="info-value">{mediaPart?.key?.split('.').pop()?.toUpperCase() || 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Part Info */}
          {mediaPart && (
            <div className="info-section">
              <h4>Part</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">File Name:</span>
                  <span className="info-value">{mediaPart.file?.split(/[/\\]/).pop() || mediaPart.key?.split(/[/\\]/).pop() || 'Unknown'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">File Size:</span>
                  <span className="info-value">{formatFileSize(mediaPart.size)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Container:</span>
                  <span className="info-value">{mediaPart.container?.toUpperCase() || 'Unknown'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Metadata */}
          {track.rating && (
            <div className="info-section">
              <h4>Additional Info</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Rating:</span>
                  <span className="info-value">{track.rating}/10</span>
                </div>
              </div>
            </div>
          )}

          {/* Debug Info */}
          <div className="info-section">
            <h4>Debug Info</h4>
            <div className="info-grid">
              <div className="info-item info-item-full">
                <span className="info-label">Track Key:</span>
                <span className="info-value code">{track.key}</span>
              </div>
              {mediaPart?.key && (
                <div className="info-item info-item-full">
                  <span className="info-label">Media Part Key:</span>
                  <span className="info-value code">{mediaPart.key}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="info-actions">
            <button className="btn-secondary" onClick={handleViewXML}>
              View XML
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => setShowRawXML(!showRawXML)}
            >
              {showRawXML ? 'Hide' : 'Show'} Raw Data
            </button>
          </div>

          {/* Raw JSON */}
          {showRawXML && (
            <div className="info-section">
              <h4>Raw Track Data</h4>
              <pre className="raw-data">
                {JSON.stringify(track, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
