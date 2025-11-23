import axios, { AxiosInstance } from 'axios';

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

class PlexApiClient {
  private client: AxiosInstance;
  private clientId: string;
  private token?: string;

  constructor(clientId: string, token?: string) {
    this.clientId = clientId;
    this.token = token;

    this.client = axios.create({
      baseURL: '/.netlify/functions/auth',
      headers: {
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Create a PIN for authentication
   * Returns a PIN code that the user will claim via Plex auth app
   */
  async createPin(): Promise<PinResponse> {
    const response = await this.client.post('/', null, {
      params: { 
        action: 'createPin',
        clientId: this.clientId,
      },
    });
    return response.data;
  }

  /**
   * Check PIN status and retrieve auth token
   * Called after user claims the PIN in Plex auth app
   */
  async checkPin(pinId: number): Promise<PinResponse> {
    const response = await this.client.get('/', {
      params: {
        action: 'checkPin',
        pinId,
        clientId: this.clientId,
      },
    });
    return response.data;
  }

  /**
   * Get current user information
   * Used to validate token and get user details
   */
  async getCurrentUser() {
    const response = await this.client.get('/', {
      params: {
        action: 'getUser',
        token: this.token,
        clientId: this.clientId,
      },
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
        token: this.token,
        clientId: this.clientId,
        includeHttps: 1,
        includeRelay: 1,
        includeIPv6: 1,
      },
    });
    return response.data;
  }

  setToken(token: string) {
    this.token = token;
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
