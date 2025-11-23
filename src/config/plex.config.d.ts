/**
 * Plex API Configuration
 *
 * Centralized configuration for all Plex API interactions.
 * Used by both frontend and backend to ensure consistency.
 */
export declare const PLEX_CONFIG: {
    readonly api: {
        readonly public: "https://plex.tv/api/v2";
        readonly clients: "https://clients.plex.tv/api/v2";
    };
    readonly product: {
        readonly name: "PlexM8";
        readonly clientIdentifierKey: "plexm8_client_id";
    };
    readonly auth: {
        readonly pins: {
            readonly create: "/pins?strong=true";
            readonly check: "/pins/{pinId}";
        };
        readonly user: "/user";
    };
    readonly playlists: {
        readonly list: "/playlists";
        readonly create: "/playlists";
        readonly get: "/playlists/{playlistId}";
        readonly delete: "/playlists/{playlistId}";
        readonly clear: "/playlists/{playlistId}/items/clear";
        readonly addItems: "/playlists/{playlistId}/items";
        readonly moveItem: "/playlists/{playlistId}/items/{itemId}/move";
        readonly generators: "/playlists/{playlistId}/generators";
        readonly upload: "/playlists/upload";
    };
    readonly collections: {
        readonly addItems: "/library/collections/{collectionId}";
        readonly removeItem: "/library/collections/{collectionId}/items/{itemId}";
        readonly reorderItem: "/library/collections/{collectionId}/items/{itemId}";
    };
    readonly status: {
        readonly sessions: "/status/sessions";
        readonly tasks: "/status/tasks";
        readonly history: "/status/sessions/history/all";
    };
    readonly library: {
        readonly sections: "/library/sections";
        readonly all: "/library/sections/{sectionId}/all";
        readonly search: "/library/sections/search";
    };
    readonly headers: {
        readonly product: "X-Plex-Product";
        readonly clientId: "X-Plex-Client-Identifier";
        readonly token: "X-Plex-Token";
        readonly contentType: "Content-Type";
        readonly accept: "Accept";
    };
    readonly defaults: {
        readonly contentType: "application/json";
        readonly accept: "application/json";
        readonly timeout: 10000;
    };
    readonly polling: {
        readonly pinCheckInterval: 1000;
        readonly pinCheckTimeout: 300000;
    };
    readonly features: {
        readonly jwt: false;
        readonly smartPlaylists: true;
        readonly collections: true;
    };
};
/**
 * Build full URL for Plex API endpoint
 * @param base Base URL ('public' or 'clients')
 * @param endpoint Endpoint path
 * @returns Full URL
 */
export declare function buildPlexUrl(base: keyof typeof PLEX_CONFIG.api, endpoint: string): string;
/**
 * Replace path parameters in endpoint
 * @param endpoint Endpoint path with {param} placeholders
 * @param params Object with replacement values
 * @returns Endpoint with parameters replaced
 */
export declare function fillEndpointParams(endpoint: string, params: Record<string, string | number>): string;
/**
 * Build Plex API request headers
 * @param token Optional authentication token
 * @param clientId Optional client identifier
 * @returns Headers object
 */
export declare function buildPlexHeaders(token?: string, clientId?: string): Record<string, string>;
export default PLEX_CONFIG;
//# sourceMappingURL=plex.config.d.ts.map