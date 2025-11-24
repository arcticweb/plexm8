/**
 * Plex Authentication API
 *
 * Handles authentication with automatic backend detection.
 * Routes to Netlify Functions (production) or direct Plex API (local dev).
 */
export interface PinResponse {
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
export interface UserInfo {
    id: number;
    uuid: string;
    username: string;
    email: string;
    locale: string;
    confirmed: boolean;
    joinedAt: number;
    emailOnlyAuth: boolean;
    certificateVersion: number;
    thumb: string;
    hasPassword: boolean;
    homeSize: number;
    homeAdmin: boolean;
}
export interface ResourceServer {
    name: string;
    address: string;
    port: number;
    accessToken: string;
    protocol: string;
    baseuri: string;
    machineIdentifier: string;
    createdAt: number;
    updatedAt: number;
    version: string;
}
/**
 * Authentication API Client
 * Handles PIN creation, validation, and token exchange
 */
declare class AuthApiClient {
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
    getCurrentUser(): Promise<UserInfo>;
    /**
     * Get available Plex Media Servers
     * Returns list of servers accessible to the user
     */
    getResources(): Promise<ResourceServer[]>;
    setToken(token: string): void;
    getToken(): string | undefined;
}
/**
 * Initialize the Plex authentication client
 */
export declare function initPlexClient(clientId: string, token?: string): AuthApiClient;
/**
 * Get the current Plex client instance
 */
export declare function getPlexClient(): AuthApiClient;
/**
 * Export AuthApiClient for direct use
 */
export { AuthApiClient };
