/**
 * Track metadata from Plex
 */
export interface Track {
    key: string;
    title: string;
    artist?: string;
    artistKey?: string;
    album?: string;
    albumKey?: string;
    thumb?: string;
    duration?: number;
    index?: number;
    year?: number;
    rating?: number;
    userRating?: number;
    playlistItemID?: number;
    Media?: Array<{
        Part?: Array<{
            key?: string;
            file?: string;
            size?: number;
            container?: string;
        }>;
    }>;
}
/**
 * Detailed playlist information with tracks
 */
export interface PlaylistDetail {
    key: string;
    title: string;
    summary?: string;
    type?: string;
    smart?: number;
    leafCount?: number;
    duration?: number;
    thumb?: string;
    composite?: string;
    tracks: Track[];
}
/**
 * Hook to fetch tracks from a specific playlist
 *
 * @param playlistKey - The Plex key for the playlist (e.g., "/playlists/12345")
 * @param trackCount - Optional track count to optimize fetching (skip proxy for large playlists)
 * @returns Playlist details with tracks, loading state, and error
 */
export declare function usePlaylistTracks(playlistKey: string | null, trackCount?: number): {
    playlistDetail: PlaylistDetail | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
};
/**
 * Format duration in milliseconds to MM:SS format
 */
export declare function formatDuration(ms: number | undefined): string;
/**
 * Format total playlist duration to human-readable format
 */
export declare function formatTotalDuration(ms: number | undefined): string;
/**
 * Get full artwork URL from Plex server
 */
export declare function getArtworkUrl(serverUrl: string, thumbPath: string | undefined, token: string): string | undefined;
