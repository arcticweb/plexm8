import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Application Settings Store
 * 
 * Manages user-configurable application settings with localStorage persistence.
 * Settings can be adjusted from the Settings page (/settings).
 * 
 * Related docs:
 * - Architecture: ../../docs/structure.md
 * - User Guide: ../../docs/getting-started.md
 */

export interface AppSettings {
  // API Configuration
  api: {
    // Request timeout in milliseconds (default: 30000)
    timeout: number;
    // Number of retry attempts for failed requests (default: 3)
    retryAttempts: number;
    // Custom endpoint overrides (for testing/development)
    endpoints?: {
      playlists?: string;
      auth?: string;
      resources?: string;
    };
  };

  // UI/Appearance Settings
  ui: {
    // Color theme preference
    theme: 'light' | 'dark' | 'auto';
    // Number of items per page in lists
    itemsPerPage: number;
    // Auto-play next track in playlist
    autoPlayNext: boolean;
    // Show debug information in console
    debugMode: boolean;
  };

  // Performance Settings
  performance: {
    // Cache expiry time in milliseconds (default: 5 minutes)
    cacheExpiry: number;
    // Preload playlist thumbnails for faster rendering
    preloadThumbnails: boolean;
    // Enable background sync for offline support
    backgroundSync: boolean;
  };

  // Audio Quality Settings
  audio: {
    // Transcode bitrate for FLAC/lossless files (in kbps)
    // 320 = High (WiFi), 192 = Medium (Mobile), 128 = Low (Cellular)
    transcodeBitrate: 128 | 192 | 320;
    // Auto-adjust quality based on network type
    adaptiveQuality: boolean;
    // Preferred audio format for transcoding
    transcodeFormat: 'mp3' | 'aac' | 'opus';
    // Enable direct play for supported formats (skip transcoding)
    directPlayEnabled: boolean;
  };
}

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  api: {
    timeout: 30000,
    retryAttempts: 3,
    endpoints: undefined,
  },
  ui: {
    theme: 'auto',
    itemsPerPage: 50,
    autoPlayNext: true,
    debugMode: false,
  },
  performance: {
    cacheExpiry: 300000, // 5 minutes
    preloadThumbnails: true,
    backgroundSync: false,
  },
  audio: {
    transcodeBitrate: 320, // High quality by default (WiFi)
    adaptiveQuality: true, // Auto-adjust based on network
    transcodeFormat: 'mp3', // Best browser compatibility
    directPlayEnabled: true, // Skip transcoding when possible
  },
};

interface SettingsStore extends AppSettings {
  // Actions
  updateApiSettings: (settings: Partial<AppSettings['api']>) => void;
  updateUiSettings: (settings: Partial<AppSettings['ui']>) => void;
  updatePerformanceSettings: (settings: Partial<AppSettings['performance']>) => void;
  updateAudioSettings: (settings: Partial<AppSettings['audio']>) => void;
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
}

/**
 * Settings store with localStorage persistence
 * 
 * Usage:
 * ```tsx
 * import { useSettingsStore } from '@/utils/settingsStore';
 * 
 * function MyComponent() {
 *   const timeout = useSettingsStore((state) => state.api.timeout);
 *   const updateApi = useSettingsStore((state) => state.updateApiSettings);
 *   
 *   const handleTimeoutChange = (newTimeout: number) => {
 *     updateApi({ timeout: newTimeout });
 *   };
 * }
 * ```
 */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Spread default settings as initial state
      ...DEFAULT_SETTINGS,

      /**
       * Update API settings (timeout, retries, endpoints)
       */
      updateApiSettings: (settings: Partial<AppSettings['api']>) => {
        set((state) => ({
          api: { ...state.api, ...settings },
        }));
      },

      /**
       * Update UI settings (theme, pagination, auto-play)
       */
      updateUiSettings: (settings: Partial<AppSettings['ui']>) => {
        set((state) => ({
          ui: { ...state.ui, ...settings },
        }));
      },

      /**
       * Update performance settings (caching, preloading)
       */
      updatePerformanceSettings: (settings: Partial<AppSettings['performance']>) => {
        set((state) => ({
          performance: { ...state.performance, ...settings },
        }));
      },

      /**
       * Update audio quality settings (bitrate, format, adaptive)
       */
      updateAudioSettings: (settings: Partial<AppSettings['audio']>) => {
        set((state) => ({
          audio: { ...state.audio, ...settings },
        }));
      },

      /**
       * Reset all settings to defaults
       */
      resetToDefaults: () => {
        set({ ...DEFAULT_SETTINGS });
      },

      /**
       * Export settings as JSON string
       * @returns JSON string of current settings
       */
      exportSettings: () => {
        const state = get();
        const settings: AppSettings = {
          api: state.api,
          ui: state.ui,
          performance: state.performance,
          audio: state.audio,
        };
        return JSON.stringify(settings, null, 2);
      },

      /**
       * Import settings from JSON string
       * @param json JSON string of settings to import
       * @returns true if import successful, false otherwise
       */
      importSettings: (json: string): boolean => {
        try {
          const imported = JSON.parse(json) as AppSettings;
          
          // Validate structure
          if (!imported.api || !imported.ui || !imported.performance) {
            console.error('Invalid settings structure');
            return false;
          }

          // Validate values
          if (imported.api.timeout < 1000 || imported.api.timeout > 120000) {
            console.error('Invalid timeout value (must be 1000-120000ms)');
            return false;
          }

          if (imported.api.retryAttempts < 0 || imported.api.retryAttempts > 10) {
            console.error('Invalid retry attempts (must be 0-10)');
            return false;
          }

          // Validate audio settings if present
          if (imported.audio) {
            const validBitrates = [128, 192, 320];
            if (!validBitrates.includes(imported.audio.transcodeBitrate)) {
              console.error('Invalid transcode bitrate (must be 128, 192, or 320)');
              return false;
            }
          }

          // Apply imported settings (use defaults for audio if not present)
          set({
            api: imported.api,
            ui: imported.ui,
            performance: imported.performance,
            audio: imported.audio || DEFAULT_SETTINGS.audio,
          });

          return true;
        } catch (error) {
          console.error('Failed to import settings:', error);
          return false;
        }
      },
    }),
    {
      name: 'plexm8-settings',
      version: 1,
    }
  )
);

/**
 * Hook to get current API timeout value
 * Convenience helper for API modules
 */
export const useApiTimeout = () => {
  return useSettingsStore((state) => state.api.timeout);
};

/**
 * Hook to get current theme
 * Convenience helper for theme providers
 */
export const useTheme = () => {
  return useSettingsStore((state) => state.ui.theme);
};

/**
 * Hook to check if debug mode is enabled
 * Convenience helper for conditional logging
 */
export const useDebugMode = () => {
  return useSettingsStore((state) => state.ui.debugMode);
};
