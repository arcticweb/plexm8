# Debug Logging System

## Overview

PlexM8 uses a centralized logging system with tiered debug levels to reduce console clutter while maintaining visibility into important operations and errors.

## Log Levels

| Level | Priority | Use Case | Default Visibility |
|-------|----------|----------|-------------------|
| `ERROR` | 0 | Critical errors that prevent functionality | ✅ Always shown |
| `WARN` | 1 | Potential issues or degraded functionality | ✅ Always shown |
| `INFO` | 2 | Important operations, summaries, start/end points | ✅ Shown by default |
| `DEBUG` | 3 | Repetitive operations, detailed state changes | ❌ Hidden by default |

## Changing Log Level

### In Browser Console

```javascript
// Set to DEBUG to see all logs (including repetitive operations)
logger.setLevel('DEBUG')

// Set to INFO for normal use (hides repetitive details)
logger.setLevel('INFO')

// Set to WARN to only see warnings and errors
logger.setLevel('WARN')

// Set to ERROR to only see critical errors
logger.setLevel('ERROR')

// Check current level
logger.getLevel()
```

The setting is persisted in `localStorage`, so it survives page refreshes.

### Default Behavior

By default, the log level is set to `INFO`, which shows:
- ✅ Errors (e.g., "Failed to load playlist")
- ✅ Warnings (e.g., "Using relay connection - may cause FLAC issues")
- ✅ Important info (e.g., "Loaded 31,365 tracks in 12.3s")
- ❌ Debug details (e.g., "Selected connection: https://...")

## Usage in Code

```typescript
import { logger } from './utils/logger';

// Critical errors (always visible)
logger.error('Playlist', 'Failed to load:', error);

// Warnings about degraded functionality (visible at WARN+)
logger.warn('Connection', '⚠️ Using relay connection - may cause issues');

// Important operation summaries (visible at INFO+)
logger.info('Playlist', `Loaded ${count} tracks in ${time}s`);

// Detailed/repetitive operations (only at DEBUG level)
logger.debug('Connection', `Selected: ${url} (relay: ${isRelay})`);

// Grouped debug output (collapsible in console)
logger.group('Connection', 'Scoring all connections', () => {
  connections.forEach(conn => {
    logger.debug('Connection', `${conn.uri}: score ${conn.score}`);
  });
});
```

## Best Practices

### Use `logger.info()` for:
- Operation start/end points
- Summary counts (e.g., "Loaded 500 tracks")
- User-visible state changes
- Performance metrics

### Use `logger.debug()` for:
- Per-iteration logs in loops
- Connection selection details
- Repetitive state updates
- Internal function calls

### Use `logger.warn()` for:
- Degraded functionality (e.g., relay connections)
- Recoverable errors
- Configuration issues

### Use `logger.error()` for:
- Unrecoverable errors
- Failed operations
- Data corruption

## Examples

### Before (Cluttered Console)
```typescript
// Logs 3 lines per batch (63 batches = 189 lines!)
console.log('[Connection] Available connections:', 4);
console.log('[Connection] Prefer local:', false);
console.log('[Connection] Selected:', url);
console.log('[Playlist] Loaded batch 8/63 (4000/31365 tracks)');
```

### After (Clean Console at INFO level)
```typescript
// Single summary line
logger.info('Playlist', `Loading 31,365 tracks in 63 batches...`);

// Details only visible at DEBUG level
logger.debug('Connection', `Selected: ${url} (relay: ${isRelay})`);
logger.debug('Playlist', `Batch 8/63 (4000/31365 tracks)`);

// Single completion summary
logger.info('Playlist', `Loaded 31,365 tracks in 12.3s`);
```

## Debugging Issues

If you're troubleshooting a specific issue:

1. **Enable DEBUG logging**:
   ```javascript
   logger.setLevel('DEBUG')
   ```

2. **Reproduce the issue** (now you'll see detailed logs)

3. **Reset to INFO** when done:
   ```javascript
   logger.setLevel('INFO')
   ```

## Technical Details

- **Storage**: Log level preference stored in `localStorage.DEBUG_LEVEL`
- **Global Access**: `window.logger` available in browser console for debugging
- **Default**: `INFO` level (shows errors, warnings, and important operations)
- **Performance**: Minimal overhead - checks are simple comparisons

## Migration Status

### ✅ Completed
- `src/utils/connectionSelector.ts` - Connection selection moved to DEBUG
- `src/hooks/usePlaylistTracks.ts` - Batch loading moved to DEBUG, summaries at INFO
- `src/utils/queueStore.ts` - Queue persistence moved to DEBUG

### ⏳ Future Candidates
- `src/hooks/useAudioPlayer.ts` - Audio playback events
- `src/components/ServerSelector.tsx` - Server refresh operations
- `src/hooks/usePlaylists.ts` - Playlist fetching
- `src/utils/backendDetector.ts` - Backend detection
