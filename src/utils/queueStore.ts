import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Track in the playback queue
 */
export interface QueueTrack {
  key: string;
  title: string;
  artist?: string;
  album?: string;
  thumb?: string;
  duration?: number;
  url: string; // Full playback URL with token
  // For lazy URL building (large playlists)
  Media?: Array<{
    Part?: Array<{
      key?: string;
      file?: string;
    }>;  
  }>;  
  ratingKey?: string;
}

/**
 * Repeat modes for playback
 */
export type RepeatMode = 'off' | 'all' | 'one';

/**
 * Queue state interface
 */
interface QueueState {
  // Queue management
  queue: QueueTrack[];
  currentIndex: number;
  history: QueueTrack[];
  
  // Playback modes
  shuffle: boolean;
  repeat: RepeatMode;
  
  // Shuffled queue (when shuffle is on)
  shuffledQueue: QueueTrack[];
  
  // Actions
  setQueue: (tracks: QueueTrack[], startIndex?: number) => void;
  addToQueue: (track: QueueTrack) => void;
  addNextInQueue: (track: QueueTrack) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  
  // Navigation
  playNext: () => QueueTrack | null;
  playPrevious: () => QueueTrack | null;
  playTrackAtIndex: (index: number) => QueueTrack | null;
  
  // Mode toggles
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  
  // Getters
  getCurrentTrack: () => QueueTrack | null;
  getNextTrack: () => QueueTrack | null;
  getPreviousTrack: () => QueueTrack | null;
  hasNext: () => boolean;
  hasPrevious: () => boolean;
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Playback queue store
 * 
 * Manages the playback queue, history, shuffle, and repeat modes.
 * Persists to localStorage for continuity across sessions.
 * 
 * Usage:
 * ```tsx
 * const { queue, setQueue, playNext } = useQueueStore();
 * 
 * // Load playlist
 * setQueue(tracks, 0);
 * 
 * // Play next track
 * const nextTrack = playNext();
 * if (nextTrack) {
 *   controls.loadTrack(nextTrack.url);
 *   controls.play();
 * }
 * ```
 */
export const useQueueStore = create<QueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      currentIndex: -1,
      history: [],
      shuffle: false,
      repeat: 'off',
      shuffledQueue: [],

      /**
       * Set the entire queue and optionally start at a specific index
       */
      setQueue: (tracks: QueueTrack[], startIndex = 0) => {
        const state = get();
        set({
          queue: tracks,
          currentIndex: startIndex,
          shuffledQueue: state.shuffle ? shuffleArray(tracks) : [],
        });
      },

      /**
       * Add track to end of queue
       */
      addToQueue: (track: QueueTrack) => {
        const state = get();
        set({
          queue: [...state.queue, track],
          shuffledQueue: state.shuffle ? shuffleArray([...state.queue, track]) : [],
        });
      },

      /**
       * Add track as next in queue
       */
      addNextInQueue: (track: QueueTrack) => {
        const state = get();
        const newQueue = [...state.queue];
        const insertIndex = state.currentIndex + 1;
        newQueue.splice(insertIndex, 0, track);
        
        set({
          queue: newQueue,
          shuffledQueue: state.shuffle ? shuffleArray(newQueue) : [],
        });
      },

      /**
       * Remove track from queue by index
       */
      removeFromQueue: (index: number) => {
        const state = get();
        const newQueue = state.queue.filter((_, i) => i !== index);
        
        // Adjust current index if needed
        let newIndex = state.currentIndex;
        if (index < state.currentIndex) {
          newIndex--;
        } else if (index === state.currentIndex) {
          newIndex = Math.min(newIndex, newQueue.length - 1);
        }
        
        set({
          queue: newQueue,
          currentIndex: newIndex,
          shuffledQueue: state.shuffle ? shuffleArray(newQueue) : [],
        });
      },

      /**
       * Clear entire queue and history
       */
      clearQueue: () => {
        set({
          queue: [],
          currentIndex: -1,
          history: [],
          shuffledQueue: [],
        });
      },

      /**
       * Play next track in queue
       * Returns the track or null if no next track
       */
      playNext: () => {
        const state = get();
        const effectiveQueue = state.shuffle ? state.shuffledQueue : state.queue;
        
        if (effectiveQueue.length === 0) return null;
        
        let nextIndex = state.currentIndex + 1;
        
        // Handle repeat modes
        if (state.repeat === 'one') {
          // Stay on same track
          nextIndex = state.currentIndex;
        } else if (nextIndex >= effectiveQueue.length) {
          if (state.repeat === 'all') {
            // Loop back to start
            nextIndex = 0;
          } else {
            // No repeat, reached end
            return null;
          }
        }
        
        // Add current track to history
        const currentTrack = state.getCurrentTrack();
        if (currentTrack && state.currentIndex !== nextIndex) {
          set({ history: [...state.history, currentTrack].slice(-50) }); // Keep last 50
        }
        
        set({ currentIndex: nextIndex });
        return effectiveQueue[nextIndex];
      },

      /**
       * Play previous track
       */
      playPrevious: () => {
        const state = get();
        const effectiveQueue = state.shuffle ? state.shuffledQueue : state.queue;
        
        if (effectiveQueue.length === 0) return null;
        
        // If we've played more than 3 seconds, restart current track
        // (This logic should be handled by the audio player component)
        
        let prevIndex = state.currentIndex - 1;
        
        if (prevIndex < 0) {
          if (state.repeat === 'all') {
            prevIndex = effectiveQueue.length - 1;
          } else {
            return null;
          }
        }
        
        set({ currentIndex: prevIndex });
        return effectiveQueue[prevIndex];
      },

