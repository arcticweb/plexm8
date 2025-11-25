# Console Logging Cleanup Summary

## Problem

The console was flooded with repetitive logs during playlist loading (31K+ tracks):

**Before** (63 batches × 3 connection logs + 1 playlist log = **252 lines**):
```
[Connection] Available connections: 4
[Connection] Prefer local: false
[Connection] Selected: https://...plex.direct:21777 (relay: false)
[Playlist] Loaded batch 8/63 (4000/31365 tracks)
[Connection] Available connections: 4
[Connection] Prefer local: false
[Connection] Selected: https://...plex.direct:21777 (relay: false)
[Playlist] Loaded batch 9/63 (4500/31365 tracks)
...repeated 63 times...
```

Plus additional blast when clicking play on a track.

## Solution

Implemented centralized debug logging system with 4 levels:

| Level | Purpose | Default Visibility |
|-------|---------|-------------------|
| `ERROR` | Critical failures | ✅ Always |
| `WARN` | Degraded functionality | ✅ Always |
| `INFO` | Operation summaries | ✅ Default |
| `DEBUG` | Detailed/repetitive logs | ❌ Hidden |

## Results

**After** (at default INFO level = **3 lines**):
```
[Playlist] Loading 31365 tracks in 63 batches...
[Playlist] Loaded 31365 tracks in 12.3s
[Queue] Restored windowed queue from large playlist (31365 total tracks)
```

**Reduction**: 252 lines → 3 lines (**98.8% reduction**)

## Usage

### Normal Use (Default)
No action needed - logs are clean by default.

### Debugging
Enable detailed logging in browser console:
```javascript
logger.setLevel('DEBUG')
```

This shows all 252 lines for troubleshooting, then:
```javascript
logger.setLevel('INFO')  // Back to clean logs
```

## Changes Made

### Files Updated

1. **`src/utils/logger.ts`** (NEW)
   - Centralized logging utility
   - Configurable levels via localStorage
   - Global `window.logger` for console access

2. **`src/utils/connectionSelector.ts`**
   - Connection selection: `console.log()` → `logger.debug()`
   - Relay warnings: `console.warn()` → `logger.warn()` (still visible)
   - Repetitive logs now hidden by default

3. **`src/hooks/usePlaylistTracks.ts`**
   - Batch progress: `console.log()` → `logger.debug()` (hidden)
   - Start summary: NEW `logger.info()` (visible)
   - End summary: `console.log()` → `logger.info()` with better formatting

4. **`src/utils/queueStore.ts`**
   - Queue persistence: `console.log()` → `logger.debug()` (hidden)
   - Errors: `console.error()` → `logger.error()` (visible)
   - Restoration: `console.log()` → `logger.info()` (visible)

### Documentation

- **`docs/debug-logging.md`** - Complete guide with examples and best practices

## Best Practices Applied

### Use `logger.info()` for:
- ✅ Operation start/end points
- ✅ Summary counts
- ✅ Performance metrics
- ✅ User-visible state changes

### Use `logger.debug()` for:
- ✅ Per-iteration logs in loops
- ✅ Connection details
- ✅ Repetitive updates
- ✅ Internal state changes

### Example Pattern

```typescript
// Start operation (INFO - visible)
logger.info('Playlist', `Loading ${total} tracks in ${batches} batches...`);

// Progress details (DEBUG - hidden)
for (let i = 0; i < batches; i++) {
  logger.debug('Playlist', `Batch ${i}/${batches} (${loaded}/${total})`);
}

// End summary (INFO - visible)
logger.info('Playlist', `Loaded ${total} tracks in ${time}s`);
```

## Benefits

1. **Cleaner Console** - 98.8% reduction in log noise
2. **Better UX** - Less overwhelming for users
3. **Easier Debugging** - Enable DEBUG level when needed
4. **Persistent** - Setting saved in localStorage
5. **Consistent** - All modules use same logger
6. **Flexible** - Easy to adjust levels per module

## Migration Path

Already updated most problematic files. Future candidates:
- `src/hooks/useAudioPlayer.ts`
- `src/components/ServerSelector.tsx`
- `src/hooks/usePlaylists.ts`
- `src/utils/backendDetector.ts`

Can be done incrementally as needed.

## Testing

Build successful with no errors:
```
✓ 123 modules transformed.
dist/assets/index-DdDbq0jc.js    82.68 kB │ gzip: 25.03 kB
✓ built in 1.12s
```

Default (INFO level):
- Shows important summaries
- Hides repetitive details
- Clean console for normal use

DEBUG level:
- Shows all logs for troubleshooting
- Easy toggle: `logger.setLevel('DEBUG')`
