/**
 * Base Plex API Client
 * Provides common functionality for all API operations
 */
import { AxiosInstance, AxiosRequestConfig } from 'axios';
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
export declare class PlexApiClient {
    protected client: AxiosInstance;
    protected token: string | null;
    protected clientId: string | null;
    constructor(config: ApiClientConfig);
    /**
     * Set authentication token
     */
    setToken(token: string): void;
    /**
     * Clear authentication token
     */
    clearToken(): void;
    /**
     * Get current token
     */
    getToken(): string | null;
    /**
     * Make a GET request
     */
    protected get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    /**
     * Make a POST request
     */
    protected post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    /**
     * Make a PUT request
     */
    protected put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    /**
     * Make a DELETE request
     */
    protected delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    /**
     * Build query string from parameters
     */
    protected buildQueryString(params: Record<string, any>): string;
    /**
     * Handle errors from API
     */
    protected handleError(error: any): PlexError & Error;
}
/**
 * Helper function to create API client instances
 */
export declare function createPlexApiClient(config: ApiClientConfig): PlexApiClient;
//# sourceMappingURL=base.d.ts.map