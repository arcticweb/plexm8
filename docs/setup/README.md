# Setup Documentation

Installation and configuration guides for PlexM8.

## Quick Start

- **[Local Backend Setup](local-backend-setup.md)** - Install optional Python backend
- **[Environment Configuration](../getting-started.md)** - Initial app configuration

## Available Setups

### Local Backend (Optional)

Advanced features require the optional local Python backend:

- Ratings sync from music players
- Smart playlist creation
- AI recommendations
- Batch operations

**Time to setup**: ~10 minutes
**Difficulty**: Beginner-friendly with automated scripts

See [Local Backend Setup](local-backend-setup.md) for complete guide.

### Frontend Only (Default)

The web app works perfectly without the local backend:

- Create and manage playlists
- Browse and play music
- Works offline with service worker
- No extra setup required

Just open https://plexm8.netlify.app and start using it.

## Platform-Specific

- **[Windows Setup](local-backend-setup.md#step-1-install-python)** - Python installation for Windows
- **[macOS Setup](local-backend-setup.md#step-1-install-python)** - Python installation for macOS
- **[Linux Setup](local-backend-setup.md#step-1-install-python)** - Python installation for Linux

## Troubleshooting

See the [Troubleshooting section](local-backend-setup.md#troubleshooting) in the backend setup guide.

## Environment Variables

### Frontend (.env.production)

```
VITE_APP_BASE_PATH=/
VITE_PLEX_DIRECT_DOMAIN=plex.direct
```

### Backend (.env.local)

```
PLEX_TOKEN=your_token
PLEX_SERVER_URL=http://192.168.1.100:32400
DEBUG=False
PORT=5000
```

## Related Documentation

- [Hybrid Architecture](../hybrid-architecture.md) - System design
- [Backend Documentation](../backend/) - Backend details
- [Getting Started](../getting-started.md) - Initial setup
