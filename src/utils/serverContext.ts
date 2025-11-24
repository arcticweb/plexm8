import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useServerStore = create<ServerStore>()(
  persist(
    (set, get) => ({
      servers: [],
      selectedServerId: null,

      setServers: (servers: PlexServer[]) => {
        set({ servers });
        // Auto-select first server if none selected
        if (servers.length > 0 && !get().selectedServerId) {
          set({ selectedServerId: servers[0].clientIdentifier });
        }
      },

      selectServer: (clientIdentifier: string) => {
        const server = get().servers.find((s) => s.clientIdentifier === clientIdentifier);
        if (server) {
          set({ selectedServerId: clientIdentifier });
        }
      },

      getSelectedServer: () => {
        const selectedId = get().selectedServerId;
        return get().servers.find((s) => s.clientIdentifier === selectedId) || null;
      },
    }),
    {
      name: 'plexm8-server-store',
    }
  )
);
