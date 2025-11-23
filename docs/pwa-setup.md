# PWA Setup Guide

Progressive Web App configuration, installation, and offline support.

## What is a PWA?

A Progressive Web App is a web application that provides native app-like experience:

- **Installable**: Add to home screen (Chrome, Edge, Android)
- **Offline Support**: Works without internet connection
- **App Icon**: Appears on device launcher
- **Responsive**: Works on any device size
- **Fast**: Instant loading from cache

## PlexM8 PWA Features

✅ Installable on Chrome, Edge, and Android
✅ Works offline with cached data
✅ App icon and splash screen
✅ Full-screen experience
✅ Background sync (future)

## Installation

### Desktop (Chrome/Edge)

1. Open app at `https://yourusername.github.io/plexm8/`
2. Click **Install** button (or address bar icon)
3. Choose to "Install PlexM8"
4. App appears on desktop and taskbar
5. Open like any other application

### Android

1. Open in Chrome or Edge browser
2. Tap **⋮** (three dots) menu
3. Select **Install app** or **Add to home screen**
4. App appears on home screen
5. Tap to launch in full-screen mode

### iOS (Limited Support)

iOS has limited PWA support:

1. Open in Safari
2. Tap **Share** button
3. Select **Add to Home Screen**
4. App will open in Safari browser (not full-screen)

## Web App Manifest

Configuration file: `public/manifest.json`

```json
{
  "name": "PlexM8",
  "short_name": "PlexM8",
  "description": "Smart Playlist Manager for Plex",
  "start_url": "/plexm8/",
  "scope": "/plexm8/",
  "display": "standalone",
  "background_color": "#1e1e2e",
  "theme_color": "#e50914",
  "icons": [
    {
      "src": "/plexm8/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### Manifest Properties

| Property | Purpose |
|----------|---------|
| `name` | Full app name (shown on splash screen) |
| `short_name` | Short name (shown on home screen) |
| `display` | `standalone` = no browser UI |
| `start_url` | App entry point |
| `theme_color` | Address bar color |
| `background_color` | Splash screen background |
| `icons` | App icons (various sizes) |
| `scope` | URLs considered part of app |

## Service Worker

Configuration file: `public/service-worker.js`

### Lifecycle

```
Installation
  ↓
Activation
  ↓
Fetch Events
  ↓
Update Check
  ↓
Cleanup
```

### Caching Strategy

**Static Assets** (Cache First)
```
User requests → Check cache → Found? Return
                                Not found? → Fetch from network → Cache → Return
```

**API Requests** (Network First)
```
User requests → Try network → Success? Return + Cache
                              Failed? → Check cache → Return cached or error
```

### Cache Management

```typescript
// Cache name versioned
const CACHE_NAME = 'plexm8-v1'

// Assets to cache on install
const ASSETS_TO_CACHE = [
  '/plexm8/',
  '/plexm8/index.html',
  '/plexm8/manifest.json'
]
```

### Update Handling

When new version deploys:

1. Browser detects new service worker
2. New version downloads in background
3. Old version still serves app
4. User sees update notification
5. Tap "Update" to refresh

Implementation in app:

```typescript
// Check for updates periodically
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((reg) => reg.update())
  })
}
```

## Icons

Required icon sizes: 192x192 and 512x512 pixels

### Icon Specifications

```
Icon Size: 192x192 pixels
- Display on home screen
- Used for shortcut icon
- Format: PNG with transparency

Icon Size: 512x512 pixels
- Splash screen background
- Used by device launcher
- Format: PNG with transparency

Maskable Icons (Optional)
- Safe area: Center 66% of icon
- Used with rounded/custom shapes
- Format: PNG with transparency
```

### Icon Placement

Place icons in `public/icons/`:
- `icon-192x192.png`
- `icon-512x512.png`
- `icon-192x192-maskable.png`
- `icon-512x512-maskable.png`

Reference in `public/manifest.json`:

```json
"icons": [
  {
    "src": "/plexm8/icons/icon-192x192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/plexm8/icons/icon-192x192-maskable.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "maskable"
  }
]
```

## Offline Support

### What Works Offline

- ✅ Browse cached playlists
- ✅ View app shell (UI structure)
- ✅ Read cached API responses
- ✅ Navigation between pages

### What Doesn't Work Offline

- ❌ Authenticate (requires network)
- ❌ Fetch new playlist data
- ❌ Play music (requires server)
- ❌ Create/edit playlists

### Testing Offline

1. Open app normally
2. Open DevTools (F12)
3. Go to **Application** → **Service Workers**
4. Check "Offline" checkbox
5. Reload page
6. Interact with cached content

## Screenshots

Display app in store (optional):

```json
"screenshots": [
  {
    "src": "/plexm8/screenshots/screenshot-540x720.png",
    "sizes": "540x720",
    "type": "image/png",
    "form_factor": "narrow"
  },
  {
    "src": "/plexm8/screenshots/screenshot-1280x720.png",
    "sizes": "1280x720",
    "type": "image/png",
    "form_factor": "wide"
  }
]
```

## Testing PWA

### Lighthouse Audit

1. Open app in Chrome
2. Open DevTools (F12)
3. Go to **Lighthouse** tab
4. Check "Progressive Web App"
5. Click "Analyze page load"

### Scoring

Target scores:
- Overall: 90+
- Installable: ✅
- Has valid manifest: ✅
- Has service worker: ✅
- HTTPS enabled: ✅

### Testing Checklist

- [ ] App installs from address bar
- [ ] Installable on Android
- [ ] App icon displays
- [ ] Splash screen shows
- [ ] Full-screen mode works
- [ ] Offline mode loads
- [ ] Service Worker caches assets
- [ ] Update notification appears
- [ ] Lighthouse score 90+

## Troubleshooting

### App Won't Install

Check:
1. HTTPS enabled (required)
2. Manifest file exists
3. Icons are valid PNG
4. Service Worker registered
5. Run Lighthouse audit for issues

### Service Worker Not Updating

Try:
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Uninstall and reinstall app
4. Check DevTools → Application → Service Workers

### Offline Mode Not Working

Check:
1. Service Worker is registered
2. DevTools → Application → Service Workers shows "active"
3. Cache tab shows cached assets
4. No errors in console

### Icons Not Showing

Check:
1. Icon files exist in `public/icons/`
2. Paths correct in `manifest.json`
3. Icons are at least 192x192 pixels
4. PNG format with transparency
5. File names match manifest

## Best Practices

### Performance

- ✅ Lazy-load non-critical content
- ✅ Compress images
- ✅ Minify JavaScript/CSS
- ✅ Use service worker caching
- ❌ Don't cache user data
- ❌ Don't make manifest too large

### Storage

- ✅ Use localStorage for preferences
- ✅ Cache static assets
- ❌ Don't store sensitive data in cache
- ❌ Don't exceed storage quotas

### Security

- ✅ Use HTTPS only
- ✅ Validate manifest
- ✅ Update service worker regularly
- ❌ Don't cache authentication tokens

## Advanced Features (Future)

### Background Sync

```typescript
// Register background sync
registration.sync.register('sync-playlists')
```

### Web Push Notifications

```typescript
// Request notification permission
Notification.requestPermission()
```

### Periodic Background Sync

```typescript
// Check for updates every hour
registration.periodicSync.register('check-updates', {
  minInterval: 60 * 60 * 1000
})
```

## Related Documentation

- [Architecture Overview](./architecture.md)
- [Deployment Guide](./deployment.md)
- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
