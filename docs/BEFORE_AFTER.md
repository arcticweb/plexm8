# Dynamic Paths: Before & After Comparison

## Overview

This document shows exactly what changed to move from hardcoded paths to dynamic environment-based configuration.

## HTML (public/index.html)

### ❌ Before: Hardcoded Path
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>PlexM8</title>
  <!-- Hardcoded for GitHub Pages /plexm8/ path -->
  <link rel="manifest" href="/plexm8/manifest.json" />
</head>
<body>
  <div id="root"></div>
  <!-- Would only work at /plexm8/, not at / or /music/ -->
  <script type="module" src="/plexm8/src/main.tsx"></script>
</body>
</html>
```

**Problems:**
- ❌ Only works at `/plexm8/`
- ❌ Breaks if app moves to `/music/`
- ❌ Can't use for local development at `/`
- ❌ Requires manual editing for each deployment

### ✅ After: Dynamic Path
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>PlexM8</title>
  <!-- Relative paths - Vite injects base path automatically -->
  <link rel="manifest" href="/manifest.json" />
</head>
<body>
  <div id="root"></div>
  <!-- Works at /, /plexm8/, /music/, anywhere -->
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

**Benefits:**
- ✅ Works at any base path
- ✅ Vite automatically prepends `base` value
- ✅ No manual editing needed
- ✅ Changes via environment variables only

### How Vite Transforms It

```
Source (public/index.html):
<link rel="manifest" href="/manifest.json" />

Development Build (base: /):
<link rel="manifest" href="/manifest.json" />

Production Build (base: /plexm8/):
<link rel="manifest" href="/plexm8/manifest.json" />

Custom Build (base: /music/):
<link rel="manifest" href="/music/manifest.json" />
```

---

## React Router (src/App.tsx)

### ❌ Before: Hardcoded
```typescript
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router basename="/plexm8">  {/* Hardcoded for production only */}
      {/* Routes */}
    </Router>
  );
}
```

**Problems:**
- ❌ Breaks in development (basename should be `/`)
- ❌ Breaks if moving to `/music/`
- ❌ Creates duplicate paths: `/plexm8/plexm8/...`
- ❌ Hard to test in different environments

### ✅ After: Dynamic
```typescript
import { BrowserRouter as Router } from 'react-router-dom';
import { getBasePath } from './utils/basePath';

function App() {
  return (
    <Router basename={getBasePath()}>  {/* Reads from environment */}
      {/* Routes */}
    </Router>
  );
}
```

**Benefits:**
- ✅ Works in any environment
- ✅ Automatically correct base path
- ✅ Type-safe utility function
- ✅ Easy to test and debug

### Runtime Behavior

**Development:**
```
getBasePath() returns: "/"
Router basename: "/"
Link to="/playlists" renders as: href="/playlists"
Browser navigates to: /playlists
```

**Production:**
```
getBasePath() returns: "/plexm8/"
Router basename: "/plexm8/"
Link to="/playlists" renders as: href="/plexm8/playlists"
Browser navigates to: /plexm8/playlists
```

---

## Vite Configuration (vite.config.ts)

### ❌ Before: Conditional Logic
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Custom logic to detect environment
  base: process.env.GITHUB_PAGES ? '/plexm8/' : '/',
  // ...
});
```

**Problems:**
- ❌ Only two states: GITHUB_PAGES set or not
- ❌ Custom environment variables don't map cleanly
- ❌ Hard to add staging environments
- ❌ Non-standard approach (not Vite best practice)

### ✅ After: Standard Vite Pattern
```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  // Vite's standard environment loading
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Reads VITE_APP_BASE_PATH from .env.{mode}
    base: env.VITE_APP_BASE_PATH || '/',
    // ...
  };
});
```

**Benefits:**
- ✅ Vite standard pattern
- ✅ Supports any number of environments
- ✅ Automatic .env file loading
- ✅ Clean separation of concerns

### Environment Variable Loading

```
npm run dev
  └─ Loads .env.development
     VITE_APP_BASE_PATH=/

npm run build
  └─ Loads .env.production
     VITE_APP_BASE_PATH=/plexm8/

npm run build:staging
  └─ Loads .env.staging
     VITE_APP_BASE_PATH=/plexm8-staging/
```

---

## Package.json Scripts

### ❌ Before: Single Build Script
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

**Problems:**
- ❌ No way to build for different environments
- ❌ Manifest paths hardcoded elsewhere
- ❌ Can't easily add staging/production builds
- ❌ PWA configuration not environment-aware

### ✅ After: Environment-Aware Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "node scripts/generate-manifest.mjs && tsc && vite build",
    "build:prod": "cross-env VITE_APP_BASE_PATH=/plexm8/ npm run build",
    "build:staging": "cross-env VITE_APP_BASE_PATH=/plexm8-staging/ npm run build",
    "preview": "vite preview"
  }
}
```

**Benefits:**
- ✅ Explicit environment-specific builds
- ✅ Manifest generated with correct paths
- ✅ Easy to add new environments
- ✅ Cross-platform (works on Windows, Mac, Linux)

### Usage Examples

```bash
# Development: base path = /
npm run dev

# Production: base path = /plexm8/
npm run build

