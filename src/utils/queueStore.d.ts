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
    url: string;
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
    queue: QueueTrack[];
    currentIndex: number;
    history: QueueTrack[];
    shuffle: boolean;
    repeat: RepeatMode;
    shuffledQueue: QueueTrack[];
    setQueue: (tracks: QueueTrack[], startIndex?: number) => void;
    addToQueue: (track: QueueTrack) => void;
    addNextInQueue: (track: QueueTrack) => void;
    removeFromQueue: (index: number) => void;
    clearQueue: () => void;
    playNext: () => QueueTrack | null;
    playPrevious: () => QueueTrack | null;
    playTrackAtIndex: (index: number) => QueueTrack | null;
    toggleShuffle: () => void;
    cycleRepeat: () => void;
    getCurrentTrack: () => QueueTrack | null;
    getNextTrack: () => QueueTrack | null;
    getPreviousTrack: () => QueueTrack | null;
    hasNext: () => boolean;
    hasPrevious: () => boolean;
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
export declare const useQueueStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<QueueState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<QueueState, any>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: QueueState) => void) => () => void;
        onFinishHydration: (fn: (state: QueueState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<QueueState, any>>;
    };
}>;
export {};
