# Getting Started

Quick setup and first steps guide for PlexM8 development.

## Prerequisites

- Node.js 16+
- npm or yarn
- Git
- Access to a Plex Media Server (for testing)

## Installation

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages:
- React 18
- TypeScript 5
- Vite
- Zustand
- Axios
- React Router

### 2. Start Development Server

```bash
npm run dev
```

Opens app at `http://localhost:5173`

### 3. Begin Development

Open `src/App.tsx` and start exploring the codebase.

## Development Workflow

### Code Quality Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Code formatting
npm run format
```

### Build for Production

```bash
# Build
npm run build

# Test production build locally
npm run preview
```

## Project Structure

```
src/
├── main.tsx              # Entry point
├── App.tsx              # Root component
├── api/
│   └── plex.ts         # Plex API client
├── components/         # React components
├── pages/             # Page components
├── hooks/             # Custom hooks
├── utils/             # Utilities (state)
└── styles/            # Global styles
```

## Key Files to Review

| File | Purpose |
|------|---------|
| `src/api/plex.ts` | Plex API client implementation |
| `src/utils/storage.ts` | Zustand state stores |
| `src/App.tsx` | Main routing and component setup |
| `docs/architecture.md` | System design documentation |
| `QUICK_REFERENCE.md` | Common commands and patterns |

## First Task: Understand Authentication

1. Read `docs/api/plex-integration.md`
2. Review `src/api/plex.ts`
3. Check `src/components/PlexAuth.tsx`
4. Test authentication flow with real Plex server

## Running Tests

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

## Deployment

### Automatic Deployment

```bash
# Push to main branch
git push origin main

# GitHub Actions automatically:
# 1. Type checks
# 2. Lints code
# 3. Builds app
# 4. Deploys to GitHub Pages
```

### Manual Testing

```bash
npm run build
npm run preview
```

## Troubleshooting

### Dev Server Won't Start

```bash
npm install
npm run dev
```

### Type Errors

```bash
npm run type-check
```

### Lint Warnings

```bash
npm run lint
npm run format
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Start dev server
3. ✅ Explore codebase
4. Read [Architecture](./architecture.md) guide
5. Review [Plex API](./api/plex-integration.md) guide
6. Begin Phase 2 development

## Documentation

- [Architecture Overview](./architecture.md)
- [API Integration](./api/plex-integration.md)
- [Deployment Guide](./deployment.md)
- [PWA Setup](./pwa-setup.md)
- [Project Progress](./project/progress.md)

## Support

For detailed information, see the comprehensive documentation in the `docs/` directory.
