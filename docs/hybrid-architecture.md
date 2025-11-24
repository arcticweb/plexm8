# PlexM8 Hybrid Architecture: Netlify + Local Python Backend

## Overview

PlexM8 will support two parallel architectures with auto-detection:

```
┌─────────────────────────────────────────────────────┐
│          PlexM8 React App (Netlify CDN)             │
│      https://plexm8.netlify.app                     │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
        ▼                            ▼
┌──────────────────┐    ┌──────────────────────────┐
│  PRODUCTION      │    │  LOCAL (OPTIONAL)        │
│  (Default)       │    │  (Power Users)           │
├──────────────────┤    ├──────────────────────────┤
│ Netlify          │    │ Python Flask Backend     │
│ Functions        │    │ localhost:5000           │
│ (CORS Proxy)     │    │ (Full PlexAPI)           │
├──────────────────┤    ├──────────────────────────┤
│ • Playlists      │    │ • Playlists              │
│ • Browse         │    │ • Ratings Sync           │
│ • View only      │    │ • Recommendations        │
│ • No auth sync   │    │ • Smart Playlists        │
│ • Works today    │    │ • ML Features            │
│ • No setup       │    │ • Advanced tools         │
│ • All users      │    │ • Needs Python install   │
│ • Cloud storage  │    │ • Opt-in                 │
└──────────────────┘    └──────────────────────────┘
```

## Architecture Decision Tree

```typescript
// On app load:
if (localStorage.get('preferLocalBackend') === true) {
  // User has opted in to local backend
  const health = await checkLocalBackend();
  if (health.ok) {
    // Local backend running, use it
    usedBackend = 'local';
    showToolsMenu = true;
  } else {
    // Local backend offline, fallback to Netlify
    usedBackend = 'netlify';
    showToolsMenu = false;
    notifyUser('Local backend offline, using cloud proxy');
  }
} else {
  // Default: use Netlify proxy
  usedBackend = 'netlify';
  showToolsMenu = false;  // Option to enable in settings
}
```

## Auto-Detection Implementation

### 1. Health Check Endpoint

**Local Backend** (`localhost:5000/api/health`)
```json
{
  "status": "ok",
  "version": "1.0.0",
  "features": ["playlists", "ratings", "recommendations"],
  "plexapi_version": "4.17.2"
}
```

**Netlify (Default)**
- Always available
- No health check needed
- Graceful degradation

### 2. Navigation Detection

```typescript
// src/utils/backendDetection.ts
export async function detectAvailableBackends() {
  const backends = {
    netlify: { available: true, priority: 1 },  // Always available
    local: { available: false, priority: 2 },   // Check health
  };

  try {
    const response = await fetch('http://localhost:5000/api/health', {
      method: 'GET',
      timeout: 3000,
    });
    if (response.ok) {
      backends.local.available = true;
      const data = await response.json();
      backends.local.features = data.features;
    }
  } catch (err) {
    // Local backend not available, use Netlify default
    console.log('Local backend not detected, using Netlify proxy');
  }

  return backends;
}
```

## Menu Structure with Hybrid Detection

### Navigation (App.tsx)

```
PlexM8
├─ Home
├─ Playlists
└─ Tools [CONDITIONAL - only if local backend detected]
   ├─ Ratings Manager
   ├─ Smart Playlists
   ├─ Recommendations
   └─ Settings
```

### Feature Availability

| Feature | Netlify Proxy | Local Backend |
|---------|---------------|---------------|
| Browse Playlists | ✅ | ✅ |
| View Playlist Items | ✅ | ✅ |
| Rate Tracks | ✅ | ✅ |
| Sync Local Ratings | ❌ | ✅ |
| Smart Playlist Creation | ❌ | ✅ |
| Recommendations | ❌ | ✅ |
| Batch Rating Import | ❌ | ✅ |
| Favorite Collection Sync | ❌ | ✅ |

## Implementation Phases

### Phase 1: CORS Fix (This Week)
✅ Create Netlify proxy for playlists
✅ Route browser requests through proxy
✅ Fix immediate CORS errors
- No changes to frontend structure

### Phase 2: Local Backend Framework (Week 2-3)
- Create `/tools/python/` Flask app
- Set up health check endpoint
- Implement basic `/api/playlists` endpoint
- Add auto-detection to React app

### Phase 3: Tools Menu & UI (Week 4-5)
- Create Tools page component
- Conditional routing based on backend
- Settings panel for backend selection
- User documentation

### Phase 4: Features (Week 6+)
- Ratings sync UI
- Smart playlist builder
- Recommendations engine
- Advanced tools

---

## Local Python Backend Structure

### Project Layout