      /**
       * Play track at specific index
       */
      playTrackAtIndex: (index: number) => {
        const state = get();
        const effectiveQueue = state.shuffle ? state.shuffledQueue : state.queue;
        
        if (index < 0 || index >= effectiveQueue.length) return null;
        
        // Add current track to history
        const currentTrack = state.getCurrentTrack();
        if (currentTrack && state.currentIndex !== index) {
          set({ history: [...state.history, currentTrack].slice(-50) });
        }
        
        set({ currentIndex: index });
        return effectiveQueue[index];
      },

      /**
       * Toggle shuffle mode
       */
      toggleShuffle: () => {
        const state = get();
        const newShuffle = !state.shuffle;
        
        set({
          shuffle: newShuffle,
          shuffledQueue: newShuffle ? shuffleArray(state.queue) : [],
        });
      },

      /**
       * Cycle through repeat modes: off → all → one → off
       */
      cycleRepeat: () => {
        const state = get();
        const modes: RepeatMode[] = ['off', 'all', 'one'];
        const currentIdx = modes.indexOf(state.repeat);
        const nextMode = modes[(currentIdx + 1) % modes.length];
        set({ repeat: nextMode });
      },

      /**
       * Get current track
       */
      getCurrentTrack: () => {
        const state = get();
        const effectiveQueue = state.shuffle ? state.shuffledQueue : state.queue;
        
        if (state.currentIndex < 0 || state.currentIndex >= effectiveQueue.length) {
          return null;
        }
        return effectiveQueue[state.currentIndex];
      },

      /**
       * Get next track without advancing
       */
      getNextTrack: () => {
        const state = get();
        const effectiveQueue = state.shuffle ? state.shuffledQueue : state.queue;
        
        let nextIndex = state.currentIndex + 1;
        
        if (state.repeat === 'one') {
          return state.getCurrentTrack();
        }
        
        if (nextIndex >= effectiveQueue.length) {
          if (state.repeat === 'all') {
            nextIndex = 0;
          } else {
            return null;
          }
        }
        
        return effectiveQueue[nextIndex];
      },

      /**
       * Get previous track without navigating
       */
      getPreviousTrack: () => {
        const state = get();
        const effectiveQueue = state.shuffle ? state.shuffledQueue : state.queue;
        
        let prevIndex = state.currentIndex - 1;
        
        if (prevIndex < 0) {
          if (state.repeat === 'all') {
            return effectiveQueue[effectiveQueue.length - 1];
          }
          return null;
        }
        
        return effectiveQueue[prevIndex];
      },

      /**
       * Check if there's a next track
       */
      hasNext: () => {
        const state = get();
        if (state.repeat === 'one' || state.repeat === 'all') return true;
        return state.currentIndex < (state.shuffle ? state.shuffledQueue : state.queue).length - 1;
      },

      /**
       * Check if there's a previous track
       */
      hasPrevious: () => {
        const state = get();
        if (state.repeat === 'all') return true;
        return state.currentIndex > 0;
      },
    }),
    {
      name: 'plexm8-queue',
      version: 2,
      // Migration from v1 to v2 (windowed queue support)
      migrate: (persistedState: any, version: number) => {
        if (version === 1) {
          // V1 had full queue persistence, V2 uses windowed approach
          // Just return the state as-is, new logic will handle it
          return persistedState;
        }
        return persistedState;
      },
      // Selective persistence to avoid localStorage quota exceeded errors
      partialize: (state) => {
        // For large queues (>100 tracks), only persist minimal data
        // to avoid hitting localStorage quota (5-10MB limit)
        const MAX_PERSISTED_QUEUE_SIZE = 100;
        
        if (state.queue.length > MAX_PERSISTED_QUEUE_SIZE) {
          console.log(`[Queue] Large queue detected (${state.queue.length} tracks), persisting only current track and playback state`);
          
          // Only persist current track and a small window around it
          const startIdx = Math.max(0, state.currentIndex - 10);
          const endIdx = Math.min(state.queue.length, state.currentIndex + 11);
          const windowedQueue = state.queue.slice(startIdx, endIdx);
          
          return {
            queue: windowedQueue,
            currentIndex: state.currentIndex - startIdx, // Adjust index to windowed queue
            shuffle: state.shuffle,
            repeat: state.repeat,
            // Store metadata about the full queue for restoration
            _originalQueueSize: state.queue.length,
            _originalCurrentIndex: state.currentIndex,
          };
        }
        
        // For normal-sized queues, persist everything
        return {
          queue: state.queue,
          currentIndex: state.currentIndex,
          shuffle: state.shuffle,
          repeat: state.repeat,
        };
      },
      // Handle localStorage quota errors gracefully
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('[Queue] Error rehydrating from localStorage:', error);
            // Clear corrupted data
            try {
              localStorage.removeItem('plexm8-queue');
            } catch (e) {
              console.error('[Queue] Failed to clear corrupted queue data:', e);
            }
          } else if (state && (state as any)._originalQueueSize) {
            console.log(`[Queue] Restored windowed queue from large playlist (${(state as any)._originalQueueSize} total tracks)`);
          }
        };
      },
    }
  )
);
