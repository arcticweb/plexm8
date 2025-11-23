# Dynamic Path Configuration - Implementation Summary

## What Changed

Your project now has **zero hardcoded paths**. Everything is configured via environment variables and automatically handled by Vite.

### Files Modified

| File | Change | Impact |
|------|--------|--------|
| `vite.config.ts` | Uses `VITE_APP_BASE_PATH` from .env files | All assets prefixed correctly |
| `src/App.tsx` | Uses `getBasePath()` instead of hardcoded `/plexm8/` | Router works anywhere |
| `public/index.html` | Paths changed from `/plexm8/manifest.json` to `/manifest.json` | Vite injects base path |
| `package.json` | Added manifest generator + environment-specific build scripts | Automatic config per environment |

### Files Created

| File | Purpose | Environment |
|------|---------|-------------|
| `.env.development` | Base path `/` | `npm run dev` |
| `.env.production` | Base path `/plexm8/` | `npm run build` |
| `src/utils/basePath.ts` | Path resolution utility | All environments |
| `scripts/generate-manifest.mjs` | Dynamic PWA manifest generation | Build time |
| `docs/deployment-paths.md` | Complete configuration guide | Reference |

## How to Use

### Development
```bash
npm run dev
# Runs on http://localhost:5173/
# Base path = /
```

### Production Build
```bash
npm run build
# Base path = /plexm8/
# Optimized for GitHub Pages
```

### Custom Deployments
```bash
# For staging environment at /plexm8-staging/
cross-env VITE_APP_BASE_PATH=/plexm8-staging/ npm run build

# For custom domain at /music/
cross-env VITE_APP_BASE_PATH=/music/ npm run build
```

## Key Benefits

✅ **No More Hardcoded Paths**
- All paths derived from environment variables
- Change one value, everything updates

✅ **Environment-Specific Configs**
- Dev: `/`
- Prod: `/plexm8/`
- Staging: `/plexm8-staging/` (or any path)

✅ **Automatic Asset Injection**
- Vite prepends base path to all assets
- No manual path management needed

✅ **Zero Migration Friction**
- Moving to `/music/`? Update `.env.production`, rebuild, done
- No code changes required

✅ **Type-Safe**
- `getBasePath()` utility provides TypeScript autocomplete
- Runtime safety verified at build time

## Example: Moving to `/music/`

**Current Production Setup:**
```env
# .env.production
VITE_APP_BASE_PATH=/plexm8/
```

**New Production Setup:**
```env
# .env.production
VITE_APP_BASE_PATH=/music/
```

**Result:**
```bash
npm run build
# Everything automatically updates:
# - React Router basename: /music/
# - Manifest paths: /music/icons/...
# - HTML asset links: /music/manifest.json
```

## Where to Go Next

**Learn More:**
- Read `docs/deployment-paths.md` for detailed configuration guide
- Review `docs/deployment.md` for GitHub Actions setup
- Check `src/utils/basePath.ts` for available utility functions

**Making Changes:**
- Update `.env.development` to change dev base path
- Update `.env.production` to change prod base path
- Never hardcode paths in HTML/components

**Advanced Usage:**
- Use `resolveAsset()` for component assets
- Use `resolveUrl()` for external requests
- Check `docs/quick-reference.md` for code examples

## Technical Details

### Build-Time vs Runtime

**Build-Time (Vite):**
- `.env` files read during build
- Vite injects `base` path into bundled assets
- Manifest generated with correct paths

**Runtime (Browser):**
- `getBasePath()` reads from `import.meta.env`
- React Router uses basename for navigation
- Service Worker respects base path automatically

### Environment Loading

Vite automatically loads `.env` files in this order:
1. `.env` (all environments)
2. `.env.{mode}` (specific mode)

So `.env.production` only loads during production build, not dev.

### CI/CD Integration

Your GitHub Actions workflow can now:
```yaml
- run: npm run build  # Uses .env.production automatically
```

Or for multiple environments:
```yaml
- run: npm run build:prod    # Production deployment
- run: npm run build:staging # Staging deployment
```

---

**Status**: ✅ Complete and Ready
**Dependencies**: cross-env (added to package.json)
**Breaking Changes**: None (all changes backward compatible)