```
tools/
├── python/
│   ├── requirements.txt
│   ├── app.py                    # Flask main entry point
│   ├── config.py                 # Configuration
│   ├── .env.local               # Local settings (git ignored)
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── health.py            # /health endpoint
│   │   ├── playlists.py         # /playlists endpoints
│   │   ├── ratings.py           # /ratings endpoints
│   │   ├── recommendations.py   # /recommendations endpoints
│   │   └── utils.py             # Shared utilities
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── plex_service.py      # PlexAPI wrapper
│   │   ├── rating_sync.py       # Rating sync logic
│   │   └── ml_service.py        # Recommendations engine
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── playlist.py
│   │
│   └── logs/
│       └── .gitkeep
│
├── plexm8-local-backend.ps1     # Start script (Windows)
├── plexm8-local-backend.sh      # Start script (Mac/Linux)
│
└── README.md                     # Setup instructions
```

### Flask App Structure (`tools/python/app.py`)

```python
from flask import Flask, jsonify
from flask_cors import CORS
from api import health, playlists, ratings
import logging
from datetime import datetime

app = Flask(__name__)

# Enable CORS for localhost connections
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
    }
})

# Register blueprints
app.register_blueprint(health.bp)
app.register_blueprint(playlists.bp)
app.register_blueprint(ratings.bp)

# Health check endpoint for frontend detection
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'features': ['playlists', 'ratings', 'recommendations'],
        'backend': 'python-plexapi',
    })

if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    logger.info('Starting PlexM8 Local Backend on http://localhost:5000')
    
    app.run(
        host='127.0.0.1',
        port=5000,
        debug=False,  # Set to True for development
        threaded=True,
    )
```

### Requirements (`tools/python/requirements.txt`)

```txt
Flask==3.0.0
Flask-CORS==4.0.0
plexapi==4.17.2
python-dotenv==1.0.0
requests==2.31.0
numpy==1.24.0
scikit-learn==1.3.0
pandas==2.1.0
```

---

## Frontend Implementation

### 1. Backend Detection Hook

```typescript
// src/hooks/useBackendDetection.ts
import { useEffect, useState } from 'react';

interface BackendInfo {
  available: boolean;
  type: 'local' | 'netlify';
  features: string[];
  url?: string;
}

export function useBackendDetection() {
  const [backend, setBackend] = useState<BackendInfo>({
    available: false,
    type: 'netlify',
    features: ['playlists', 'browse'],
  });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const detectBackend = async () => {
      try {
        // Try to reach local backend
        const response = await fetch('http://localhost:5000/api/health', {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        });

        if (response.ok) {
          const data = await response.json();
          setBackend({
            available: true,
            type: 'local',
            features: data.features,
            url: 'http://localhost:5000',
          });
          return;
        }
      } catch (err) {
        // Local backend not available
        console.log('Local backend not detected');
      }

      // Default to Netlify
      setBackend({
        available: true,
        type: 'netlify',
        features: ['playlists', 'browse'],
      });

      setChecking(false);
    };

    detectBackend();
  }, []);

  return { backend, checking };
}
```

### 2. Conditional Navigation

```typescript
// src/App.tsx
import { useBackendDetection } from './hooks/useBackendDetection';

function App() {
  const { token, initialized } = useAuthStore();
  const { backend } = useBackendDetection();

  return (
    <Router basename={getBasePath()}>
      <div className="app">
        <InstallPrompt />
        {!token || !initialized ? (
          <PlexAuth />
        ) : (
          <>
            <nav className="app-nav">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/playlists">Playlists</NavLink>
              
              {/* Only show Tools if local backend is available */}
              {backend.type === 'local' && (
                <NavLink to="/tools">
                  Tools
                  <span className="local-indicator">⚡ Local</span>
                </NavLink>
              )}
            </nav>

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/playlists" element={<Playlists />} />
              
              {backend.type === 'local' && (
                <Route path="/tools/*" element={<Tools backend={backend} />} />
              )}
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
}
```

### 3. Tools Page

```typescript
// src/pages/Tools.tsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import RatingsManager from '../components/tools/RatingsManager';
import SmartPlaylists from '../components/tools/SmartPlaylists';
import Recommendations from '../components/tools/Recommendations';

interface ToolsProps {
  backend: { type: 'local' | 'netlify'; url?: string; features: string[] };
}

export default function Tools({ backend }: ToolsProps) {
  return (
    <div className="tools-page">
      <div className="tools-header">
        <h1>🛠 Advanced Tools</h1>
        <p className="backend-status">
          Using local backend: <strong>{backend.url}</strong>
        </p>
      </div>

      <div className="tools-container">
        <nav className="tools-nav">
          <Link to="/tools/ratings" className="tool-item">
            ⭐ Ratings Manager
            <p>Sync and manage track ratings</p>
          </Link>
          
          <Link to="/tools/smart-playlists" className="tool-item">
            🎯 Smart Playlists
            <p>Create playlists based on ratings</p>
          </Link>
          
          <Link to="/tools/recommendations" className="tool-item">
            💡 Recommendations
            <p>AI-powered track suggestions</p>
          </Link>
        </nav>

        <div className="tools-content">
          <Routes>
            <Route path="/ratings" element={<RatingsManager />} />
            <Route path="/smart-playlists" element={<SmartPlaylists />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/" element={<ToolsHome />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function ToolsHome() {
  return (
    <div className="tools-home">
      <h2>Welcome to Advanced Tools</h2>
      <p>Select a tool from the left menu to get started.</p>
    </div>
  );
}
```

