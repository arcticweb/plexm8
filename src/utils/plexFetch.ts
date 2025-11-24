/**
 * Plex Fetch Utility
 * 
 * Wrapper around fetch() that adds Plex authentication headers
 * and bypasses CORS issues by using custom headers.
 */

import { getOrCreateClientId } from './storage';

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
export async function plexFetch(url: string, options: PlexFetchOptions): Promise<any> {
  const clientId = options.clientId || getOrCreateClientId();
  
  const headers: Record<string, string> = {
    'X-Plex-Token': options.token,
    'X-Plex-Client-Identifier': clientId,
    'X-Plex-Product': 'PlexM8',
    'X-Plex-Platform': 'Web',
    'X-Plex-Platform-Version': navigator.userAgent,
    'X-Plex-Device': navigator.platform,
    'X-Plex-Device-Name': 'PlexM8 Web Player',
    'Accept': 'application/json',
  };
  
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}
