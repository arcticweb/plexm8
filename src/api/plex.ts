import axios from 'axios';
import { getAuthProxyUrl } from '../utils/backendDetector';

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
class AuthApiClient {
  private clientId: string;
  private token?: string;

  constructor(clientId: string, token?: string) {
    this.clientId = clientId;
    this.token = token;
  }

  /**
   * Create a PIN for authentication
   * Returns a PIN code that the user will claim via Plex auth app
   */
  async createPin(): Promise<PinResponse> {
    const { url, isDirect } = await getAuthProxyUrl('createPin', this.clientId);
    
    // Add required Plex headers for direct API calls
    const headers = isDirect ? {
      'X-Plex-Product': 'PlexM8',
      'X-Plex-Client-Identifier': this.clientId,
      'Accept': 'application/json',
    } : {};
    
    const response = await axios.post(url, null, { headers });
    return response.data;
  }

  /**
   * Check PIN status and retrieve auth token
   * Called after user claims the PIN in Plex auth app
   */
  async checkPin(pinId: number): Promise<PinResponse> {
    const { url, isDirect } = await getAuthProxyUrl('checkPin', this.clientId, String(pinId));
    
    // Add required Plex headers for direct API calls
    const headers = isDirect ? {
      'X-Plex-Product': 'PlexM8',
      'X-Plex-Client-Identifier': this.clientId,
      'Accept': 'application/json',
    } : {};
    
    const response = await axios.get(url, { headers });
    return response.data;
  }

  /**
   * Get current user information
   * Used to validate token and get user details
   */
  async getCurrentUser(): Promise<UserInfo> {
    const response = await axios.get(
      `/.netlify/functions/auth?action=getUser&token=${this.token}&clientId=${this.clientId}`
    );
    return response.data;
  }

  /**
   * Get available Plex Media Servers
   * Returns list of servers accessible to the user
   */
  async getResources(): Promise<ResourceServer[]> {
    const response = await axios.get('/.netlify/functions/auth', {
      params: {
        action: 'getResources',
        token: this.token,
        clientId: this.clientId,
        includeHttps: 1,
        includeRelay: 1,
        includeIPv6: 1,
      },
    });
    return response.data;
  }

  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string | undefined {
    return this.token;
  }
}

// Export singleton instance
let plexClient: AuthApiClient | null = null;

/**
 * Initialize the Plex authentication client
 */
export function initPlexClient(
  clientId: string,
  token?: string
): AuthApiClient {
  plexClient = new AuthApiClient(clientId, token);
  return plexClient;
}

/**
 * Get the current Plex client instance
 */
export function getPlexClient(): AuthApiClient {
  if (!plexClient) {
    throw new Error('Plex client not initialized. Call initPlexClient first.');
  }
  return plexClient;
}

/**
 * Export AuthApiClient for direct use
 */
export { AuthApiClient };

