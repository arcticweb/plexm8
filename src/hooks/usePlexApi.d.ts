export declare function usePlexApi<T>(): {
    call: (fn: () => Promise<T>) => Promise<T>;
    data: T | null;
    loading: boolean;
    error: string | null;
};
/**
 * Hook to get current user information
 */
export declare function useCurrentUser(): {
    fetchUser: () => Promise<unknown>;
    call: (fn: () => Promise<unknown>) => Promise<unknown>;
    data: unknown;
    loading: boolean;
    error: string | null;
};
/**
 * Hook to get available Plex servers
 */
export declare function useResources(): {
    fetchResources: () => Promise<unknown>;
    call: (fn: () => Promise<unknown>) => Promise<unknown>;
    data: unknown;
    loading: boolean;
    error: string | null;
};
