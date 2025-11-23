/**
 * Base Plex API Client
 * Provides common functionality for all API operations
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { PlexError } from './types';

/**
 * Configuration for API client
 */
export interface ApiClientConfig {
  baseURL: string;
  token?: string;
  clientId?: string;
}

/**
 * Base API client with common methods
 */
export class PlexApiClient {
  protected client: AxiosInstance;
  protected token: string | null = null;
  protected clientId: string | null = null;

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Accept': 'application/json',
        'X-Plex-Product': 'PlexM8',
      },
    });

    if (config.token) {
      this.setToken(config.token);
    }

    if (config.clientId) {
      this.clientId = config.clientId;
    }

    // Add token to all requests if set
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers['X-Plex-Token'] = this.token;
      }
      return config;
    });
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Make a GET request
   */
  protected async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a POST request
   */
  protected async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a PUT request
   */
  protected async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a DELETE request
   */
  protected async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Build query string from parameters
   */
  protected buildQueryString(params: Record<string, any>): string {
    const entries = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);

    return entries.length > 0 ? `?${entries.join('&')}` : '';
  }

  /**
   * Handle errors from API
   */
  protected handleError(error: any): PlexError & Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const data = error.response?.data;

      const plexError: PlexError & Error = new Error(
        data?.error || error.message || 'Unknown error'
      ) as PlexError & Error;

      plexError.error = data?.error || error.message;
      plexError.code = status;
      plexError.message = data?.message || error.message;

      return plexError;
    }

    const unknownError: PlexError & Error = new Error(
      'An unknown error occurred'
    ) as PlexError & Error;

    unknownError.error = 'Unknown error';
    unknownError.code = 500;

    return unknownError;
  }
}

/**
 * Helper function to create API client instances
 */
export function createPlexApiClient(config: ApiClientConfig): PlexApiClient {
  return new PlexApiClient(config);
}
