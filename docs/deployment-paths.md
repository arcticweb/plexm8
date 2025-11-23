# Dynamic Path Configuration Guide

Best practices for handling dynamic application paths across development, staging, and production environments.

## Overview

PlexM8 implements environment-based path configuration to support deployments at different URLs:
- **Development**: `http://localhost:5173/` (root path)
- **Production**: `https://yourdomain.com/plexm8/` (subdirectory)
- **Staging**: `https://yourdomain.com/plexm8-staging/` (different subdirectory)
- **Future**: Any other URL without code changes

## Architecture

### How It Works

```
1. Environment Variables (.env files)
   ↓
2. Vite Config (vite.config.ts)
   ↓
3. HTML/TypeScript (uses base path)
   ↓
4. Manifest Generator Script (dynamic PWA config)
   ↓
5. Build Output (correct paths injected)
```

## Configuration Files

### .env.development
```env
VITE_APP_BASE_PATH=/
VITE_APP_NAME=PlexM8 (Dev)
```
**Used by**: `npm run dev`
**Base Path**: `/` (root)

### .env.production
```env
VITE_APP_BASE_PATH=/plexm8/
VITE_APP_NAME=PlexM8 (Production)
```
**Used by**: `npm run build` (automatic)
**Base Path**: `/plexm8/` (GitHub Pages default)

## Implementation Details

### 1. Environment Variables

Create `.env` files for each deployment target:

```bash
# Development (.env.development)
VITE_APP_BASE_PATH=/
VITE_APP_NAME=PlexM8 (Dev)

# Production (.env.production)
VITE_APP_BASE_PATH=/plexm8/
VITE_APP_NAME=PlexM8 (Prod)

# Staging (.env.staging)
VITE_APP_BASE_PATH=/plexm8-staging/
VITE_APP_NAME=PlexM8 (Staging)
```

**Key Points:**
- Always end with trailing slash
- Vite automatically loads `.env` and `.env.{mode}` files
- Production uses `.env.production` by default

### 2. Vite Configuration

```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: env.VITE_APP_BASE_PATH || '/',
    // ... rest of config
  };
});
```

**How it works:**
- `loadEnv()` reads environment variables for the current mode
- `base` is passed to Vite, which prepends it to all asset paths
- HTML paths like `/manifest.json` become `/plexm8/manifest.json` in production

### 3. React Router Configuration

```typescript
import { getBasePath } from './utils/basePath';

<Router basename={getBasePath()}>
  {/* routes */}
</Router>
```

**How it works:**
- `getBasePath()` returns the path from `import.meta.env.VITE_APP_BASE_PATH`
- React Router uses this to build correct navigation URLs
- Links like `/playlists` become `/plexm8/playlists` in production

### 4. HTML Asset References

**Before (hardcoded):**
```html
<link rel="manifest" href="/plexm8/manifest.json" />
<script type="module" src="/plexm8/src/main.tsx"></script>
```

**After (dynamic via Vite base):**
```html
<link rel="manifest" href="/manifest.json" />
<script type="module" src="/src/main.tsx"></script>
```

Vite automatically prepends the `base` path during build:
- Development: `/manifest.json` → `/manifest.json`
- Production: `/manifest.json` → `/plexm8/manifest.json`

### 5. Manifest Generation Script

```typescript
// scripts/generate-manifest.mjs
const basePath = process.env.VITE_APP_BASE_PATH || '/';

const manifest = {
  start_url: `${basePath}`,
  scope: `${basePath}`,
  icons: [
    { src: `${basePath}icons/icon-192x192.png` },
    // ...
  ],
};

// Write to dist/manifest.json during build
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
```

**Why this is needed:**
- PWA manifest paths are read by browser at runtime
- Vite's base config doesn't affect JSON files
- Script generates manifest with correct paths before build

## Build Scripts

### Development Build
```bash
npm run dev
```
- Uses `.env.development` (base path = `/`)
- Hot reload enabled
- No minification

### Production Build
```bash
npm run build
```
- Uses `.env.production` (base path = `/plexm8/`)
- Generates manifest with production paths
- Minified and optimized