# Staging: base path = /plexm8-staging/
npm run build:staging

# Custom: base path = /music/
cross-env VITE_APP_BASE_PATH=/music/ npm run build
```

---

## PWA Manifest (public/manifest.json)

### ❌ Before: Hardcoded Paths
```json
{
  "name": "PlexM8",
  "start_url": "/plexm8/",
  "scope": "/plexm8/",
  "icons": [
    {
      "src": "/plexm8/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

**Problems:**
- ❌ Icons 404 if moving to `/music/`
- ❌ App won't install in other locations
- ❌ Can't serve from development environment
- ❌ Manual updates required per environment

### ✅ After: Generated with Script
```bash
# scripts/generate-manifest.mjs
const basePath = process.env.VITE_APP_BASE_PATH || '/';

const manifest = {
  name: 'PlexM8',
  start_url: `${basePath}`,
  scope: `${basePath}`,
  icons: [
    {
      src: `${basePath}icons/icon-192x192.png`,
      sizes: '192x192',
      type: 'image/png'
    }
  ]
};

// Written to dist/manifest.json during build
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
```

**Benefits:**
- ✅ Paths injected at build time
- ✅ Works in any environment
- ✅ Automatic updates with env variables
- ✅ PWA installs correctly

### Generated Output

**Development:**
```json
{
  "start_url": "/",
  "scope": "/",
  "icons": [
    { "src": "/icons/icon-192x192.png" }
  ]
}
```

**Production:**
```json
{
  "start_url": "/plexm8/",
  "scope": "/plexm8/",
  "icons": [
    { "src": "/plexm8/icons/icon-192x192.png" }
  ]
}
```

---

## New Utility: basePath.ts

### ✅ New: Runtime Access to Base Path
```typescript
// src/utils/basePath.ts
export const getBasePath = (): string => {
  return import.meta.env.VITE_APP_BASE_PATH || '/';
};

export const resolveAsset = (path: string): string => {
  const basePath = getBasePath();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${basePath}${cleanPath}`;
};

export const resolveUrl = (path: string): string => {
  const basePath = getBasePath();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${window.location.origin}${basePath}${cleanPath}`;
};
```

### Usage Examples

```typescript
// Get base path
const basePath = getBasePath();
// Dev: "/"
// Prod: "/plexm8/"

// Resolve relative paths
const iconUrl = resolveAsset('icons/icon.png');
// Dev: "/icons/icon.png"
// Prod: "/plexm8/icons/icon.png"

// Get absolute URLs
const apiUrl = resolveUrl('api/users');
// Dev: "http://localhost:5173/api/users"
// Prod: "https://yourdomain.com/plexm8/api/users"
```

---

## Environment Files

### .env Files (New)

**`.env.development`**
```env
VITE_APP_BASE_PATH=/
VITE_APP_NAME=PlexM8 (Dev)
```
Used: Development server (`npm run dev`)

**`.env.production`**
```env
VITE_APP_BASE_PATH=/plexm8/
VITE_APP_NAME=PlexM8 (Production)
```
Used: Production build (`npm run build`)

**`.env.staging`** (Optional)
```env
VITE_APP_BASE_PATH=/plexm8-staging/
VITE_APP_NAME=PlexM8 (Staging)
```
Used: Staging build (`npm run build:staging`)

---

## Deployment Migration Example

### Scenario: Moving from `/plexm8/` to `/music/`

**Step 1: Update .env.production**
```diff
- VITE_APP_BASE_PATH=/plexm8/
+ VITE_APP_BASE_PATH=/music/
```

**Step 2: Rebuild**
```bash
npm run build
```

**Step 3: Deploy**
```bash
# Push to production
git push origin main
```

**Result:**
- ✅ HTML manifests build with `/music/manifest.json`
- ✅ Assets linked to `/music/...`
- ✅ React Router uses `/music/` basename
- ✅ PWA installs with correct scope
- ✅ Service Worker respects new paths

**Code changes required:** 0 ✅

---

## Summary Table

| Aspect | Before | After |
|--------|--------|-------|
| **HTML Paths** | Hardcoded `/plexm8/` | Dynamic via Vite base |
| **Router Config** | Hardcoded `/plexm8/` | `getBasePath()` utility |
| **Vite Config** | Custom logic `GITHUB_PAGES` | Standard `loadEnv()` |
| **Build Scripts** | Single `build` script | Environment-specific builds |
| **Manifest** | Static JSON | Generated per environment |
| **Path Resolution** | Manual string concatenation | `resolveAsset()` / `resolveUrl()` |
| **Dev Environment** | Base path `/` hardcoded | Reads `.env.development` |
| **Prod Environment** | Only one option | Any path via `.env.production` |
| **Migration Effort** | High (edit multiple files) | Low (update one .env file) |

---

## Key Takeaway

**Before:** Paths are hardcoded in HTML, config, and components
- ❌ Difficult to change deployment location
- ❌ Error-prone manual updates
- ❌ Doesn't scale to multiple environments

**After:** Paths are environment variables
- ✅ Single source of truth
- ✅ Automatic propagation
- ✅ Scales to any environment
- ✅ Zero code changes to migrate

---

**Version**: 1.0
**Last Updated**: November 22, 2025
