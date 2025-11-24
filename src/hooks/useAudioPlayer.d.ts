/**
 * Audio player state
 */
export interface AudioPlayerState {
    isPlaying: boolean;
    isPaused: boolean;
    isLoading: boolean;
    currentTime: number;
    duration: number;
    buffered: number;
    volume: number;
    isMuted: boolean;
    currentTrackUrl: string | null;
    error: string | null;
}
/**
 * Audio player controls
 */
export interface AudioPlayerControls {
    play: () => Promise<void>;
    pause: () => void;
    togglePlayPause: () => Promise<void>;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    loadTrack: (url: string) => Promise<void>;
    stop: () => void;
}
/**
 * Custom hook for managing HTML5 audio playback
 *
 * Provides full control over audio element with React state management.
 * Handles all audio events, error states, and playback controls.
 *
 * @returns Tuple of [state, controls, audioElement]
 *
 * Usage:
 * ```tsx
 * const [playerState, controls] = useAudioPlayer();
 *
 * // Load and play track
 * await controls.loadTrack('https://server/track.mp3');
 * await controls.play();
 *
 * // Seek to 30 seconds
 * controls.seek(30);
 * ```
 */
export declare function useAudioPlayer(): [AudioPlayerState, AudioPlayerControls, HTMLAudioElement | null];
/**
 * Format seconds to MM:SS or HH:MM:SS format
 */
export declare function formatTime(seconds: number): string;
/**
 * Calculate percentage progress
 */
export declare function getProgress(current: number, total: number): number;