---

## API Design: Local Backend Endpoints

### Health Check
```
GET /api/health
Response:
{
  "status": "ok",
  "version": "1.0.0",
  "features": ["playlists", "ratings", "recommendations"],
  "plexapi_version": "4.17.2"
}
```

### Playlists (Local)
```
GET /api/playlists?serverUrl=http://...&token=...
Response: Same as Netlify proxy, but with local PlexAPI
```

### Ratings Sync
```
POST /api/ratings/sync
Body: {
  "source": "itunes" | "foobar2000" | "media-monkey",
  "dryRun": true,
  "matchStrategy": "fuzzy" | "exact"
}
Response: {
  "synced": 42,
  "conflicts": 3,
  "failed": 0,
  "details": [...]
}
```

### Smart Playlists
```
POST /api/smart-playlists/create
Body: {
  "name": "Top Rated This Month",
  "criteria": {
    "minRating": 8,
    "addedAfter": "2025-10-01",
    "genres": ["rock", "jazz"]
  }
}
Response: {
  "playlistId": "xyz",
  "tracksAdded": 25,
  "playlistUrl": "plex://..."
}
```

### Recommendations
```
GET /api/recommendations?trackId=abc&limit=10
Response: {
  "recommendations": [
    {
      "title": "Song Name",
      "artist": "Artist",
      "matchScore": 0.92,
      "reason": "Similar to your top-rated tracks"
    }
  ]
}
```

---

## User Experience

### For Average Users (Default)
1. Open plexm8.netlify.app
2. Log in with Plex
3. Browse playlists ✅
4. View all features
5. No local setup needed

### For Power Users (Optional)
1. Open plexm8.netlify.app
2. Log in with Plex
3. See "Tools" menu appears (if local backend detected)
4. OR: Download Python backend from GitHub
5. Run: `python tools/python/app.py`
6. App detects running backend
7. "Tools" menu auto-appears
8. Access advanced features
9. Enjoy ratings sync + recommendations

---

## Setup Guide for Local Backend

### Windows Users

```powershell
# 1. Install Python 3.9+
# Download from python.org or use Windows Store

# 2. Clone/download PlexM8
git clone https://github.com/arcticweb/plexm8.git
cd plexm8/tools/python

# 3. Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the backend
python app.py

# Console output:
# Starting PlexM8 Local Backend on http://localhost:5000
```

### Mac/Linux Users

```bash
# 1. Install Python 3.9+
# macOS: brew install python@3.9
# Linux: sudo apt-get install python3.9

# 2. Clone/download PlexM8
git clone https://github.com/arcticweb/plexm8.git
cd plexm8/tools/python

# 3. Create virtual environment
python3.9 -m venv venv
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the backend
python app.py

# Console output:
# Starting PlexM8 Local Backend on http://localhost:5000
```

---

## Migration Path

### Week 1: CORS Proxy (Current)
- ✅ Netlify Functions as default CORS proxy
- ✅ All users get playlists working
- ✅ No local backend needed

### Week 2-3: Local Backend Framework
- Create Python Flask scaffolding
- Health check endpoint
- Basic routing
- Documentation

### Week 4-5: Auto-Detection UI
- Frontend detection hook
- Conditional menu rendering
- Settings panel
- Backend selector

### Week 6+: Features
- Ratings sync
- Smart playlists
- Recommendations
- Advanced tools

---

## Error Handling & Fallback

```typescript
// If user has local backend selected but it goes offline:
const fetchPlaylists = async () => {
  try {
    // Try local backend first
    if (backend.type === 'local') {
      return await fetchFromLocal();
    }
  } catch (err) {
    console.warn('Local backend failed, falling back to Netlify');
    return await fetchFromNetlify();  // Automatic fallback
  }
};

// Graceful degradation:
// Local backend unavailable → Use Netlify
// Netlify unavailable → Show cached data
// Both unavailable → Show error with retry
```

---

## Security Considerations

### Local Backend
- ✅ Listens only on `127.0.0.1:5000` (localhost)
- ✅ Cannot be accessed from internet
- ✅ CORS restricted to localhost
- ✅ Data never leaves user's machine
- ✅ User controls when to run/stop

### Netlify Proxy
- ✅ Token passed in request, never stored
- ✅ Functions are serverless (no state)
- ✅ CORS properly configured
- ✅ Request logging for debugging

---

## Testing Strategy

### Phase 1: Manual Testing
- [ ] Netlify proxy working
- [ ] Local backend health check responding
- [ ] Auto-detection triggering correctly
- [ ] Fallback to Netlify on local failure

### Phase 2: Integration Testing
- [ ] Cross-backend data consistency
- [ ] Error scenarios
- [ ] Network timeouts
- [ ] Backend switching

### Phase 3: User Testing
- [ ] First-time user flow (Netlify default)
- [ ] Power user setup (local backend)
- [ ] Feature discoverability
- [ ] Documentation clarity

