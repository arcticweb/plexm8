/**
 * Authentication and Storage State Management
 *
 * Manages:
 * - Plex authentication tokens
 * - Client identifiers
 * - User preferences
 * - Cached playlist data
 */
interface Playlist {
    key: string;
    title: string;
    summary?: string;
    composite?: string;
    duration?: number;
    leafCount?: number;
}
interface AuthState {
    token: string | null;
    clientId: string | null;
    userId: string | null;
    initialized: boolean;
    setToken: (token: string) => void;
    setClientId: (id: string) => void;
    setUserId: (id: string) => void;
    clearAuth: () => void;
}
interface PlaylistState {
    playlists: Playlist[];
    currentPlaylist: Playlist | null;
    setPlaylists: (playlists: Playlist[]) => void;
    setCurrentPlaylist: (playlist: Playlist | null) => void;
    addPlaylist: (playlist: Playlist) => void;
    removePlaylist: (key: string) => void;
}
export declare const useAuthStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AuthState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AuthState, AuthState>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AuthState) => void) => () => void;
        onFinishHydration: (fn: (state: AuthState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AuthState, AuthState>>;
    };
}>;
export declare const usePlaylistStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<PlaylistState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<PlaylistState, PlaylistState>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: PlaylistState) => void) => () => void;
        onFinishHydration: (fn: (state: PlaylistState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<PlaylistState, PlaylistState>>;
    };
}>;
/**
 * Generate a unique client identifier for this device
 * Stored in localStorage to maintain consistency across sessions
 */
export declare function getOrCreateClientId(): string;
/**
 * Clear all stored application data
 */
export declare function clearAppData(): void;
export type { Playlist, AuthState, PlaylistState };
