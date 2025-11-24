# Backend Documentation

Documentation for the PlexM8 local Python backend and API.

## Quick Links

- **[Local Backend Setup](../setup/local-backend-setup.md)** - Installation and configuration guide
- **[API Reference](api-reference.md)** - Complete API endpoint documentation
- **[Implementation Status](implementation-status.md)** - Current feature status and roadmap

## Overview

The PlexM8 backend is an optional local Python application that provides advanced features:

- Ratings sync from iTunes, foobar2000, and other players
- Smart playlist creation and management
- AI-powered music recommendations
- Batch operations and advanced tools

## Architecture

The backend consists of:

```
tools/python/
├── app.py                  # Flask application
├── config.py              # Configuration management
├── setup.py               # Automated setup script
├── setup.ps1              # Windows PowerShell setup
├── requirements.txt       # Python dependencies
├── .env.local.template    # Configuration template
├── api/                   # REST API blueprints
│   ├── health.py         # Health check endpoint
│   ├── playlists.py      # Playlist operations
│   ├── ratings.py        # Rating management
│   └── recommendations.py # Recommendations
├── services/              # Business logic
│   └── plex_service.py   # PlexAPI wrapper
└── models/                # Data structures
    └── playlist.py       # Data classes
```

## Technology Stack

- **Flask 3.0** - Web framework
- **PlexAPI 4.17.2** - Plex Media Server integration
- **NumPy/scikit-learn** - Machine learning (future)
- **Pandas** - Data analysis (future)
- **Python 3.9+** - Runtime

## Feature Status

| Feature | Status | Details |
|---------|--------|---------|
| Health Check | ✓ Implemented | Backend status endpoint |
| Playlist Management | ✓ Implemented | List, create, get items |
| Basic Ratings | ✓ Implemented | Rate tracks, get top-rated |
| iTunes Sync | ⏳ Stub | Framework ready |
| foobar2000 Sync | ⏳ Stub | Framework ready |
| Recommendations | ⏳ Stub | ML framework ready |
| Smart Playlists | ⏳ Stub | Framework ready |

## Getting Started

### For End Users

1. See [Local Backend Setup](../setup/local-backend-setup.md) for installation
2. Run the automated setup script: `python setup.py`
3. Configure your Plex server details in `.env.local`
4. Start the backend: `python app.py`

### For Developers

1. Review [API Reference](api-reference.md) for endpoint details
2. See [Hybrid Architecture](../hybrid-architecture.md) for design overview
3. Check [Implementation Status](implementation-status.md) for roadmap
4. Backend source code is in `tools/python/`

## Frontend Integration

The frontend (React app) automatically detects the local backend via `useBackendDetection` hook:

- Checks `http://localhost:5000/api/health` on app load
- 3-second timeout for non-blocking detection
- Falls back to Netlify proxy if not available
- Shows conditional menu items based on available features

## Configuration

Environment variables in `.env.local`:

```env
# Required
PLEX_TOKEN=your_plex_token_here

# Optional
PLEX_SERVER_URL=http://192.168.1.100:32400
DEBUG=False
PORT=5000
```

See [Local Backend Setup](../setup/local-backend-setup.md) for detailed configuration.

## API Endpoints

All endpoints respond with JSON and support both HTTP and CORS requests.

### Core Endpoints

- `GET /api/health` - Health check and feature list
- `GET /api/playlists` - List playlists
- `POST /api/playlists` - Create playlist
- `GET /api/playlists/{id}/items` - Get items in playlist
- `POST /api/ratings/rate` - Rate a track
- `GET /api/ratings/top-rated` - Get top-rated tracks
- `POST /api/ratings/sync` - Sync from local players
- `GET /api/recommendations/similar` - Similar tracks
- `GET /api/recommendations/based-on-ratings` - Recommendations

For full documentation, see [API Reference](api-reference.md).

## Development

### Adding a New Endpoint

1. Create method in `services/plex_service.py`
2. Create route in appropriate `api/*.py` file
3. Add to `app.py` blueprint registration
4. Document in [API Reference](api-reference.md)
5. Test with curl/Postman

### Running in Development

```bash
# Activate venv
source venv/bin/activate  # or .\venv\Scripts\Activate.ps1 on Windows

# Set debug mode
export DEBUG=True  # or $env:DEBUG="True" on Windows

# Run
python app.py
```

## Troubleshooting

### Backend won't start

1. Check Python version: `python --version` (needs 3.9+)
2. Check venv activated: Prompt should show `(venv)`
3. Check dependencies: `pip install -r requirements.txt`
4. Check Plex token in `.env.local`

### Health check fails

1. Check backend is running: `curl http://localhost:5000/api/health`
2. Check Plex server is reachable
3. Check .env.local has valid PLEX_TOKEN

### Frontend doesn't detect backend

1. Check backend health endpoint returns 200 OK
2. Frontend must be at https://plexm8.netlify.app (HTTPS)
3. Backend at http://localhost:5000 (HTTP, no HTTPS)
4. Check browser console for CORS errors

## Performance

- Average response time: <100ms for most operations
- Supports concurrent requests
- Auto-disconnect unused Plex connections
- Logging to `logs/` directory for debugging

## Security

- Token stored only in `.env.local` (not in code)
- CORS restricted to known origins
- All requests validated
- No sensitive data logged

## See Also

- [Hybrid Architecture Design](../hybrid-architecture.md)
- [Setup Guide](../setup/local-backend-setup.md)
- [PlexAPI Documentation](https://python-plexapi.readthedocs.io/)
