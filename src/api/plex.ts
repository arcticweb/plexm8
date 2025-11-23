import axios from 'axios';

/**
 * Plex Authentication API
 * 
 * Handles authentication with Plex via Netlify Functions backend proxy
 * The backend proxies requests to https://plex.tv/api/v2
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
    const response = await axios.post(
      `/.netlify/functions/auth?action=createPin&clientId=${this.clientId}`,
      null
    );
    return response.data;
  }

  /**
   * Check PIN status and retrieve auth token
   * Called after user claims the PIN in Plex auth app
   */
  async checkPin(pinId: number): Promise<PinResponse> {
    const response = await axios.get(
      `/.netlify/functions/auth?action=checkPin&pinId=${pinId}&clientId=${this.clientId}`
    );
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

