/**
 * Plex Server Connection Selection Utility
 *
 * Intelligently selects the best connection URI from available options.
 * Prioritizes public connections over local when accessed remotely.
 *
 * Related docs:
 * - ../../docs/api/plex-integration.md
 */
import { PlexServer } from './serverContext';
export interface ConnectionInfo {
    protocol: string;
    address: string;
    port: number;
    uri: string;
    local: boolean;
    relay: boolean;
    IPv6: boolean;
}
/**
 * Determine if we're running in a local development environment
 */
export declare function isLocalDevelopment(): boolean;
/**
 * Select the best connection URI from available options
 *
 * Strategy:
 * - Local development: Prefer local/private IPs (direct LAN connection)
 * - Production (Netlify): Prefer public IPs (remote access)
 * - Always prefer HTTPS over HTTP
 * - Avoid relay connections when possible
 *
 * @param server PlexServer object with connections array
 * @returns Best connection URI, or null if none available
 */
export declare function selectBestConnection(server: PlexServer): string | null;
/**
 * Get all public (non-local) connections from a server
 */
export declare function getPublicConnections(server: PlexServer): ConnectionInfo[];
/**
 * Get all local (private) connections from a server
 */
export declare function getLocalConnections(server: PlexServer): ConnectionInfo[];
/**
 * Validate that a connection URI is accessible
 * Note: This makes an actual HTTP request - use sparingly
 *
 * @param uri Connection URI to test
 * @param token Plex authentication token
 * @returns Promise<boolean> true if accessible, false otherwise
 */
export declare function validateConnection(uri: string, token: string): Promise<boolean>;
