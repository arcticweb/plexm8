# Python Integration Analysis: PlexM8 Enhancement Options

## Executive Summary

**RECOMMENDATION: Use Python-PlexAPI as a foundation library, integrated via local PowerShell utilities for Windows users.**

Python-PlexAPI is the clear winner for foundational API access, while plex-music-rating-sync is too specialized and outdated for direct integration. Both require local Python environments - they cannot run directly in the browser.

---

## Project Comparison

### 1. Python-PlexAPI
**Repository**: https://github.com/pushingkarmaorg/python-plexapi  
**License**: BSD-3-Clause  
**Status**: ✅ ACTIVELY MAINTAINED

#### Key Metrics
| Aspect | Status |
|--------|--------|
| Last Update | 5 days ago (v4.17.2) |
| Contributors | 96 active developers |
| Stars | 1.2k |
| Python Version | 3.9+ minimum (modern) |
| Maintenance | Excellent - regular commits and releases |
| Community | Discord channel, extensive documentation |

#### Capabilities
- ✅ Full Plex API wrapper with 90+ endpoint support
- ✅ Navigate libraries, search, manage content
- ✅ Remote control and playback on clients
- ✅ Rate media (Example 9: `rate(8.0)`)
- ✅ Playlist operations (create, modify, delete)
- ✅ Collection management
- ✅ Server notifications/events listening
- ✅ Sonos speaker integration
- ✅ JWT authentication support (modern)
- ✅ MyPlex account integration

#### Architecture
```
PlexAPI Structure:
├── plexapi.server.PlexServer → Direct server connection
├── plexapi.myplex.MyPlexAccount → Account & resource management
├── plexapi.library → Music, Movies, TV Shows libraries
├── plexapi.playlist → Playlist manipulation
├── plexapi.client → Playback control
└── plexapi.sync → Mobile sync API
```

#### Use Cases for PlexM8
1. **Ratings Sync**: Rate tracks via `track.rate(score)`
2. **Playlist Management**: Full CRUD operations
3. **Recommendations**: Query library with custom filters
4. **Smart Playlists**: Programmatic playlist creation based on ratings
5. **Track Metadata**: Access to all track properties for sorting
6. **Client Control**: Play/pause/seek/queue operations

#### Limitations
- Requires Python environment on user's machine
- Cannot run directly in browser/mobile
- API-only (no UI, no database)
- Platform-specific dependencies

#### Dependencies (Clean)
```txt
requests               # HTTP client
xml.etree.ElementTree # Built-in XML parsing
websocket-client     # For notifications
certifi              # SSL certificates
```

---

### 2. plex-music-rating-sync
**Repository**: https://github.com/patzm/plex-music-rating-sync  
**License**: GPL-3.0  
**Status**: ⚠️ MAINTENANCE MODE (Last update: 4 years ago)

#### Key Metrics
| Aspect | Status |
|--------|--------|
| Last Update | 4 years ago |
| Contributors | 2 developers |
| Stars | 54 |
| Python Version | 3.6+ (outdated minimum) |
| Maintenance | **STALLED** - no recent activity |
| Windows Only | Yes (MediaMonkey COM interface) |

#### Capabilities
- ✅ Sync track ratings from MediaMonkey ↔ Plex
- ✅ Sync playlists (one-way: MM → Plex)
- ✅ Dry-run mode for safety
- ✅ Fuzzy matching for track identification
- ✅ Conflict resolution
- ❌ Plex → MediaMonkey not implemented
- ❌ MediaMonkey v5+ not supported
- ❌ No playlist sync from Plex to local

#### Architecture
```
plex-music-rating-sync:
├── sync_ratings.py → Main CLI entry point
├── sync_items.py → Track/playlist sync logic
├── sync_pair.py → Match local ↔ Plex tracks
├── MediaPlayer.py → MediaMonkey COM interface
└── Uses PlexAPI v4.2.0 (2019 library version)
```

#### Problems with This Approach
1. **Outdated**: Last commit 4 years ago, dependencies stale
2. **Windows-Only**: Hard dependency on MediaMonkey (COM interface)
3. **Narrow Scope**: Only syncs ratings/playlists with one local player
4. **No Maintenance**: Author states "completed all functionality I desired"
5. **Limited Flexibility**: Can't extend for other music managers or cloud services
6. **Not a Library**: It's a finished tool, not a foundation for new features

