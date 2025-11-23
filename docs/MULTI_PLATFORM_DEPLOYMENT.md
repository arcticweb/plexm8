# Multi-Platform Deployment Guide

PlexM8 is designed to support multiple deployment platforms. Choose the option that best fits your needs.

## Deployment Options

### 1. **Netlify (Recommended - Currently Active)** ✅

**Best for:** Production, testing, serverless functions

**Current Status:** 🟢 ACTIVE - Primary deployment target

**Advantages:**
- ✅ Built-in Netlify Functions (solves CORS issues)
- ✅ Auto-deployment on push
- ✅ Free tier: 125,000 function invocations/month
- ✅ Preview deployments for PRs
- ✅ Better analytics and monitoring
- ✅ Environment variables management

**Setup:** See [Netlify Deployment Guide](./netlify-deployment.md)

**Cost:** FREE (within generous free tier)

**URL:** `https://plexm8.netlify.app`

---

### 2. **GitHub Pages** 

**Best for:** Static hosting, backup deployment, no backend needed

**Current Status:** 🟡 DISABLED - Available if needed

**Advantages:**
- ✅ Free, integrated with GitHub repo
- ✅ No separate account needed
- ✅ Simple static file hosting
- ✅ Great for fork/community deployments

**Limitations:**
- ⚠️ No backend functions (requires Netlify Functions workaround)
- ⚠️ CORS limitations for API calls
- ⚠️ All requests must go through Netlify proxy

**Setup:** 
1. Re-enable workflow: `mv .github/workflows/deploy-gh-pages.yml.disabled .github/workflows/deploy-gh-pages.yml`
2. Push to main branch
3. GitHub Actions auto-deploys
4. Site available at: `https://arcticweb.github.io/plexm8/`

**Cost:** FREE

**Environment:** Uses `VITE_APP_BASE_PATH=/plexm8/` (subpath deployment)

---

### 3. **Vercel** (Planned)

**Best for:** High-performance edge functions, existing Vercel users

**Current Status:** 🔴 NOT YET CONFIGURED

**Advantages:**
- ✅ Vercel Edge Functions (better performance than Netlify)
- ✅ Integrated with Next.js ecosystem
- ✅ Free tier sufficient
- ✅ Better cold start times

**Limitations:**
- ⚠️ `vercel.json` needs configuration
- ⚠️ Functions need Vercel-specific format

**Setup:** To be documented

**Cost:** FREE (within generous free tier)

---

### 4. **Firebase Hosting** (Planned)

**Best for:** Google Cloud integration, global CDN

**Current Status:** 🔴 NOT YET CONFIGURED

**Advantages:**
- ✅ Global CDN
- ✅ Cloud Functions for backend
- ✅ Integrated Firebase ecosystem
- ✅ Real-time database available

**Limitations:**
- ⚠️ Slightly more complex setup
- ⚠️ Google account required

**Setup:** To be documented

**Cost:** FREE (within generous free tier)

---

### 5. **Self-Hosted (Node.js + Express)**

**Best for:** Complete control, custom domain, privacy-focused

**Current Status:** 🔴 NOT YET CONFIGURED

**Advantages:**
- ✅ Full control over infrastructure
- ✅ No vendor lock-in
- ✅ Custom domain
- ✅ Can add features without platform restrictions

**Limitations:**
- ⚠️ Server management required
- ⚠️ Cost depends on hosting provider
- ⚠️ SSL certificate management
- ⚠️ Uptime monitoring needed

**Estimated Cost:** $5-20/month (depending on provider)

**Providers:**
- Railway.app (recommended)
- Render.com
- Heroku (paid)
- DigitalOcean
- Your GoDaddy VPS

---

## Current Architecture

```
┌─────────────────────────────────────┐
│     Frontend Source Code            │
│     (React + TypeScript)            │
│     GitHub Repository               │
└──────────────┬──────────────────────┘
               │
               ├─→ Netlify (PRIMARY) ✅
               │   ├─ Frontend: CDN
               │   └─ Functions: Auth proxy
               │
               └─→ GitHub Pages (AVAILABLE)
                   └─ Frontend only (static)
                      (uses Netlify proxy)
```

## Comparison Table

| Feature | Netlify | GitHub Pages | Vercel | Firebase |
|---------|---------|--------------|--------|----------|
| **Cost** | FREE | FREE | FREE | FREE |
| **Functions** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **CDN** | ✅ Global | ✅ Global | ✅ Global | ✅ Global |
| **Setup Complexity** | Easy | Easy | Medium | Medium |
| **CORS Support** | ✅ Built-in | ⚠️ Via proxy | ✅ Built-in | ✅ Built-in |
| **Preview URLs** | ✅ Yes | ❌ No | ✅ Yes | ⚠️ Partial |
| **Cold Start** | 200-500ms | N/A | 50-200ms | 100-300ms |
| **Analytics** | ✅ Good | ✅ Good | ✅ Excellent | ✅ Good |

