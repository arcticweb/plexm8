/**
 * Plex API Client
 *
 * Communicates with Plex via Netlify Functions backend proxy
 * to bypass CORS restrictions. The backend proxies requests to:
 * - https://plex.tv/api/v2 (for authentication)
 * - https://clients.plex.tv/api/v2 (for resources)
 */
interface PinResponse {
    id: number;
    code: string;
    product: string;
    secure: boolean;
    clientIdentifier: string;
    location: string;
    locationDetail: string;
    device: string;
    deviceName: string;
    platform: string;
    platformVersion: string;
    featured: boolean;
    online: boolean;
    createdAt: number;
    expiresAt: number;
    authToken?: string;
}
interface AuthToken {
    accessToken: string;
    createdAt: number;
    expiresAt: number;
}
declare class PlexApiClient {
    private client;
    private clientId;
    private token?;
    constructor(clientId: string, token?: string);
    /**
     * Create a PIN for authentication
     * Returns a PIN code that the user will claim via Plex auth app
     */
    createPin(): Promise<PinResponse>;
    /**
     * Check PIN status and retrieve auth token
     * Called after user claims the PIN in Plex auth app
     */
    checkPin(pinId: number): Promise<PinResponse>;
    /**
     * Get current user information
     * Used to validate token and get user details
     */
    getCurrentUser(): Promise<any>;
    /**
     * Get available Plex Media Servers
     * Returns list of servers accessible to the user
     */
    getResources(): Promise<any>;
    setToken(token: string): void;
    getToken(): string | undefined;
}
export declare function initPlexClient(clientId: string, token?: string): PlexApiClient;
export declare function getPlexClient(): PlexApiClient;
export type { PinResponse, AuthToken };
export default PlexApiClient;
//# sourceMappingURL=plex.d.ts.map