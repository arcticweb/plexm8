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
    api: {
        timeout: number;
        retryAttempts: number;
        endpoints?: {
            playlists?: string;
            auth?: string;
            resources?: string;
        };
    };
    ui: {
        theme: 'light' | 'dark' | 'auto';
        itemsPerPage: number;
        autoPlayNext: boolean;
        debugMode: boolean;
    };
    performance: {
        cacheExpiry: number;
        preloadThumbnails: boolean;
        backgroundSync: boolean;
    };
}
export declare const DEFAULT_SETTINGS: AppSettings;
interface SettingsStore extends AppSettings {
    updateApiSettings: (settings: Partial<AppSettings['api']>) => void;
    updateUiSettings: (settings: Partial<AppSettings['ui']>) => void;
    updatePerformanceSettings: (settings: Partial<AppSettings['performance']>) => void;
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
export declare const useSettingsStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<SettingsStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<SettingsStore, SettingsStore>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: SettingsStore) => void) => () => void;
        onFinishHydration: (fn: (state: SettingsStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<SettingsStore, SettingsStore>>;
    };
}>;
/**
 * Hook to get current API timeout value
 * Convenience helper for API modules
 */
export declare const useApiTimeout: () => number;
/**
 * Hook to get current theme
 * Convenience helper for theme providers
 */
export declare const useTheme: () => "light" | "dark" | "auto";
/**
 * Hook to check if debug mode is enabled
 * Convenience helper for conditional logging
 */
export declare const useDebugMode: () => boolean;
export {};
