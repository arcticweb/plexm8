import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

// Auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      clientId: null,
      userId: null,
      initialized: false,
      setToken: (token: string) => set({ token, initialized: true }),
      setClientId: (clientId: string) => set({ clientId }),
      setUserId: (userId: string) => set({ userId }),
      clearAuth: () =>
        set({
          token: null,
          clientId: null,
          userId: null,
          initialized: false,
        }),
    }),
    {
      name: 'plexm8-auth',
      version: 1,
    }
  )
);

// Playlist store with persistence
export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set) => ({
      playlists: [],
      currentPlaylist: null,
      setPlaylists: (playlists: Playlist[]) => set({ playlists }),
      setCurrentPlaylist: (currentPlaylist: Playlist | null) =>
        set({ currentPlaylist }),
      addPlaylist: (playlist: Playlist) =>
        set((state) => ({
          playlists: [...state.playlists, playlist],
        })),
      removePlaylist: (key: string) =>
        set((state) => ({
          playlists: state.playlists.filter((p) => p.key !== key),
        })),
    }),
    {
      name: 'plexm8-playlists',
      version: 1,
    }
  )
);

/**
 * Generate a unique client identifier for this device
 * Stored in localStorage to maintain consistency across sessions
 */
export function getOrCreateClientId(): string {
  const stored = localStorage.getItem('plexm8-client-id');
  if (stored) return stored;

  const clientId = `plexm8-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('plexm8-client-id', clientId);
  return clientId;
}

/**
 * Clear all stored application data
 */
export function clearAppData(): void {
  const clientId = localStorage.getItem('plexm8-client-id');
  localStorage.clear();
  if (clientId) {
    localStorage.setItem('plexm8-client-id', clientId);
  }
  useAuthStore.getState().clearAuth();
  usePlaylistStore.getState().setPlaylists([]);
}

export type { Playlist, AuthState, PlaylistState };
