# PlexM8 Python Backend

Optional local backend for advanced Plex playlist management features.

## Quick Start

```bash
# Automated setup (all platforms)
python setup.py

# Or PowerShell (Windows)
.\setup.ps1
```

The setup scripts will:
- Verify Python 3.9+ is installed
- Create virtual environment
- Install dependencies
- Guide you through configuration

## What This Does

This backend provides advanced features for PlexM8:

- **Ratings Sync** - Sync ratings from iTunes, foobar2000, etc.
- **Smart Playlists** - Auto-create playlists based on criteria
- **Recommendations** - AI-powered music suggestions
- **Batch Operations** - Manage multiple tracks at once

## Requirements

- Python 3.9+
- 100 MB disk space
- Port 5000 available
- Local network access to Plex server

## Getting Help

- **Full Setup Guide**: See [`docs/setup/local-backend-setup.md`](../../docs/setup/local-backend-setup.md)
- **API Reference**: See [`docs/backend/api-reference.md`](../../docs/backend/api-reference.md)
- **Architecture**: See [`docs/hybrid-architecture.md`](../../docs/hybrid-architecture.md)

## Project Structure

```
.
├── setup.py              # Automated setup script
├── setup.ps1             # PowerShell setup (Windows)
├── app.py               # Flask application
├── config.py            # Configuration
├── requirements.txt     # Python dependencies
├── .env.local.template  # Configuration template
├── api/                 # REST API endpoints
│   ├── health.py       # Health check
│   ├── playlists.py    # Playlist operations
│   ├── ratings.py      # Ratings management
│   └── recommendations.py
├── services/            # Business logic
│   └── plex_service.py # PlexAPI wrapper
└── models/              # Data structures
    └── playlist.py     # Data classes
```

## Starting the Backend

After setup:

```bash
# Activate virtual environment
# Windows: .\venv\Scripts\Activate.ps1
# macOS/Linux: source venv/bin/activate

# Start backend
python app.py

# You should see:
# Running on http://127.0.0.1:5000
# Press CTRL+C to stop
```

## Configuration

1. Copy `.env.local.template` to `.env.local`
2. Add your Plex token:
   ```env
   PLEX_TOKEN=your_token_here
   ```
3. (Optional) Set server URL if auto-detection fails:
   ```env
   PLEX_SERVER_URL=http://192.168.1.100:32400
   ```

## Testing

```bash
# Health check
curl http://localhost:5000/api/health

# List playlists
curl http://localhost:5000/api/playlists
```

## Troubleshooting

### Virtual environment issues

```bash
# Recreate venv
rm -rf venv  # or: rmdir /s venv (Windows)
python -m venv venv
```

### Python not found

Install Python from https://www.python.org/downloads/ and add to PATH.

### Dependency issues

```bash
# Upgrade pip and setuptools
pip install --upgrade pip setuptools wheel

# Reinstall dependencies
pip install -r requirements.txt
```

### Plex connection issues

1. Verify Plex server is running
2. Check server URL in `.env.local`
3. Verify Plex token is valid
4. Check firewall allows port 5000

## Documentation

Complete documentation available in `docs/`:

- **Setup**: [`docs/setup/local-backend-setup.md`](../../docs/setup/local-backend-setup.md)
- **Backend**: [`docs/backend/`](../../docs/backend/)
- **Architecture**: [`docs/hybrid-architecture.md`](../../docs/hybrid-architecture.md)

## Development

### Adding Features

1. Add method to `services/plex_service.py`
2. Create route in `api/*.py`
3. Update configuration if needed
4. Test with curl/Postman
5. Document in API reference

### Debug Mode

```bash
# Set DEBUG in .env.local
DEBUG=True

# Run with verbose logging
python app.py
```

## Support

- Issues: https://github.com/arcticweb/plexm8/issues
- Documentation: See `docs/` folder
# Download from python.org or Windows Store

# 2. Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
Copy-Item .env.local.template .env.local
# Edit .env.local and add your PLEX_TOKEN

# 5. Run backend
python app.py
```

### Mac/Linux

```bash
# 1. Install Python 3.9+
# macOS: brew install python@3.9
# Linux: sudo apt-get install python3.9

# 2. Create virtual environment
python3.9 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.local.template .env.local
# Edit .env.local and add your PLEX_TOKEN

# 5. Run backend
python app.py
```

## Features

- **Ratings Management**: Sync and manage track ratings
- **Smart Playlists**: Create playlists based on ratings and criteria
- **Recommendations**: AI-powered music recommendations
- **Local Sync**: Sync ratings from iTunes, foobar2000, and other players
- **REST API**: Full API for frontend integration

## API Endpoints

### Health Check
```
GET /api/health
```
Check if backend is running and available features.

### Playlists
```
GET /api/playlists              # List all playlists
POST /api/playlists             # Create playlist
GET /api/playlists/{id}/items   # Get playlist items
```

### Ratings
```
POST /api/ratings/rate          # Rate a track
GET /api/ratings/top-rated      # Get top-rated tracks
POST /api/ratings/sync          # Sync ratings from local player
```

### Recommendations
```
GET /api/recommendations/similar              # Similar tracks
GET /api/recommendations/based-on-ratings     # Based on top ratings
```

## Configuration

Create `.env.local` with your settings:

```env
DEBUG=False
HOST=127.0.0.1
PORT=5000

# Get token from: https://support.plex.tv/articles/204059436/
PLEX_TOKEN=your_token_here
PLEX_SERVER_URL=http://192.168.1.100:32400
PLEX_CLIENT_ID=PlexM8-Local-Backend

LOG_LEVEL=INFO
```

## Frontend Integration

The frontend automatically detects if the local backend is running and enables the Tools menu.

Access the Tools page at: `https://plexm8.netlify.app/tools`

## Development

```bash
# Install development dependencies
pip install -r requirements.txt
pip install pytest pytest-cov

# Run tests
pytest

# Run with auto-reload
DEBUG=True python app.py
```

## Troubleshooting

### Connection Refused
- Ensure backend is running on localhost:5000
- Check firewall settings
- Verify `PLEX_SERVER_URL` is correct

### Invalid Token
- Get your token from: https://support.plex.tv/articles/204059436/
- Verify it's correct in `.env.local`
- Token may be restricted to server admin

### Import Errors
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`
- Check Python version is 3.9+

## Architecture

```
app.py              # Flask main application
├── api/            # REST API endpoints
│   ├── health.py
│   ├── playlists.py
│   ├── ratings.py
│   └── recommendations.py
├── services/       # Business logic
│   └── plex_service.py
├── models/         # Data models
└── config.py       # Configuration
```

## License

Same as PlexM8 main project
