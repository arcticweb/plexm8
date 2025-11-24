/**
 * Now Playing Component
 *
 * Sticky bottom bar showing current track and playback controls.
 * Displays album artwork, track info, progress bar, and player controls.
 * Responsive: Full controls on desktop, minimal on mobile.
 * Can be minimized to reduce screen space usage.
 *
 * Note: This component persists across route changes since it's placed
 * outside <Routes> in App.tsx. The audio player state is maintained
 * via useRef in the useAudioPlayer hook.
 */
export default function NowPlaying(): import("react/jsx-runtime").JSX.Element | null;