### Custom Deployments
```bash
# Staging deployment
cross-env VITE_APP_BASE_PATH=/plexm8-staging/ npm run build

# Custom domain
cross-env VITE_APP_BASE_PATH=/music-manager/ npm run build
```

## Using the Base Path Utility

### In Components

```typescript
import { resolveAsset, getBasePath } from '@/utils/basePath';

// Get the base path
const basePath = getBasePath(); // '/' or '/plexm8/'

// Resolve an asset path
const iconPath = resolveAsset('icons/icon.png');
// Dev: '/icons/icon.png'
// Prod: '/plexm8/icons/icon.png'

// Get absolute URL
const apiUrl = resolveUrl('api/users');
// Dev: 'http://localhost:5173/api/users'
// Prod: 'https://yourdomain.com/plexm8/api/users'
```

### In API Calls

```typescript
import axios from 'axios';
import { resolveUrl } from '@/utils/basePath';

// If making requests within the app
const response = await axios.get('/api/data');

// If making external requests
const response = await axios.get(resolveUrl('api/data'));
```

### In React Router Links

```typescript
import { Link } from 'react-router-dom';

// React Router automatically handles base path
<Link to="/playlists">Playlists</Link>
// Dev: href="/playlists"
// Prod: href="/plexm8/playlists"
```

## GitHub Actions Integration

### Update CI/CD for Multiple Environments

**deploy-gh-pages.yml:**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      
      - run: npm run type-check
      - run: npm run lint
      - run: npm run build
      
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**For Staging Environment:**
```yaml
- name: Build for Staging
  run: npm run build:staging
  if: github.ref == 'refs/heads/staging'
  
- name: Build for Production
  run: npm run build:prod
  if: github.ref == 'refs/heads/main'
```

## Troubleshooting

### Issue: Assets 404 in production
**Cause**: Base path not applied correctly
**Solution**: 
1. Check `.env.production` has correct `VITE_APP_BASE_PATH`
2. Verify manifest script ran: `node scripts/generate-manifest.mjs`
3. Check browser DevTools → Network tab for actual asset URLs

### Issue: Routing breaks after deployment
**Cause**: React Router basename not using correct base path
**Solution**:
1. Verify `getBasePath()` returns correct value: `console.log(getBasePath())`
2. Check Router basename: `<Router basename={getBasePath()}>`
3. Ensure 404.html exists for SPA routing

### Issue: PWA won't install
**Cause**: Manifest paths incorrect
**Solution**:
1. Check `dist/manifest.json` has correct icon paths
2. Verify icons exist at specified locations
3. Test manifest at: `https://yourdomain.com/plexm8/manifest.json`

## Migration Path

If moving PlexM8 from `/plexm8/` to `/music/`:

1. **Update environment variable:**
   ```env
   # .env.production
   VITE_APP_BASE_PATH=/music/
   ```

2. **Rebuild:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   - Push to appropriate branch/environment
   - CI/CD automatically uses new path

4. **Verify:**
   - App loads correctly
   - No 404 errors in console
   - PWA installs properly

**Zero code changes needed!**

## Best Practices

✅ **DO:**
- Use environment variables for configuration
- Keep `.env` files in version control (no secrets)
- Use `getBasePath()` utility for consistency
- Test in multiple environments
- Document environment-specific settings

❌ **DON'T:**
- Hardcode paths like `/plexm8/`
- Use `process.env` in browser code (won't work)
- Forget to run manifest generator script
- Deploy without testing in target environment
- Modify HTML paths manually

## Summary

| Layer | Configuration | Handles |
|-------|---|---|
| `.env` files | Base path variable | Environment selection |
| Vite config | Reads env variables | Asset bundling |
| basePath utility | Runtime value access | Component usage |
| Manifest script | Dynamic generation | PWA configuration |
| CI/CD pipeline | Build triggers | Deployment automation |

This approach provides:
- ✅ Single source of truth
- ✅ Zero hardcoded paths
- ✅ Easy environment switching
- ✅ Automatic path injection
- ✅ Production-ready automation

---

**Version**: 1.0
**Last Updated**: November 22, 2025
