# Project Structure

Complete file and directory reference for PlexM8.

## Root Level Files

```
plexm8/
├── README.md               # Project overview (main entry point)
├── package.json            # Dependencies and npm scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
└── .gitignore             # Git ignore rules
```

## Directory Structure

### `.github/` - Version Control & CI/CD
```
.github/
└── workflows/
    └── deploy-gh-pages.yml    # GitHub Actions pipeline
        • Type checking
        • Linting
        • Build & optimization
        • GitHub Pages deployment
```

### `docs/` - Documentation
```
docs/
├── README.md                   # Documentation index
├── getting-started.md          # Installation & first steps
├── architecture.md             # System design & components
├── deployment.md               # GitHub Pages deployment
├── pwa-setup.md               # PWA configuration
├── quick-reference.md          # Common commands & patterns
├── setup.md                    # Setup completion summary
├── structure.md (this file)    # File organization
├── implementation.md           # Technical details
│
├── api/
│   └── plex-integration.md     # Plex API guide
│
└── project/
    └── progress.md             # Development roadmap
```

### `src/` - Application Code
```
src/
├── main.tsx                    # Entry point
│   • Service worker registration
│   • React DOM rendering
│
├── App.tsx                     # Root component
│   • Router setup
│   • Auth state management
│   • Page routing
│
├── api/
│   └── plex.ts                 # Plex API Client
│       • OAuth authentication
│       • PIN creation & verification
│       • User/resource fetching
│       • Token management
│
├── components/                 # Reusable Components
│   ├── PlexAuth.tsx            # Authentication
│   ├── PlaylistManager.tsx     # Playlist management
│   ├── Player.tsx              # Music player
│   └── InstallPrompt.tsx       # PWA install prompt
│
├── pages/                      # Page Components
│   ├── Home.tsx                # Main dashboard
│   ├── Playlists.tsx           # Playlist list
│   └── Settings.tsx            # Application settings
│       • API configuration (timeout, retries)
│       • Appearance (theme, pagination)
│       • Performance (caching, preloading)
│       • Import/Export settings
│
├── hooks/
│   └── usePlexApi.ts           # Custom API hook
│       • Generic API state
│       • useCurrentUser()
│       • useResources()
│
├── utils/
│   ├── storage.ts              # State Management
│   │   • useAuthStore (Zustand)
│   │   • usePlaylistStore
│   │   • getOrCreateClientId()
│   │
│   ├── settingsStore.ts        # Settings State Management
│   │   • useSettingsStore (Zustand)
│   │   • API timeout configuration
│   │   • UI preferences (theme, pagination)
│   │   • Performance settings (caching)
│   │   • Import/Export functionality
│   │
│   └── serverContext.ts        # Server Selection State
│       • useServerStore (Zustand)
│       • Multi-server support
│       • Server persistence
│
└── styles/
    └── app.css                 # Global styles
        • CSS variables
        • Responsive grid
        • Dark theme
        • Settings page styling
```

### `public/` - Static Assets
```
public/
├── index.html                  # Main HTML entry
├── 404.html                    # SPA routing helper
├── manifest.json               # PWA manifest
├── service-worker.js           # Offline support
└── icons/                      # App icons
    ├── icon-192x192.png
    └── icon-512x512.png
```

## File Categories by Purpose

### Configuration Files
```
package.json                 npm dependencies & scripts
tsconfig.json              TypeScript compiler options
vite.config.ts             Vite build settings
.github/workflows/*.yml    GitHub Actions CI/CD
```

### Documentation Files
```
docs/README.md             Documentation index
docs/getting-started.md    Installation guide
docs/architecture.md       System design
docs/deployment.md         Deployment procedures
docs/pwa-setup.md          PWA configuration
docs/quick-reference.md    Common commands
docs/setup.md              Setup summary
docs/structure.md          File organization (this file)
docs/implementation.md     Technical details
docs/api/plex-integration.md     Plex API guide
docs/project/progress.md   Development roadmap
```

### Application Code
```
src/main.tsx               Entry point
src/App.tsx                Root component
src/api/plex.ts            API client
src/components/*.tsx       React components
src/pages/*.tsx            Page components
src/hooks/*.ts             Custom hooks
src/utils/*.ts             Utilities & state
src/styles/*.css           Styling
```

### Public Assets
```
public/index.html          Main HTML file
public/404.html            SPA routing helper
public/manifest.json       PWA manifest
public/service-worker.js   Offline support
public/icons/              App icons
```

## Component Hierarchy

```
App
├── InstallPrompt (PWA)
├── PlexAuth (If not authenticated)
└── Router
    ├── Home
    │   ├── Player
    │   └── PlaylistManager
    └── Playlists
```

## File Details by Purpose

### Authentication Flow
```
src/api/plex.ts            • PIN creation
                            • Token retrieval
                            • User info fetching

src/components/PlexAuth.tsx  • User interface
                             • Auth polling
                             • Error display
```

### State Management
```
src/utils/storage.ts       • AuthStore (Zustand)
                           • PlaylistStore (Zustand)
                           • localStorage persistence
```

### Plex Integration
```
src/api/plex.ts            • PlexApiClient class
                           • Axios configuration
                           • Headers management
                           • Error handling

src/hooks/usePlexApi.ts    • Generic API hook
                           • Custom hooks
                           • State management
```

### Styling System
```
src/styles/app.css         • CSS variables
                           • Responsive layouts
                           • Dark theme
                           • Component styles
```

## Key Technology Points

### Build System (Vite)
- Configuration: `vite.config.ts`
- Output: `dist/` directory (on build)
- Source maps enabled
- Code splitting for vendors

### State Management (Zustand)
- Location: `src/utils/storage.ts`
- Persistence: localStorage
- Stores: AuthStore, PlaylistStore

### Styling System (CSS)
- Location: `src/styles/app.css`
- Variables: Root CSS variables
- Grid: Responsive layout
- Theme: Dark mode with Plex red accent

### Service Worker
- Location: `public/service-worker.js`
- Cache: Static assets & API responses
- Strategy: Cache-first for assets, Network-first for API

### PWA Configuration
- Manifest: `public/manifest.json`
- HTML: `public/index.html` link to manifest
- Service Worker: Registered in `src/main.tsx`
- Icons: `public/icons/` directory

## Important Patterns

### Component Pattern
```typescript
// src/components/ComponentName.tsx
export default function ComponentName() {
  // Hooks & state
  // Event handlers
  // Render
  return <div>...</div>
}
```

### Store Pattern
```typescript
// In src/utils/storage.ts
export const useStore = create()(
  persist(
    (set) => ({
      // State & actions
    }),
    { name: 'storage-key' }
  )
)
```

### API Hook Pattern
```typescript
// In src/hooks/usePlexApi.ts
export function useCustomHook() {
  const api = usePlexApi()
  const fetch = useCallback(async () => {
    return await api.call(() => client.method())
  }, [api])
  return { ...api, fetch }
}
```

## Development Workflow

### Before Development
1. Read `docs/getting-started.md`
2. Review `docs/architecture.md`
3. Check relevant API documentation

### During Development
1. Main code: `src/` directory
2. Styling: `src/styles/app.css`
3. State: `src/utils/storage.ts`
4. API calls: `src/api/plex.ts`

### Before Commit
1. `npm run type-check` - TypeScript
2. `npm run lint` - ESLint
3. `npm run format` - Prettier
4. Test manually

### Before Deployment
1. `npm run build` - Production build
2. `npm run preview` - Test locally
3. `git push origin main` - Auto-deploy

---

**Last Updated**: November 22, 2025
**Structure Version**: 1.0
