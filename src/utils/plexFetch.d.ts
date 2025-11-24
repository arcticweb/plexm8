/**
 * Plex Fetch Utility
 *
 * Wrapper around fetch() that adds Plex authentication headers
 * and bypasses CORS issues by using custom headers.
 */
export interface PlexFetchOptions {
    token: string;
    clientId?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
}
/**
 * Fetch from Plex API with proper authentication headers
 * Bypasses CORS by using custom Plex headers that the server accepts
 */
export declare function plexFetch(url: string, options: PlexFetchOptions): Promise<any>;
