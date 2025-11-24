export interface Playlist {
    key: string;
    title: string;
    type?: string;
    smart?: number;
    summary?: string;
    leafCount?: number;
    thumb?: string;
    icon?: string;
    createdAt?: number;
    updatedAt?: number;
}
/**
 * Hook to fetch playlists from Plex server
 * Queries the user's available playlists
 */
export declare function usePlaylists(): {
    playlists: Playlist[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
};
