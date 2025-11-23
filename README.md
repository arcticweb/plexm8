# PlexM8: Smart Playlist Manager for Plex

A modern, installable web application for managing music playlists in your Plex Media Server. Built with React, TypeScript, and Vite.

## Features

- **Smart Playlist Management**: Create, edit, and organize music playlists seamlessly
- **Multi-Platform**: Works on Chrome, Edge, and Android as a PWA (Progressive Web App)
- **Secure Authentication**: OAuth-based authentication with Plex account integration
- **Offline Support**: Service worker enables basic offline functionality
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Sync**: Instant synchronization with Plex Media Server

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Access to a Plex Media Server with music library

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── main.tsx              # Application entry point
├── App.tsx              # Root component
├── api/
│   └── plex.ts         # Plex API integration
├── components/
│   ├── PlexAuth.tsx    # Authentication component
│   ├── PlaylistManager.tsx
│   ├── Player.tsx
│   └── InstallPrompt.tsx
├── hooks/
│   └── usePlexApi.ts   # Custom Plex API hook
├── pages/
│   ├── Home.tsx
│   └── Playlists.tsx
├── utils/
│   └── storage.ts      # Local storage utilities
└── styles/
    └── app.css         # Application styles

public/
├── index.html          # Main HTML file
├── manifest.json       # PWA manifest
├── service-worker.js   # Service worker for offline support
└── icons/             # PWA icons
```

## Documentation

See **[docs/README.md](docs/README.md)** for complete documentation including:

- **[Getting Started](docs/getting-started.md)** - Setup and first steps
- **[Architecture](docs/architecture.md)** - Application design and state management
- **[API Integration](docs/api/plex-integration.md)** - Plex API usage and authentication
- **[Deployment](docs/deployment.md)** - GitHub Pages deployment guide
- **[PWA Setup](docs/pwa-setup.md)** - Progressive Web App configuration
- **[Project Progress](docs/project/progress.md)** - Development roadmap

## Deployment

The application is configured for automatic deployment to GitHub Pages:

```bash
npm run build
# Deployment happens automatically via GitHub Actions
```

See [deployment guide](docs/deployment.md) for detailed instructions.

## Authentication Flow

PlexM8 uses OAuth-based authentication with JWT support:

1. User initiates login via the authentication component
2. Application creates a PIN on plex.tv
3. User authenticates with Plex account
4. Application exchanges PIN for access token
5. Access token stored securely in browser

See [API Integration docs](docs/api/plex-integration.md) for implementation details.

## Browser Support

- Chrome/Chromium 90+
- Edge 90+
- Firefox 88+
- Safari 14+
- Android Browser (Chrome/Edge)

## Contributing

Please ensure code follows the ESLint configuration and TypeScript strict mode requirements.

```bash
npm run lint
npm run format
npm run type-check
```

## License

See LICENSE file for details.

## Support

For issues and feature requests, please open an issue on GitHub.