## How to Switch Deployments

### Activate GitHub Pages (while keeping Netlify)

```powershell
# Re-enable GitHub Pages workflow
Rename-Item -Path .github/workflows/deploy-gh-pages.yml.disabled -NewName deploy-gh-pages.yml

# Commit and push
git add .github/workflows/
git commit -m "Enable GitHub Pages deployment"
git push

# GitHub Actions will deploy to GitHub Pages
# Also still deploys to Netlify (both active)
```

### Disable GitHub Pages (focus on Netlify)

```powershell
# Currently already disabled - workflow file is renamed
# To re-disable after activating:
Rename-Item -Path .github/workflows/deploy-gh-pages.yml -NewName deploy-gh-pages.yml.disabled

git add .github/workflows/
git commit -m "Disable GitHub Pages deployment"
git push
```

### Test Specific Deployment

```powershell
# Load utilities
. ./scripts/plexm8-utils.ps1

# Build for specific environment
Build-Project -Environment dev    # For Netlify (root path /)
# GitHub Pages needs: npm run build:prod (path /plexm8/)

# Deploy to Netlify
Deploy-ToNetlify                  # Preview
Deploy-ToNetlify -Production      # Production
```

## Environment Configuration

### Netlify
- **Base Path:** `/` (root deployment)
- **Environment Variables:** Set in Netlify Dashboard
- **Build Command:** `npm run build`
- **Deploy Directory:** `dist/`

### GitHub Pages
- **Base Path:** `/plexm8/` (subpath deployment)
- **Environment Variables:** In `netlify.toml` (if using Netlify Functions)
- **Build Command:** `npm run build:prod`
- **Deploy Directory:** `dist/`

## Adding New Deployment Platforms

To add support for another platform:

1. **Create platform-specific config file**
   - Example: `vercel.json`, `firebase.json`, `heroku.yml`

2. **Update build scripts** (if needed)
   - Add environment-specific build commands

3. **Document setup instructions**
   - Add to `docs/deployment-[platform].md`

4. **Update this guide**
   - Add platform comparison
   - Include setup steps

5. **Test thoroughly**
   - Build locally
   - Deploy to staging
   - Verify functions work

## Recommended Workflow for Contributors

### For Development
```powershell
npm run dev  # Local development
```

### For Testing
```powershell
# Test all possible deployments locally
npm run build              # Netlify build
npm run build:prod         # GitHub Pages build

# Deploy to staging for review
Deploy-ToNetlify           # Preview on Netlify
```

### For Contributors Forking
- Use Netlify for fastest setup
- OR use GitHub Pages if you prefer GitHub-only workflow
- OR use your preferred platform from the options above

## FAQ

### Can I use multiple deployments simultaneously?
**Yes!** Currently:
- Netlify: Active (primary)
- GitHub Pages: Can be re-enabled for dual deployment

### Which should I use for production?
**Netlify** - it has better function support and is our primary target.

### Can community contributors use different platforms?
**Yes!** Fork and deploy to:
- Your own Netlify site
- Your own GitHub Pages
- Vercel, Firebase, or any other platform

### Do I need to maintain all platforms?
**No.** Netlify is the primary. Others are available as options.

### What if a platform changes pricing?
All current options have generous free tiers. If a platform changes:
1. Migrate to another free tier option
2. Update documentation
3. Notify contributors

## Related Documentation

- [Netlify Deployment Guide](./netlify-deployment.md)
- [GitHub Pages Configuration](./deployment-paths.md)
- [PowerShell Deployment Utilities](./powershell-utilities.md)
- [Architecture Overview](./architecture.md)

## Support

For questions about:
- **Netlify:** See [netlify-deployment.md](./netlify-deployment.md)
- **GitHub Pages:** See [deployment-paths.md](./deployment-paths.md)
- **New platforms:** Open a GitHub issue with platform name

## Summary

🎯 **Current Setup:**
- **Netlify:** PRIMARY (✅ Active)
- **GitHub Pages:** Available (🟡 Disabled)

✅ **Why this approach?**
- Netlify has functions for our auth proxy
- GitHub Pages available as backup
- Easy to test both before committing
- Great for open-source community choice

🚀 **Next Steps:**
1. Test Netlify authentication thoroughly
2. Add more deployment guides
3. Let community choose their platform
