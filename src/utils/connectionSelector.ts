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
export function isLocalDevelopment(): boolean {
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '' ||
    window.location.protocol === 'file:'
  );
}

/**
 * Check if an IP address is private/local
 */
function isPrivateIP(address: string): boolean {
  // IPv4 private ranges
  if (
    address.startsWith('192.168.') ||
    address.startsWith('10.') ||
    address.startsWith('172.16.') ||
    address.startsWith('172.17.') ||
    address.startsWith('172.18.') ||
    address.startsWith('172.19.') ||
    address.startsWith('172.20.') ||
    address.startsWith('172.21.') ||
    address.startsWith('172.22.') ||
    address.startsWith('172.23.') ||
    address.startsWith('172.24.') ||
    address.startsWith('172.25.') ||
    address.startsWith('172.26.') ||
    address.startsWith('172.27.') ||
    address.startsWith('172.28.') ||
    address.startsWith('172.29.') ||
    address.startsWith('172.30.') ||
    address.startsWith('172.31.') ||
    address === 'localhost' ||
    address === '127.0.0.1'
  ) {
    return true;
  }

  // IPv6 private ranges
  if (
    address.startsWith('fe80:') || // Link-local
    address.startsWith('fc00:') || // Unique local
    address.startsWith('fd00:') || // Unique local
    address === '::1' // Loopback
  ) {
    return true;
  }

  return false;
}

/**
 * Score a connection based on desirability
 * Higher score = better connection
 */
function scoreConnection(conn: ConnectionInfo, preferLocal: boolean): number {
  let score = 0;

  // Base scoring
  if (preferLocal) {
    // Local development: prefer local connections
    if (conn.local) score += 100;
    if (isPrivateIP(conn.address)) score += 50;
  } else {
    // Production: prefer public connections
    if (!conn.local) score += 100;
    if (!isPrivateIP(conn.address)) score += 50;
  }

  // Protocol preference (HTTPS > HTTP)
  if (conn.protocol === 'https') score += 20;

  // CRITICAL: Avoid relay connections - they cause HTTP 500 for FLAC files
  // Direct connections work much better for media streaming
  if (!conn.relay) score += 200; // Increased from 30 to 200 to strongly prefer direct
  
  // Penalize relay heavily
  if (conn.relay) score -= 100;

  // Avoid IPv6 for broader compatibility
  if (!conn.IPv6) score += 10;

  return score;
}

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
export function selectBestConnection(server: PlexServer): string | null {
  if (!server.connections || server.connections.length === 0) {
    return null;
  }

  const preferLocal = isLocalDevelopment();
  
  // Score all connections
  const scoredConnections = server.connections.map((conn) => ({
    connection: conn,
    score: scoreConnection(conn, preferLocal),
  }));

  // Sort by score (descending)
  scoredConnections.sort((a, b) => b.score - a.score);

  const bestConnection = scoredConnections[0].connection;
  
  // Debug logging
  console.log('[Connection] Available connections:', server.connections.length);
  console.log('[Connection] Prefer local:', preferLocal);
  console.log('[Connection] Selected:', bestConnection.uri, '(relay:', bestConnection.relay, ')');
  if (bestConnection.relay) {
    console.warn('[Connection] ⚠️ Using relay connection - may cause issues with FLAC files');
    console.warn('[Connection] Consider enabling Remote Access or port forwarding for better performance');
  }

  return bestConnection.uri;
}

/**
 * Get all public (non-local) connections from a server
 */
export function getPublicConnections(server: PlexServer): ConnectionInfo[] {
  if (!server.connections) return [];
  
  return server.connections.filter(
    (conn) => !conn.local && !isPrivateIP(conn.address)
  );
}

/**
 * Get all local (private) connections from a server
 */
export function getLocalConnections(server: PlexServer): ConnectionInfo[] {
  if (!server.connections) return [];
  
  return server.connections.filter(
    (conn) => conn.local || isPrivateIP(conn.address)
  );
}

/**
 * Validate that a connection URI is accessible
 * Note: This makes an actual HTTP request - use sparingly
 * 
 * @param uri Connection URI to test
 * @param token Plex authentication token
 * @returns Promise<boolean> true if accessible, false otherwise
 */
export async function validateConnection(
  uri: string,
  token: string
): Promise<boolean> {
  try {
    const response = await fetch(`${uri}/identity`, {
      headers: {
        'X-Plex-Token': token,
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.warn(`Connection validation failed for ${uri}:`, error);
    return false;
  }
}
