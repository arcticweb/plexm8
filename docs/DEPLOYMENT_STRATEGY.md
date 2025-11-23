# Deployment Strategy: Netlify vs GitHub Pages

## Current Situation

You have PlexM8 deployed to BOTH:
- **GitHub Pages**: `https://arcticweb.github.io/plexm8/`
- **Netlify**: `https://plexm8.netlify.app/`

Both work, but maintaining two deployments is:
- ❌ Double the deployment effort
- ❌ Risk of version mismatch
- ❌ Confusing which is "production"
- ❌ More maintenance overhead

## Comparison

### GitHub Pages
**Pros:**
- ✅ Free, always available with GitHub
- ✅ Integrated with repository
- ✅ Simple static hosting

**Cons:**
- ❌ NO BACKEND SUPPORT (just static files)
- ❌ CORS issues for API calls
- ❌ Cannot use Netlify Functions
- ❌ No serverless function support
- ❌ Manual authentication workarounds needed

### Netlify
**Pros:**
- ✅ Free tier (125k function invocations/month)
- ✅ Built-in serverless functions
- ✅ CORS handled automatically
- ✅ Perfect for our Plex API proxy
- ✅ Environment variables/secrets management
- ✅ Better build caching
- ✅ Preview deployments for PRs
- ✅ Better analytics and monitoring

**Cons:**
- ❌ Separate service (vs GitHub-integrated)
- ❌ One more account to manage
- ❌ (Already have account - not an issue)

---

## Recommendation: **MOVE TO NETLIFY ONLY** 🎯

### Why:

1. **Netlify Functions are essential** for our authentication proxy
2. **Simpler deployment pipeline** - one deployment target
3. **Better developer experience** - preview URLs for PRs
4. **Netlify is free tier sufficient** - 125k invocations >> our needs
5. **GitHub Pages doesn't support our architecture** - static only

### Action Plan:

#### 1. Stop GitHub Pages deployment ✅
- Keep the GitHub repository as source
- Remove GitHub Pages deployment workflow
- Delete `/.github/workflows/deploy-gh-pages.yml`

#### 2. Use Netlify as primary ✅
- Already configured and working
- Auto-deploys on push to main
- Netlify Functions work seamlessly

#### 3. Update documentation
- Update `docs/deployment.md` to reference only Netlify
- Simplify setup instructions
- Remove GitHub Pages references

#### 4. Simplify build configuration
- Remove `VITE_APP_BASE_PATH` dual configuration
- Keep everything at root (`/`)
- Makes CI/CD simpler

---

## Implementation

### Step 1: Delete GitHub Actions workflow

```powershell
# Remove GitHub Pages deployment
git rm .github/workflows/deploy-gh-pages.yml
```

### Step 2: Update documentation

Change all references from:
- `https://arcticweb.github.io/plexm8/` 
to:
- `https://plexm8.netlify.app/`

### Step 3: Simplify build scripts

No more build variations needed:
- ❌ `npm run build:prod` (with `/plexm8/`)
- ❌ `npm run build:staging`
- ✅ `npm run build` (always `/`)

### Step 4: Update PowerShell utilities

Simplify deployment commands to just:

```powershell
Deploy-ToNetlify        # To staging
Deploy-ToNetlify -Prod  # To production
```

---

## Cost Analysis

### Current Setup
- GitHub Pages: FREE
- Netlify: FREE (125k invocations/month)
- **Total: $0/month**

### Simplified Setup (Netlify only)
- Netlify: FREE (125k invocations/month)
- **Total: $0/month**

**No cost difference** - Netlify free tier is more than sufficient.

---

## Migration Steps

### 1. Commit the auth function fix

```powershell
git add netlify/functions/auth.ts
git commit -m "fix: Correct Netlify Functions routing for auth endpoints"
git push
```

### 2. Test on Netlify

Verify auth works:
- Visit https://plexm8.netlify.app
- Click "Sign in with Plex"
- Verify PIN is generated
- Verify no 404 errors

### 3. Delete GitHub Pages setup

```powershell
git rm .github/workflows/deploy-gh-pages.yml
git commit -m "chore: Remove GitHub Pages deployment (using Netlify only)"
git push
```

### 4. Update documentation

Update `docs/deployment.md`:
- Remove GitHub Pages instructions
- Keep only Netlify setup
- Update all URLs

### 5. Test everything

```powershell
. ./scripts/plexm8-utils.ps1
Check-ProjectStatus
Deploy-ToNetlify -Production
```

---

## Decision

### Recommend: **SWITCH TO NETLIFY ONLY**

**Reasons:**
1. ✅ Netlify Functions are required for auth proxy
2. ✅ GitHub Pages cannot support backend
3. ✅ Simpler deployment = fewer bugs
4. ✅ Better developer experience
5. ✅ Same cost ($0)
6. ✅ Better analytics and monitoring

**Action:** Delete GitHub Actions, keep Netlify as primary.

---

## URL Changes

### Before (dual deployment)
- Dev: GitHub Pages (`https://arcticweb.github.io/plexm8/`)
- Prod: Netlify (`https://plexm8.netlify.app/`)

### After (Netlify only)
- Dev/Preview: PR previews on Netlify
- Prod: Netlify (`https://plexm8.netlify.app/`)
- Source: GitHub (no automatic GitHub Pages)

**Simpler, cleaner, better!**
