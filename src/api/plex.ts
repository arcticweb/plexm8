import axios, { AxiosInstance } from 'axios';

/**
 * Plex API Client
 * 
 * Implements the Plex Media Server API following OAuth and JWT authentication patterns.
 * See: https://developer.plex.tv/pms/
 */

interface PlexHeaders {
  'X-Plex-Product': string;
  'X-Plex-Client-Identifier': string;
  'X-Plex-Token'?: string;
  'X-Plex-Platform'?: string;
  'X-Plex-Platform-Version'?: string;
  'X-Plex-Device-Name'?: string;
  'Accept': string;
}

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

class PlexApiClient {
  private client: AxiosInstance;
  private clientId: string;
  private token?: string;

  constructor(clientId: string, token?: string) {
    this.clientId = clientId;
    this.token = token;

    this.client = axios.create({
      baseURL: 'https://plex.tv/api/v2',
      headers: this.getHeaders(),
    });
  }

  private getHeaders(): PlexHeaders {
    return {
      'X-Plex-Product': 'PlexM8',
      'X-Plex-Client-Identifier': this.clientId,
      'X-Plex-Token': this.token,
      'X-Plex-Platform': this.getPlatform(),
      'X-Plex-Device-Name': 'PlexM8 Web',
      'Accept': 'application/json',
    };
  }

  private getPlatform(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Linux')) return 'Linux';
    return 'Web';
  }

  /**
   * Create a PIN for authentication
   * Returns a PIN code that the user will claim via Plex auth app
   */
  async createPin(): Promise<PinResponse> {
    const response = await this.client.post('/auth/pin', null, {
      params: { strong: true },
    });
    return response.data;
  }

  /**
   * Check PIN status and retrieve auth token
   * Called after user claims the PIN in Plex auth app
   */
  async checkPin(pinId: number): Promise<PinResponse> {
    const response = await this.client.get(`/auth/pin/${pinId}`);
    return response.data;
  }

  /**
   * Get current user information
   * Used to validate token and get user details
   */
  async getCurrentUser() {
    const response = await this.client.get('/user', {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Get available Plex Media Servers
   * Returns list of servers accessible to the user
   */
  async getResources() {
    const response = await this.client.get('/resources', {
      params: {
        includeHttps: 1,
        includeRelay: 1,
        includeIPv6: 1,
      },
      headers: this.getHeaders(),
    });
    return response.data;
  }

  setToken(token: string) {
    this.token = token;
    this.client.defaults.headers.common['X-Plex-Token'] = token;
  }

  getToken(): string | undefined {
    return this.token;
  }
}

// Export singleton instance
let plexClient: PlexApiClient | null = null;

export function initPlexClient(clientId: string, token?: string): PlexApiClient {
  plexClient = new PlexApiClient(clientId, token);
  return plexClient;
}

export function getPlexClient(): PlexApiClient {
  if (!plexClient) {
    throw new Error('Plex client not initialized. Call initPlexClient first.');
  }
  return plexClient;
}

export type { PinResponse, AuthToken };
export default PlexApiClient;
