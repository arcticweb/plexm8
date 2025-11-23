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
export const getBasePath = (): string => {
  return import.meta.env.VITE_APP_BASE_PATH || '/';
};

/**
 * Resolve a resource path relative to the app base
 * @param path - Resource path (e.g., 'manifest.json')
 * @returns Full path including base (e.g., '/plexm8/manifest.json')
 */
export const resolveAsset = (path: string): string => {
  const basePath = getBasePath();
  // Remove leading slash from path if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${basePath}${cleanPath}`;
};

/**
 * Resolve a URL for the application (useful for absolute URLs)
 * @param path - Resource path
 * @returns Full absolute URL
 */
export const resolveUrl = (path: string): string => {
  const basePath = getBasePath();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const baseUrl = window.location.origin;
  return `${baseUrl}${basePath}${cleanPath}`;
};
