/**
 * Base path configuration utility
 * Provides the application base path for all resources
 * Set via VITE_APP_BASE_PATH environment variable
 */
/**
 * Get the base path for the application
 * In development: '/'
 * In production (GitHub Pages): '/plexm8/'
 * Can be customized via environment variables
 */
export declare const getBasePath: () => string;
/**
 * Resolve a resource path relative to the app base
 * @param path - Resource path (e.g., 'manifest.json')
 * @returns Full path including base (e.g., '/plexm8/manifest.json')
 */
export declare const resolveAsset: (path: string) => string;
/**
 * Resolve a URL for the application (useful for absolute URLs)
 * @param path - Resource path
 * @returns Full absolute URL
 */
export declare const resolveUrl: (path: string) => string;
//# sourceMappingURL=basePath.d.ts.map