# Netlify Deployment Guide

Complete guide for deploying PlexM8 to Netlify with Netlify Functions backend.

## Overview

PlexM8 uses a hybrid deployment architecture:
- **Frontend**: React SPA deployed to Netlify CDN (GitHub Pages compatible)
- **Backend**: Netlify Functions for Plex API proxying (solves CORS issues)

This provides:
- ✅ Zero-cost serverless backend
- ✅ CORS-free Plex API access
- ✅ Automatic HTTPS
- ✅ Global CDN performance
- ✅ Integrated CI/CD with GitHub

## Prerequisites

1. **GitHub Account** with plexm8 repository
2. **Netlify Account** (free tier sufficient)
3. **Netlify CLI** installed locally
4. **Node.js 18+** and **npm 9+**

## Installation Steps

### 1. Install Netlify CLI

```powershell
npm install -g netlify-cli
netlify --version
```

### 2. Connect Netlify to your GitHub repo

#### Option A: Via Netlify Dashboard (Recommended for first-time)

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub as provider
4. Authorize Netlify to access your repositories
5. Select `arcticweb/plexm8`
6. Keep build settings as default (already configured in netlify.toml)
7. Click "Deploy site"

#### Option B: Via Netlify CLI (from local machine)

```powershell
# Load utilities
. ./scripts/plexm8-utils.ps1

# Authenticate with Netlify
netlify login

# Connect to your site
netlify link

# Deploy
Deploy-ToNetlify -Production
```

### 3. Verify deployment

After deployment:
1. Visit your Netlify site URL (e.g., `https://plexm8.netlify.app`)
2. Open browser console (F12)
3. Click "Sign in to Plex"
4. Verify no CORS errors appear
5. PIN should be generated successfully

## Configuration Files

### netlify.toml

Main configuration file (already created):

```toml
[build]
  command = "npm run build"      # Build command
  publish = "dist"               # Deploy this folder
  functions = "netlify/functions" # Functions location

[context.production]
  environment = { VITE_APP_BASE_PATH = "/plexm8/" }
```

### netlify/functions/auth.ts

Backend proxy function that:
- Accepts requests from frontend
- Proxies them to Plex API
- Handles CORS automatically
- Returns responses to frontend

## Deployment Workflow

### Development → Staging → Production

```
1. Local Development
   ↓
2. Git Commit & Push
   ↓
3. Netlify Auto-Deploy (staging)
   ↓
4. Review & Test
   ↓
5. Deploy to Production
```

### Automatic Deployments

Every push to `main` branch triggers automatic deployment to staging:
- Build runs on Netlify servers
- Functions are packaged and deployed
- Preview URL generated
- Tests run (if configured)

### Manual Production Deployment

```powershell
. ./scripts/plexm8-utils.ps1
Deploy-ToNetlify -Production
```

Or via Netlify Dashboard:
1. Go to Netlify site settings
2. Find deploy preview
3. Click "Publish deploy"

## Environment Variables

### No secrets needed for initial setup

The auth proxy doesn't require secrets initially. When implementing JWT auth later, you'll need:

```
PLEX_CLIENT_SECRET = (your Plex app secret)
JWT_PRIVATE_KEY = (your app's private key)
```

Set these in Netlify Dashboard:
1. Go to Site Settings → Build & Deploy → Environment
2. Add environment variables
3. Redeploy

## Monitoring & Logs

### View Function Logs

```powershell
# Live logs from current site
netlify functions:invoke auth --identity

# Logs from Netlify Dashboard:
# 1. Go to Netlify Dashboard
# 2. Site → Functions → Logs
```

### View Build Logs

```powershell
# In Netlify Dashboard:
# 1. Click "Deploys"
# 2. Click any deploy
# 3. Scroll to "Deploy log"
```

### Performance Metrics

In Netlify Dashboard:
- Analytics: Pageviews, bandwidth
- Functions: Invocations, execution time
- Errors: Failed requests

## Rollback a Deployment

If something goes wrong:

```powershell
# Via CLI - Redeploy previous version
netlify deploy --prod --trigger-build

# Via Dashboard:
# 1. Click "Deploys"
# 2. Find working version
# 3. Click "Publish deploy"
```

## Troubleshooting

### Build fails with "Cannot find @netlify/functions"

```powershell
# Solution: Install dependencies
npm install
npm run build
```

### Functions not working (502 errors)

1. Check function logs in Netlify Dashboard
2. Verify `netlify/functions/auth.ts` syntax
3. Ensure all imports are available
4. Check Node.js version compatibility

### CORS still not working

This means your frontend isn't calling the Netlify functions. Check:

1. Frontend is calling `/.netlify/functions/auth` not `plex.tv`
2. Browser console shows no mixed content warnings
3. Function logs show incoming requests

### Can't connect to Plex after deployment

1. Verify Netlify functions have internet access (should be automatic)
2. Check Plex API is not rate-limiting your client ID
3. Try generating new PIN with different client ID

## Performance Optimization

### Cold Start Optimization

Netlify Functions warm up automatically. To keep them warm:
- Visit the site regularly during initial usage
- First request may be 200-500ms slower
- Subsequent requests are typically <100ms

### Build Optimization

Current build size:
- Frontend: ~30KB (gzipped)
- Functions: ~5KB
- Total: ~35KB

## Next Steps

### After successful deployment:

1. ✅ Test authentication flow
   ```powershell
   # Open deployed site
   Start-Process "https://your-netlify-site.app"
   ```

2. ✅ Test Plex integration
   - Login with Plex account
   - Verify user info loads
   - Check error handling

3. ✅ Implement JWT authentication
   - See: [JWT Migration Guide](./authentication.md)

4. ✅ Add more Netlify functions as needed
   - Resources endpoint
   - Playlist operations
   - Server management

## Cost Breakdown

**Monthly cost: $0** (Free tier sufficient)

- Netlify: Free tier = 125,000 function invocations/month
- GitHub: Included with free account
- Plex API: Free to use

Upgrade to paid only when exceeding free tier limits.

## Related Documentation

- [PlexM8 Architecture](./architecture.md)
- [PowerShell Utilities](./powershell-utilities.md)
- [GitHub Pages Setup](./deployment-paths.md)
- [Authentication Flow](./authentication.md)

## Support & Issues

### Common issues:

1. **Site deploys but 404 on subpaths**
   - Check `netlify.toml` redirects
   - Verify `VITE_APP_BASE_PATH` configuration

2. **Functions timeout**
   - Default timeout is 10s
   - For longer operations, upgrade to Netlify Pro

3. **Large build artifacts**
   - Current build: ~35KB gzipped
   - Well within free tier limits

See the [troubleshooting guide](./quick-reference.md) for more help.
