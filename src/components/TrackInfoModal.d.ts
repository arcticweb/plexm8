import { Track } from '../hooks/usePlaylistTracks';
interface TrackInfoModalProps {
    track: Track;
    serverUrl: string;
    token: string;
    onClose: () => void;
}
/**
 * Track Info Modal Component
 *
 * Displays detailed metadata for a track, similar to Plex's "Get Info" modal.
 * Shows file path, duration, bitrate, codec, container, and all available metadata.
 */
export default function TrackInfoModal({ track, serverUrl, token, onClose }: TrackInfoModalProps): import("react/jsx-runtime").JSX.Element;
export {};
