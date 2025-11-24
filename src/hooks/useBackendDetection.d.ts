/**
 * Backend Detection Hook
 * Detects available backends (Netlify proxy or local Python)
 * Enables conditional feature display based on availability
 */
export interface BackendInfo {
    available: boolean;
    type: 'local' | 'netlify';
    features: string[];
    url?: string;
    version?: string;
    error?: string;
}
/**
 * Hook to detect available backends
 * Attempts local backend first, falls back to Netlify proxy
 */
export declare function useBackendDetection(): {
    backend: BackendInfo;
    checking: boolean;
};
/**
 * Check if a specific feature is available
 */
export declare function useHasFeature(feature: string): boolean;
/**
 * Get API URL for a specific endpoint
 */
export declare function useApiUrl(endpoint: string): string;
