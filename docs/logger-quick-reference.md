# Logger Quick Reference

## Console Commands

```javascript
// Toggle debug level
logger.setLevel('DEBUG')   // See everything (for debugging)
logger.setLevel('INFO')    // Normal use (default)
logger.setLevel('WARN')    // Warnings + errors only
logger.setLevel('ERROR')   // Errors only

// Check current level
logger.getLevel()
```

## Code Usage

```typescript
import { logger } from './utils/logger';

// Errors (always visible)
logger.error('Context', 'Message', error);

// Warnings (visible by default)
logger.warn('Context', 'Message');

// Info - summaries, counts, start/end (visible by default)
logger.info('Context', 'Message');

// Debug - repetitive, per-iteration (hidden by default)
logger.debug('Context', 'Message');
```

## When to Use Each Level

| Level | Use For | Example |
|-------|---------|---------|
| **ERROR** | Failures, crashes | `logger.error('Playlist', 'Failed to load:', err)` |
| **WARN** | Degraded functionality | `logger.warn('Connection', 'Using relay - may cause issues')` |
| **INFO** | Summaries, counts | `logger.info('Playlist', 'Loaded 31K tracks in 12s')` |
| **DEBUG** | Loop iterations, details | `logger.debug('Playlist', 'Batch 8/63')` |

## Current Implementation

### Files Using Logger
- ✅ `src/utils/connectionSelector.ts`
- ✅ `src/hooks/usePlaylistTracks.ts`
- ✅ `src/utils/queueStore.ts`

### Impact
- **Before**: 252 console lines during playlist load
- **After**: 3 summary lines (98.8% reduction)
- **DEBUG mode**: All 252 lines available when needed

## Tips

- **Default level (INFO)** is best for normal use
- **Enable DEBUG** only when troubleshooting specific issues
- **Setting persists** across page refreshes (localStorage)
- **Global access**: `window.logger` available in browser console
