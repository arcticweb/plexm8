import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Audio player state
 */
export interface AudioPlayerState {
  // Playback state
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  
  // Time tracking
  currentTime: number;
  duration: number;
  buffered: number;
  
  // Volume
  volume: number;
  isMuted: boolean;
  
  // Track info
  currentTrackUrl: string | null;
  
  // Error handling
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
  loadTrack: (url: string, requiresHeaders?: boolean, clientId?: string) => Promise<void>;
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
export function useAudioPlayer(): [AudioPlayerState, AudioPlayerControls, HTMLAudioElement | null] {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    volume: 1.0,
    isMuted: false,
    currentTrackUrl: null,
    error: null,
  });

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous'; // Allow cross-origin requests with proper CORS
    audioRef.current = audio;

    // Event handlers
    const handlePlay = () => {
      setState((prev) => ({ ...prev, isPlaying: true, isPaused: false, error: null }));
    };

    const handlePause = () => {
      setState((prev) => ({ ...prev, isPlaying: false, isPaused: true }));
    };

    const handleEnded = () => {
      setState((prev) => ({ ...prev, isPlaying: false, isPaused: false, currentTime: 0 }));
    };

    const handleTimeUpdate = () => {
      setState((prev) => ({ ...prev, currentTime: audio.currentTime }));
    };

    const handleDurationChange = () => {
      setState((prev) => ({ ...prev, duration: audio.duration || 0 }));
    };

    const handleLoadStart = () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
    };

    const handleLoadedData = () => {
      setState((prev) => ({ ...prev, isLoading: false }));
    };

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        setState((prev) => ({ ...prev, buffered: bufferedEnd }));
      }
    };

    const handleVolumeChange = () => {
      setState((prev) => ({ 
        ...prev, 
        volume: audio.volume,
        isMuted: audio.muted,
      }));
    };

    const handleError = () => {
      const errorMessage = audio.error 
        ? `Audio error: ${audio.error.message}` 
        : 'Unknown audio error';
      setState((prev) => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false,
        isPlaying: false,
      }));
      console.error('Audio playback error:', audio.error);
    };

    // Attach event listeners
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('error', handleError);

    // Cleanup
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Control functions
  const play = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
    } catch (error) {
      console.error('Play failed:', error);
      setState((prev) => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Play failed',
      }));
    }
  }, []);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current) return;
    if (state.isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [state.isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(time, state.duration));
  }, [state.duration]);

  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = Math.max(0, Math.min(1, volume));
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
  }, []);

  const loadTrack = useCallback(async (url: string, requiresHeaders: boolean = false, clientId?: string) => {
    if (!audioRef.current) return;
    
    // Stop current playback
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    
    // If URL requires custom headers (like Plex transcode), fetch it with headers and create Blob URL
    if (requiresHeaders && clientId) {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        
        const response = await fetch(url, {
          headers: {
            'X-Plex-Client-Identifier': clientId,
            'X-Plex-Product': 'PlexM8',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        // Clean up previous blob URL if exists
        if (audioRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        
        audioRef.current.src = blobUrl;
        setState((prev) => ({ 
          ...prev, 
          currentTrackUrl: blobUrl,
          currentTime: 0,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        console.error('Fetch track with headers failed:', error);
        setState((prev) => ({ 
          ...prev, 
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch track',
        }));
        return;
      }
    } else {
      // Standard loading for direct URLs
      audioRef.current.src = url;
      setState((prev) => ({ 
        ...prev, 
        currentTrackUrl: url,
        currentTime: 0,
        error: null,
      }));
    }
    
    // Load metadata
    try {
      await audioRef.current.load();
    } catch (error) {
      console.error('Load track failed:', error);
      setState((prev) => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load track',
      }));
    }
  }, []);

  const stop = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setState((prev) => ({ 
      ...prev, 
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
    }));
  }, []);

  const controls: AudioPlayerControls = {
    play,
    pause,
    togglePlayPause,
    seek,
    setVolume,
    toggleMute,
    loadTrack,
    stop,
  };

  return [state, controls, audioRef.current];
}

/**
 * Format seconds to MM:SS or HH:MM:SS format
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate percentage progress
 */
export function getProgress(current: number, total: number): number {
  if (!total || !isFinite(total)) return 0;
  return Math.min(100, (current / total) * 100);
}
