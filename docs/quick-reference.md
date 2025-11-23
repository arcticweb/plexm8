# Quick Reference

Fast lookup guide for common tasks and file locations.

## Common Commands

```bash
# Development
npm run dev                 # Start dev server with HMR

# Code Quality
npm run type-check         # TypeScript checking
npm run lint               # ESLint checking
npm run format             # Prettier formatting

# Build
npm run build              # Production build
npm run preview            # Preview production build

# Deployment (automatic on git push main)
git push origin main
```

## File Quick Links

| Task | File |
|------|------|
| Add UI component | `src/components/` |
| Add page | `src/pages/` |
| API integration | `src/api/plex.ts` |
| State management | `src/utils/storage.ts` |
| Global styles | `src/styles/app.css` |
| PWA config | `public/manifest.json` |
| Documentation | `docs/` |
| CI/CD workflow | `.github/workflows/deploy-gh-pages.yml` |

## Component Usage

### Using AuthStore

```typescript
import { useAuthStore } from '../utils/storage'

export default function Component() {
  const { token, setToken, clearAuth } = useAuthStore()
  
  // token is persisted automatically
  setToken('new-token')
  clearAuth() // Clear all auth
}
```

### Using PlaylistStore

```typescript
import { usePlaylistStore } from '../utils/storage'

export default function Component() {
  const { playlists, currentPlaylist, setCurrentPlaylist } = usePlaylistStore()
  
  // Persist automatically
  setCurrentPlaylist(playlists[0])
}
```

### Using Plex API

```typescript
import { getPlexClient, initPlexClient } from '../api/plex'
import { getOrCreateClientId } from '../utils/storage'

const clientId = getOrCreateClientId()
const client = initPlexClient(clientId)

// Create PIN for authentication
const pin = await client.createPin()

// Check PIN status
const result = await client.checkPin(pin.id)

// If authenticated
if (result.authToken) {
  client.setToken(result.authToken)
  const user = await client.getCurrentUser()
}
```

## Common Patterns

### Component Template

```typescript
export default function ComponentName() {
  // Hooks & state
  const [state, setState] = useState(null)
  const { data } = useStore()
  
  // Effects
  useEffect(() => {
    // Cleanup
    return () => {}
  }, [])
  
  // Event handlers
  const handleClick = () => {
    setState(newValue)
  }
  
  // Render
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  )
}
```

### Store Template

```typescript
export const useNewStore = create<StateType>()(
  persist(
    (set) => ({
      // State
      field: initialValue,
      
      // Actions
      setField: (value) => set({ field: value }),
    }),
    {
      name: 'storage-key',
      version: 1,
    }
  )
)
```

## Styling Guide

### CSS Variables

```css
/* Colors */
--color-primary: #e50914
--color-dark: #1e1e2e
--color-light: #f5f5f5
--color-text: #fff

/* Spacing */
--spacing-sm: 0.5rem
--spacing-md: 1rem
--spacing-lg: 1.5rem

/* Others */
--radius-md: 0.5rem
--transition: all 0.3s ease
```

## Testing

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Formatting Code
```bash
npm run format
```

### Building
```bash
npm run build
```

## Git Workflow

```bash
# Create branch for feature
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "Add my feature"
git push origin feature/my-feature

# Create PR on GitHub and merge
# Automatic deployment to GitHub Pages
```

## Resources

- [Getting Started](./getting-started.md)
- [Architecture](./architecture.md)
- [API Integration](./api/plex-integration.md)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Related Documentation

- [Full Setup Guide](./setup.md)
- [Implementation Details](./implementation.md)
- [Project Structure](./structure.md)
