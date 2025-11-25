import { useState } from 'react';
import { useSettingsStore, DEFAULT_SETTINGS } from '../utils/settingsStore';
import '../styles/app.css';

/**
 * Settings Page Component
 * 
 * Provides UI for managing application configuration:
 * - API settings (timeout, retries, custom endpoints)
 * - Appearance (theme, layout preferences)
 * - Performance (caching, preloading)
 * - Import/Export settings
 * 
 * Related docs:
 * - User Guide: ../../docs/getting-started.md
 */

function Settings() {
  const {
    api,
    ui,
    performance,
    audio,
    filtering,
    updateApiSettings,
    updateUiSettings,
    updatePerformanceSettings,
    updateAudioSettings,
    updateFilteringSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'api' | 'ui' | 'performance' | 'audio' | 'filtering' | 'advanced'>('api');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // Handle settings export
  const handleExport = () => {
    const json = exportSettings();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plexm8-settings-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle settings import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result as string;
      const success = importSettings(json);
      
      if (success) {
        setImportError(null);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError('Invalid settings file. Please check the format and try again.');
        setImportSuccess(false);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  // Handle reset confirmation
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      resetToDefaults();
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="settings-header-top">
          <h1>Settings</h1>
          <button onClick={() => window.history.back()} className="btn-back">
            ← Back
          </button>
        </div>
        <p>Configure PlexM8 to suit your needs</p>
      </div>

      {/* Tab Navigation */}
      <div className="settings-tabs">
        <button
          className={activeTab === 'api' ? 'active' : ''}
          onClick={() => setActiveTab('api')}
        >
          API Settings
        </button>
        <button
          className={activeTab === 'ui' ? 'active' : ''}
          onClick={() => setActiveTab('ui')}
        >
          Appearance
        </button>
        <button
          className={activeTab === 'performance' ? 'active' : ''}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
        <button
          className={activeTab === 'audio' ? 'active' : ''}
          onClick={() => setActiveTab('audio')}
        >
          🎵 Audio Quality
        </button>
        <button
          className={activeTab === 'filtering' ? 'active' : ''}
          onClick={() => setActiveTab('filtering')}
        >
          🔇 Track Filtering
        </button>
        <button
          className={activeTab === 'advanced' ? 'active' : ''}
          onClick={() => setActiveTab('advanced')}
        >
          Advanced
        </button>
      </div>

      {/* Settings Content */}
      <div className="settings-content">
        {/* API Settings Tab */}
        {activeTab === 'api' && (
          <div className="settings-section">
            <h2>API Configuration</h2>
            <p className="section-description">
              Adjust API behavior for your network conditions
            </p>

            <div className="setting-group">
              <label htmlFor="timeout">
                Request Timeout (ms)
                <span className="setting-help">
                  How long to wait for API responses before timing out
                </span>
              </label>
              <input
                id="timeout"
                type="number"
                min="1000"
                max="120000"
                step="1000"
                value={api.timeout}
                onChange={(e) => updateApiSettings({ timeout: parseInt(e.target.value) })}
              />
              <span className="setting-value">
                Current: {api.timeout / 1000}s (Default: {DEFAULT_SETTINGS.api.timeout / 1000}s)
              </span>
            </div>

            <div className="setting-group">
              <label htmlFor="retries">
                Retry Attempts
                <span className="setting-help">
                  Number of times to retry failed requests
                </span>
              </label>
              <input
                id="retries"
                type="number"
                min="0"
                max="10"
                value={api.retryAttempts}
                onChange={(e) => updateApiSettings({ retryAttempts: parseInt(e.target.value) })}
              />
              <span className="setting-value">
                Current: {api.retryAttempts} (Default: {DEFAULT_SETTINGS.api.retryAttempts})
              </span>
            </div>

            <div className="setting-group">
              <label htmlFor="custom-endpoints">
                Custom Endpoints
                <span className="setting-help">
                  Override default API endpoints (for testing/development)
                </span>
              </label>
              <div className="endpoint-inputs">
                <input
                  type="text"
                  placeholder="Playlists endpoint (optional)"
                  value={api.endpoints?.playlists || ''}
                  onChange={(e) =>
                    updateApiSettings({
                      endpoints: { ...api.endpoints, playlists: e.target.value || undefined },
                    })
                  }
                />
                <input
                  type="text"
                  placeholder="Auth endpoint (optional)"
                  value={api.endpoints?.auth || ''}
                  onChange={(e) =>
                    updateApiSettings({
                      endpoints: { ...api.endpoints, auth: e.target.value || undefined },
                    })
                  }
                />
                <input
                  type="text"
                  placeholder="Resources endpoint (optional)"
                  value={api.endpoints?.resources || ''}
                  onChange={(e) =>
                    updateApiSettings({
                      endpoints: { ...api.endpoints, resources: e.target.value || undefined },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* UI Settings Tab */}
        {activeTab === 'ui' && (
          <div className="settings-section">
            <h2>Appearance</h2>
            <p className="section-description">
              Customize the look and feel of PlexM8
            </p>

            <div className="setting-group">
              <label htmlFor="theme">
                Theme
                <span className="setting-help">
                  Choose your preferred color scheme
                </span>
              </label>
              <select
                id="theme"
                value={ui.theme}
                onChange={(e) => updateUiSettings({ theme: e.target.value as 'light' | 'dark' | 'auto' })}
              >
                <option value="auto">Auto (System)</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="setting-group">
              <label htmlFor="items-per-page">
                Items Per Page
                <span className="setting-help">
                  Number of items to display in lists
                </span>
              </label>
              <input
                id="items-per-page"
                type="number"
                min="10"
                max="200"
                step="10"
                value={ui.itemsPerPage}
                onChange={(e) => updateUiSettings({ itemsPerPage: parseInt(e.target.value) })}
              />
              <span className="setting-value">
                Current: {ui.itemsPerPage} (Default: {DEFAULT_SETTINGS.ui.itemsPerPage})
              </span>
            </div>

            <div className="setting-group">
              <label htmlFor="auto-play">
                <input
                  id="auto-play"
                  type="checkbox"
                  checked={ui.autoPlayNext}
                  onChange={(e) => updateUiSettings({ autoPlayNext: e.target.checked })}
                />
                Auto-play next track
                <span className="setting-help">
                  Automatically play the next track when one finishes
                </span>
              </label>
            </div>

            <div className="setting-group">
              <label htmlFor="debug-mode">
                <input
                  id="debug-mode"
                  type="checkbox"
                  checked={ui.debugMode}
                  onChange={(e) => updateUiSettings({ debugMode: e.target.checked })}
                />
                Debug Mode
                <span className="setting-help">
                  Show additional information in browser console
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Performance Settings Tab */}
        {activeTab === 'performance' && (
          <div className="settings-section">
            <h2>Performance</h2>
            <p className="section-description">
              Optimize PlexM8 for your device and network
            </p>

            <div className="setting-group">
              <label htmlFor="cache-expiry">
                Cache Expiry (minutes)
                <span className="setting-help">
                  How long to cache API responses before refreshing
                </span>
              </label>
              <input
                id="cache-expiry"
                type="number"
                min="1"
                max="60"
                value={performance.cacheExpiry / 60000}
                onChange={(e) =>
                  updatePerformanceSettings({ cacheExpiry: parseInt(e.target.value) * 60000 })
                }
              />
              <span className="setting-value">
                Current: {performance.cacheExpiry / 60000}m (Default: {DEFAULT_SETTINGS.performance.cacheExpiry / 60000}m)
              </span>
            </div>

            <div className="setting-group">
              <label htmlFor="preload-thumbnails">
                <input
                  id="preload-thumbnails"
                  type="checkbox"
                  checked={performance.preloadThumbnails}
                  onChange={(e) =>
                    updatePerformanceSettings({ preloadThumbnails: e.target.checked })
                  }
                />
                Preload Thumbnails
                <span className="setting-help">
                  Load playlist artwork in advance for faster rendering
                </span>
              </label>
            </div>

            <div className="setting-group">
              <label htmlFor="background-sync">
                <input
                  id="background-sync"
                  type="checkbox"
                  checked={performance.backgroundSync}
                  onChange={(e) =>
                    updatePerformanceSettings({ backgroundSync: e.target.checked })
                  }
                />
                Background Sync
                <span className="setting-help">
                  Sync data in the background for offline support (experimental)
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Audio Quality Settings Tab */}
        {activeTab === 'audio' && (
          <div className="settings-section">
            <h2>🎵 Audio Quality</h2>
            <p className="section-description">
              Configure audio transcoding and playback quality for different network conditions
            </p>

            <div className="setting-group">
              <label htmlFor="transcode-bitrate">
                Transcode Bitrate
                <span className="setting-help">
                  Quality for FLAC/lossless files. Higher = better quality, more bandwidth.
                  <br />
                  • 320 kbps - High (WiFi/Home) - Near transparent quality
                  <br />
                  • 192 kbps - Medium (Mobile Data) - Good balance
                  <br />
                  • 128 kbps - Low (Cellular/Limited Data) - Acceptable quality
                </span>
              </label>
              <select
                id="transcode-bitrate"
                value={audio.transcodeBitrate}
                onChange={(e) =>
                  updateAudioSettings({ transcodeBitrate: parseInt(e.target.value) as 128 | 192 | 320 })
                }
                className="setting-select"
              >
                <option value="320">320 kbps - High Quality (WiFi)</option>
                <option value="192">192 kbps - Medium Quality (Mobile)</option>
                <option value="128">128 kbps - Low Quality (Cellular)</option>
              </select>
              <span className="setting-value">
                Current: {audio.transcodeBitrate} kbps (~{Math.round(audio.transcodeBitrate / 8)} KB/s)
              </span>
            </div>

            <div className="setting-group">
              <label htmlFor="transcode-format">
                Transcode Format
                <span className="setting-help">
                  Audio codec for transcoded files. MP3 has best browser compatibility.
                </span>
              </label>
              <select
                id="transcode-format"
                value={audio.transcodeFormat}
                onChange={(e) =>
                  updateAudioSettings({ transcodeFormat: e.target.value as 'mp3' | 'aac' | 'opus' })
                }
                className="setting-select"
              >
                <option value="mp3">MP3 (Best compatibility)</option>
                <option value="aac">AAC (Better quality)</option>
                <option value="opus">Opus (Most efficient)</option>
              </select>
              <span className="setting-value">
                Current: {audio.transcodeFormat.toUpperCase()}
              </span>
            </div>

            <div className="setting-group">
              <label htmlFor="adaptive-quality">
                <input
                  id="adaptive-quality"
                  type="checkbox"
                  checked={audio.adaptiveQuality}
                  onChange={(e) =>
                    updateAudioSettings({ adaptiveQuality: e.target.checked })
                  }
                />
                Adaptive Quality (Experimental)
                <span className="setting-help">
                  Automatically adjust bitrate based on network type (WiFi vs Mobile)
                </span>
              </label>
            </div>

            <div className="setting-group">
              <label htmlFor="direct-play">
                <input
                  id="direct-play"
                  type="checkbox"
                  checked={audio.directPlayEnabled}
                  onChange={(e) =>
                    updateAudioSettings({ directPlayEnabled: e.target.checked })
                  }
                />
                Direct Play (Recommended)
                <span className="setting-help">
                  Skip transcoding for browser-compatible formats (MP3, M4A, OGG).
                  Disabling forces all audio through transcoder.
                </span>
              </label>
            </div>

            <div className="alert alert-info" style={{ marginTop: '1rem' }}>
              <strong>💡 Tips:</strong>
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li><strong>WiFi/Home:</strong> Use 320 kbps for best quality</li>
                <li><strong>Mobile Data:</strong> Use 192 kbps to balance quality and data usage</li>
                <li><strong>Limited Data:</strong> Use 128 kbps to conserve bandwidth</li>
                <li><strong>FLAC files:</strong> Automatically transcoded using these settings</li>
                <li><strong>MP3/M4A files:</strong> Play directly (no transcoding needed)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Track Filtering Settings Tab */}
        {activeTab === 'filtering' && (
          <div className="settings-section">
            <h2>🔇 Track Filtering</h2>
            <p className="section-description">
              Control which tracks are displayed based on file format compatibility
            </p>

            <div className="setting-group">
              <label htmlFor="hide-incompatible">
                <input
                  id="hide-incompatible"
                  type="checkbox"
                  checked={filtering.hideIncompatible}
                  onChange={(e) =>
                    updateFilteringSettings({ hideIncompatible: e.target.checked })
                  }
                />
                Hide Incompatible Tracks
                <span className="setting-help">
                  Automatically hide tracks with formats that cannot be played in the browser.
                  This reduces clutter and prevents playback errors. Recommended: ON
                </span>
              </label>
            </div>

            <div className="setting-group">
              <label htmlFor="show-format-warnings">
                <input
                  id="show-format-warnings"
                  type="checkbox"
                  checked={filtering.showFormatWarnings}
                  onChange={(e) =>
                    updateFilteringSettings({ showFormatWarnings: e.target.checked })
                  }
                />
                Show Format Warning Badges
                <span className="setting-help">
                  Display warning badges on tracks that may require transcoding (e.g., FLAC).
                  Helps identify which tracks will use more bandwidth.
                </span>
              </label>
            </div>

            <div className="setting-group">
              <label htmlFor="hidden-formats">
                Hidden File Formats
                <span className="setting-help">
                  Comma-separated list of file extensions to hide (e.g., wma, asf, wmv).
                  These formats are known to cause playback issues in browsers.
                </span>
              </label>
              <input
                id="hidden-formats"
                type="text"
                value={filtering.hiddenFormats.join(', ')}
                onChange={(e) => {
                  const formats = e.target.value
                    .split(',')
                    .map(f => f.trim().toLowerCase())
                    .filter(f => f.length > 0);
                  updateFilteringSettings({ hiddenFormats: formats });
                }}
                placeholder="wma, asf, wmv"
              />
              <span className="setting-value">
                Current: {filtering.hiddenFormats.join(', ') || 'None'}
                (Default: {DEFAULT_SETTINGS.filtering.hiddenFormats.join(', ')})
              </span>
            </div>

            <div className="alert alert-info" style={{ marginTop: '1rem' }}>
              <strong>💡 Why filter tracks?</strong>
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li><strong>WMA/ASF/WMV:</strong> Windows Media formats not supported by most browsers</li>
                <li><strong>Browser Limitations:</strong> Some formats require plugins or cause errors</li>
                <li><strong>Cleaner Interface:</strong> Hiding incompatible tracks reduces confusion</li>
                <li><strong>Better Experience:</strong> No playback errors from unsupported files</li>
              </ul>
              <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                <strong>Note:</strong> If Plex server reports "Network Error (s1001)" for specific tracks, 
                add their file extension to the hidden formats list.
              </p>
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="settings-section">
            <h2>Advanced</h2>
            <p className="section-description">
              Import, export, and reset your settings
            </p>

            {importError && (
              <div className="alert alert-error">
                {importError}
              </div>
            )}

            {importSuccess && (
              <div className="alert alert-success">
                Settings imported successfully!
              </div>
            )}

            <div className="setting-group">
              <label>Export Settings</label>
              <p className="setting-help">
                Download your current settings as a JSON file for backup or sharing
              </p>
              <button onClick={handleExport} className="btn-secondary">
                Export Settings
              </button>
            </div>

            <div className="setting-group">
              <label>Import Settings</label>
              <p className="setting-help">
                Load settings from a previously exported JSON file
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
                id="import-file"
              />
              <label htmlFor="import-file" className="btn-secondary" style={{ cursor: 'pointer' }}>
                Choose File
              </label>
            </div>

            <div className="setting-group">
              <label>Reset to Defaults</label>
              <p className="setting-help">
                Restore all settings to their default values
              </p>
              <button onClick={handleReset} className="btn-danger">
                Reset All Settings
              </button>
            </div>

            <div className="setting-group">
              <label>About</label>
              <p className="setting-help">
                PlexM8 - Quick and easy access to your Plex music
              </p>
              <p className="setting-value">
                Version: 1.0.0 | Storage: LocalStorage | Framework: React 18
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
