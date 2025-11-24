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
    updateApiSettings,
    updateUiSettings,
    updatePerformanceSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'api' | 'ui' | 'performance' | 'advanced'>('api');
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
