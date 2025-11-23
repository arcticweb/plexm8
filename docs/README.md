# PlexM8 Documentation

Complete documentation for PlexM8, a Smart Playlist Manager for Plex Media Server.

## 📚 Documentation Index

### Getting Started
- **[Getting Started Guide](./getting-started.md)** - Installation, setup, development workflow, first task (authentication)
- **[Quick Reference](./quick-reference.md)** - Commands, code patterns, styling guide, git workflow

### Core Architecture & Implementation
- **[Architecture Overview](./architecture.md)** - System design, component hierarchy, state management
- **[Implementation Details](./implementation.md)** - Technology stack, architecture, API design, build system
- **[Project Structure](./structure.md)** - Complete file organization, component hierarchy, development patterns

### Integration & Deployment
- **[Multi-Platform Deployment Guide](./MULTI_PLATFORM_DEPLOYMENT.md)** - Netlify (primary), GitHub Pages, Vercel, Firebase, self-hosted options
- **[Netlify Deployment](./netlify-deployment.md)** - Netlify setup, functions configuration, auto-deployment
- **[Deployment Guide](./deployment.md)** - GitHub Pages setup, GitHub Actions workflow, production deployment
- **[Plex API Guide](./api/plex-integration.md)** - Plex API usage, authentication flow, implementation details
- **[PWA Setup](./pwa-setup.md)** - Progressive Web App configuration, installation, offline support

### Advanced Topics
- **[Dynamic Path Configuration](./deployment-paths.md)** - Environment-based paths, zero hardcoding, multi-environment deployments
- **[Configuration Summary](./PATH_CONFIG.md)** - Quick reference for path configuration implementation
- **[Before & After Comparison](./BEFORE_AFTER.md)** - Visual guide showing path configuration changes
- **[PWA Icons Configuration](./icons-config.md)** - Icon setup, requirements, and best practices

### Project Management
- **[Setup Summary](./setup.md)** - What was built, quick start, next steps
- **[Project Progress](./project/progress.md)** - Development progress, roadmap, and status tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Access to a Plex Media Server

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd plexm8

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Code formatting
npm run format

# Build for production
npm run build
```

### Deployment

```bash
# Load PowerShell utilities (Windows)
. ./scripts/plexm8-utils.ps1

# Check project status
Check-ProjectStatus

# Deploy to Netlify (preview)
Deploy-ToNetlify

# Deploy to Netlify (production)
Deploy-ToNetlify -Production

# Full workflow: update, build, test, deploy
Update-Project
```

See [Multi-Platform Deployment Guide](./MULTI_PLATFORM_DEPLOYMENT.md) for all deployment options.

## Architecture Overview

PlexM8 is a modern SPA built with:
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand for lightweight, persistent state
- **HTTP Client**: Axios for API calls
- **Routing**: React Router v6
- **Styling**: CSS (no framework, lightweight footprint)

## Key Features

- ✅ OAuth-based Plex authentication
- ✅ Playlist creation and management
- ✅ Music player integration
- ✅ Progressive Web App (installable on Chrome, Edge, Android)
- ✅ Offline support via Service Worker
- ✅ Secure token storage in browser
- ✅ Responsive design for all devices

## API Integration

PlexM8 communicates with Plex Media Server using the official Plex API:
- **Authentication**: OAuth with PIN-based flow
- **Token Management**: Secure localStorage persistence
- **API Base**: https://plex.tv/api/v2

See [API Integration Guide](./api/plex-integration.md) for detailed implementation.

## Deployment

Production deployment to GitHub Pages is automated via GitHub Actions:

1. Push to `main` branch triggers workflow
2. Code is type-checked and linted
3. Application is built and optimized
4. Build artifact is deployed to GitHub Pages

See [Deployment Guide](./deployment.md) for setup instructions.

## Browser Support

- Chrome/Chromium 90+
- Edge 90+
- Firefox 88+
- Safari 14+
- Android Browser (Chrome/Edge)

## Contributing

1. Ensure code follows ESLint configuration
2. Run type checking and formatting
3. Test on multiple devices/browsers
4. Update documentation as needed

## Security Considerations

- Authentication tokens are stored locally in browser storage
- No tokens are sent to external servers
- HTTPS is required for all API communication
- Service Worker caches only static assets
- User data remains on their Plex server

## Support

For issues, feature requests, or questions:
1. Check existing issues on GitHub
2. Review documentation
3. Open a new issue with detailed information

## License

See LICENSE file for details.