#### Why Not This?
- You'd inherit 4-year-old code and dependencies
- PlexAPI version locked at 4.2.0 (current is 4.17.2)
- Zero support for modern Plex features (JWT auth, new endpoints)
- Cannot adapt it for ratings recommendations or other features
- Would need significant refactoring anyway

---

## Architecture Recommendations

### ✅ RECOMMENDED: Python-PlexAPI + Local PowerShell Utilities

```
PlexM8 App Stack:
│
├─ Web App (React/TypeScript) [Browser]
│  ├─ User selects server
│  ├─ Browse playlists
│  ├─ Rate tracks (via Plex API)
│  └─ [Button] "Sync Local Ratings" → Launch PowerShell
│
├─ Netlify Functions [API Gateway]
│  └─ Proxy requests to Plex servers
│
└─ Local Tools (Windows) [User's Machine]
   ├─ plexm8-sync-ratings.ps1 [PowerShell wrapper]
   │  └─ Calls Python script
   │
   └─ sync_ratings.py [Python utility]
       ├─ Import ratings from local player (iTunes, foobar2000, etc.)
       ├─ Match to Plex tracks via PlexAPI
       ├─ Sync bidirectionally
       └─ Generate recommendations
```

### Implementation Strategy

#### Phase 1: Core PlexAPI Integration (Month 1-2)
Create Python utilities in `/tools/python/`:

```bash
tools/
├── python/
│  ├── requirements.txt         # Python dependencies
│  ├── sync_ratings.py          # Main rating sync tool
│  ├── sync_favorites.py        # Favorite tagging
│  ├── gen_recommendations.py   # ML-based recommendations
│  └── config.yaml              # User configuration
│
└── plexm8-sync-*.ps1           # PowerShell wrappers
```

**Advantages**:
- ✅ Leverage PlexAPI's 1.2k-star community
- ✅ Modern, actively maintained codebase
- ✅ Full Plex API coverage (not just ratings)
- ✅ Can extend for future features (recommendations, collection sync)
- ✅ Windows PowerShell integration for ease of use
- ✅ Optional: Package as single .exe with PyInstaller for non-technical users

#### Phase 2: Browser Integration (Month 2-3)
Add UI elements to PlexM8:

```tsx
// In Playlists page
<button onClick={syncLocalRatings}>
  🔄 Sync Local Ratings
</button>

// Opens instructions or runs PowerShell script
```

#### Phase 3: Advanced Features (Month 3+)
Using PlexAPI capabilities:

1. **Recommendations Engine**: Analyze top-rated tracks and suggest similar
2. **Smart Playlists**: Auto-generate playlists based on rating thresholds
3. **Collection Sync**: Sync favorite tracks to dedicated Plex Collections
4. **Cross-Device Ratings**: Sync ratings between multiple user accounts

---

## Implementation Plan: Python-PlexAPI + PowerShell

### Step 1: Create Python Tools Structure

```python
# tools/python/plexm8_utils.py - Core library
from plexapi.server import PlexServer

class PlexRatingSync:
    def __init__(self, server_url, token):
        self.plex = PlexServer(server_url, token)
    
    def rate_track(self, track_title, artist, rating):
        """Rate a track in Plex (0-10 scale)"""
        music = self.plex.library.section('Music')
        track = music.search(track_title, artist=artist)[0]
        track.rate(rating)
    
    def get_rated_tracks(self, min_rating=7):
        """Get all tracks with rating >= threshold"""
        music = self.plex.library.section('Music')
        # PlexAPI doesn't have direct rating filter,
        # but can iterate and check track.userRating
        rated = []
        for track in music.all():
            if hasattr(track, 'userRating') and track.userRating >= min_rating:
                rated.append(track)
        return rated
    
    def create_playlist_from_ratings(self, name, min_rating=7):
        """Create new playlist with top-rated tracks"""
        rated_tracks = self.get_rated_tracks(min_rating)
        playlist = self.plex.createPlaylist(name, items=rated_tracks)
        return playlist
```

### Step 2: PowerShell Wrapper

```powershell
# tools/plexm8-sync-ratings.ps1
<#
PlexM8 Rating Sync Utility
Syncs local music player ratings to Plex server

Usage:
    .\plexm8-sync-ratings.ps1 -ServerUrl "http://192.168.1.100:32400" -Token "xyz..." -SourceApp "iTunes"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$Token,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("iTunes", "Foobar2000", "MediaMonkey")]
    [string]$SourceApp = "iTunes"
)

$PythonExe = "python"  # Ensure Python is in PATH
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$PythonScript = Join-Path $ScriptPath "python\sync_ratings.py"

# Run Python script
& $PythonExe $PythonScript `
    --server-url $ServerUrl `
    --token $Token `
    --source $SourceApp `
    --dry  # Remove for production

Write-Host "Rating sync completed!" -ForegroundColor Green
```

