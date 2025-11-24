export interface PlexServer {
    name: string;
    product: string;
    productVersion: string;
    platform: string;
    platformVersion: string;
    device: string;
    clientIdentifier: string;
    provides: string;
    ownerId: string | null;
    sourceTitle: string | null;
    publicAddress: string;
    accessToken: string | null;
    searchEnabled: boolean;
    createdAt: string;
    lastSeenAt: string;
    owned: boolean;
    home: boolean;
    synced: boolean;
    relay: boolean;
    presence: boolean;
    httpsRequired: boolean;
    publicAddressMatches: boolean;
    dnsRebindingProtection?: boolean;
    natLoopbackSupported?: boolean;
    connections: Array<{
        protocol: string;
        address: string;
        port: number;
        uri: string;
        local: boolean;
        relay: boolean;
        IPv6: boolean;
    }>;
}
interface ServerStore {
    servers: PlexServer[];
    selectedServerId: string | null;
    setServers: (servers: PlexServer[]) => void;
    selectServer: (clientIdentifier: string) => void;
    getSelectedServer: () => PlexServer | null;
}
export declare const useServerStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<ServerStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<ServerStore, ServerStore>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: ServerStore) => void) => () => void;
        onFinishHydration: (fn: (state: ServerStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<ServerStore, ServerStore>>;
    };
}>;
export {};
