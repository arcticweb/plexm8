# Deployment Guide

Complete guide to deploying PlexM8 to GitHub Pages with automatic CI/CD.

## Overview

PlexM8 is deployed to GitHub Pages automatically via GitHub Actions. Every push to the `main` branch triggers a build and deployment pipeline.

## Prerequisites

- GitHub repository with Actions enabled
- Repository with GitHub Pages configured
- Main branch protection (recommended)

## GitHub Pages Configuration

### 1. Enable GitHub Pages

1. Go to repository **Settings**
2. Navigate to **Pages** section
3. Set source to **GitHub Actions**
4. Save settings

### 2. Configure Custom Domain (Optional)

1. Go to **Settings** → **Pages**
2. Enter custom domain (e.g., `plexm8.example.com`)
3. Update DNS records
4. GitHub will add `CNAME` file automatically

## GitHub Actions Workflow

The deployment workflow is defined in `.github/workflows/deploy-gh-pages.yml`

### Pipeline Steps

```
1. Checkout code
   ↓
2. Setup Node.js 18
   ↓
3. Install dependencies (npm ci)
   ↓
4. Type checking (npm run type-check)
   ↓
5. Linting (npm run lint)
   ↓
6. Build application (npm run build)
   ↓
7. Upload build artifact
   ↓
8. Deploy to GitHub Pages
```

### Workflow File

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # ... steps above
      
  deploy:
    needs: build
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      # Deploy artifact to GitHub Pages
```

## Build Configuration

### Vite Build Settings

Configuration in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  
  // Set base URL for GitHub Pages
  base: process.env.GITHUB_PAGES ? '/plexm8/' : '/',
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split vendor code for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'zustand', 'axios'],
        },
      },
    },
  },
})
```

### Environment Variables

Set during build:
```bash
GITHUB_PAGES=true npm run build
```

## Local Deployment Testing

### 1. Build Locally

```bash
npm run build
```

### 2. Test Build Output

```bash
npm run preview
```

Opens app at `http://localhost:4173/plexm8/`

### 3. Deploy to GitHub Pages Manually

```bash
# Install gh-pages deployment tool
npm install --save-dev gh-pages

# Add deploy script to package.json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

# Deploy
npm run deploy
```

## Production Settings

### GitHub Pages Caching

GitHub Pages serves with appropriate cache headers:

- **Static assets** (`.js`, `.css`): 1 year cache
- **HTML files**: No cache (always fetch fresh)
- **Service Worker**: No cache (always fetch fresh)

### HTTPS

GitHub Pages automatically provides HTTPS:
- ✅ Enabled by default
- ✅ Auto-renews certificates
- ✅ Redirect HTTP → HTTPS

## Monitoring Deployments

### GitHub Actions Dashboard

1. Go to repository **Actions** tab
2. Select **Deploy to GitHub Pages** workflow
3. View deployment history and logs

### Deployment Status

Click on workflow run to see:
- Build logs
- Type check results
- Lint results
- Deploy status
- Deployment URL

### Failed Deployments

If deployment fails:

1. Check workflow logs for errors
2. Common issues:
   - Type errors: `npm run type-check` locally
   - Lint errors: `npm run lint` locally
   - Build errors: `npm run build` locally
3. Fix issues and push to main
4. Workflow will re-run automatically

## Manual Deployment

### Direct Upload (Not Recommended)

If needed for emergency deployment:

1. Go to repository **Settings** → **Pages**
2. Change source to "Deploy from a branch"
3. Create `gh-pages` branch
4. Merge dist folder
5. Switch back to "GitHub Actions"

## Rollback Procedure

### Rollback to Previous Version

```bash
# Find previous commit
git log --oneline | head -10

# Revert to specific commit
git revert <commit-hash>

# Push to main (triggers new deployment)
git push origin main
```

The deployment will automatically use the reverted code.

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer

# Check build output
npm run build
```

### Lighthouse Score

Check PWA score after deployment:

```
URL: https://yourusername.github.io/plexm8/

Metrics:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+
- PWA: 90+
```

## Custom Domain Setup

### DNS Configuration

For custom domain `plexm8.example.com`:

**Option 1: CNAME Record**
```
CNAME plexm8.example.com → yourusername.github.io
```

**Option 2: A Records**
```
A 185.199.108.153
A 185.199.109.153
A 185.199.110.153
A 185.199.111.153
```

### Verify Domain

```bash
# Check DNS propagation
nslookup plexm8.example.com
dig plexm8.example.com

# GitHub automatically adds CNAME file
```

## SSL/TLS Certificate

GitHub Pages provides free SSL:

- ✅ Auto-provisioned certificate
- ✅ Auto-renewal (no action needed)
- ✅ Wildcard support available
- ✅ No manual configuration required

## Deployment Checklist

- [ ] GitHub Pages enabled in repository settings
- [ ] Main branch protection configured
- [ ] All tests pass locally
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Build completes successfully
- [ ] Deployment workflow configured
- [ ] Deploy URL accessible
- [ ] Service Worker registered
- [ ] PWA installable
- [ ] HTTPS working

## Troubleshooting

### Build Fails

```
Error: Cannot find module 'react'
```

Solution:
```bash
npm install
npm run build
```

### Workflow Not Triggering

Check:
1. Workflow file in `.github/workflows/`
2. Branch is `main`
3. Actions enabled in Settings
4. Workflow syntax valid

### Page Shows 404

Check:
1. GitHub Pages source set to "GitHub Actions"
2. Deployment completed successfully
3. Base path correct in `vite.config.ts`
4. Try hard refresh (Ctrl+Shift+R)

### Slow Performance

Check:
1. Bundle size with `npm run build`
2. Service Worker caching strategy
3. Image optimization
4. Enable gzip compression (GitHub default)

## Advanced Configuration

### Environment Variables

Store sensitive data in GitHub Actions secrets:

```bash
# In Settings → Secrets and variables → Actions
# Add secrets like API keys
```

Usage in workflow:
```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}
```

### Deployment Notifications

Send notifications on deployment:

```yaml
- name: Notify Deployment
  if: success()
  run: |
    echo "Deployment successful: ${{ steps.deployment.outputs.page_url }}"
```

## Related Documentation

- [Architecture Overview](./architecture.md)
- [API Integration](./api/plex-integration.md)
- [PWA Setup](./pwa-setup.md)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