### Step 3: Browser UI Integration

Add to `PlexM8/src/pages/Playlists.tsx`:

```tsx
// Add button in header
const handleSyncRatings = () => {
  if (navigator.platform.toLowerCase().includes('win')) {
    // Show instructions for Windows users
    alert(`
      To sync local ratings:
      1. Run: plexm8-sync-ratings.ps1 -ServerUrl "${window.location.origin}" -Token "${token}"
      2. Select your music player
      3. Ratings will sync to Plex
    `);
  } else {
    alert('Rating sync is available for Windows via PowerShell.');
  }
};

<button onClick={handleSyncRatings}>
  🔄 Sync Local Ratings
</button>
```

---

## Cost-Benefit Analysis

### Python-PlexAPI Integration
| Factor | Benefit |
|--------|---------|
| Development Time | Low - use existing stable library |
| Maintenance | Low - library actively maintained by 96 devs |
| Flexibility | High - full API access for future features |
| User Experience | Medium - requires PowerShell script (can be improved with UI) |
| Feature Scope | High - enables recommendations, smart playlists, etc. |
| Community Support | Excellent - 1.2k stars, Discord channel, docs |

### plex-music-rating-sync Integration
| Factor | Drawback |
|--------|----------|
| Development Time | Rewrite needed (4-year old code) |
| Maintenance | High - need to maintain fork |
| Flexibility | Low - tool is finished, not extensible |
| Dependencies | Outdated - PlexAPI 4.2.0 vs current 4.17.2 |
| Feature Scope | Limited - ratings only, MediaMonkey only |
| Community Support | None - author not maintaining |

---

## Alternative: Browser-Based Solution (Not Recommended)

### Why Direct Browser Integration Won't Work
1. **Browser Security**: Cannot execute Python locally from browser (CORS, sandbox)
2. **No Python Runtime**: Browser can't run Python natively
3. **No Local File Access**: Can't read iTunes/foobar2000 libraries
4. **No Process Execution**: Can't spawn system processes

### Options Considered & Rejected
- **Electron App**: Would need full app distribution
- **Server-Side Python**: Would sync everyone's ratings (wrong, ratings are per-user)
- **REST API**: Plex API doesn't expose local player access
- **WebAssembly**: No stable PlexAPI WASM binding exists

### Hybrid Approach (Recommended for Future)
If you want true web-based ratings sync:
1. Run Python backend on user's machine (headless)
2. Serve on localhost:5000
3. PlexM8 web app connects to localhost
4. PowerShell downloads and runs Python server on first setup

---

## Recommendation Summary

### ✅ DO THIS:
1. **Add Python-PlexAPI utility** in `/tools/python/` for rating/playlist sync
2. **Create PowerShell wrapper** for Windows users (easy install + run)
3. **Add "Sync Ratings" button** to PlexM8 UI that shows instructions
4. **Plan roadmap** for smart playlists and recommendations using PlexAPI

### ❌ DON'T DO THIS:
1. Don't try to integrate plex-music-rating-sync (too old, too narrow)
2. Don't try to run Python in browser (impossible)
3. Don't reinvent the wheel - PlexAPI is battle-tested and maintained

### 📋 NEXT STEPS:
1. **Week 1**: Review PlexAPI documentation
2. **Week 2**: Create prototype Python rating sync script
3. **Week 3**: Test with your KIM2 server
4. **Week 4**: Create PowerShell wrapper and UI integration
5. **Week 5+**: Plan advanced features (recommendations, ML)

---

## References

### PlexAPI
- GitHub: https://github.com/pushingkarmaorg/python-plexapi
- Docs: http://python-plexapi.readthedocs.io/
- Discord: https://discord.gg/GtAnnZAkuw
- PyPI: https://pypi.org/project/plexapi/

### Plex API Documentation
- Remote Control API: https://github.com/plexinc/plex-media-player/wiki/Remote-control-API
- Web API Docs: https://forums.plex.tv/discussion/104353/pms-web-api-documentation
- Finding Auth Token: https://support.plex.tv/articles/204059436-finding-your-account-token/

### Windows Integration
- PowerShell Documentation: https://docs.microsoft.com/en-us/powershell/
- PyInstaller (for .exe packaging): https://pyinstaller.org/

