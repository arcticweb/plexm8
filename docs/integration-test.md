# Netlify Functions Integration Test

Quick test to verify the authentication proxy is working correctly.

## Prerequisites

- Netlify site deployed
- Authentication functions running
- Browser with developer console

## Test Steps

### 1. Open the deployed site

```
https://your-netlify-site.netlify.app
```

### 2. Open browser console (F12)

### 3. Test PIN creation

In the console, run:

```javascript
// Test creating a PIN
fetch('/.netlify/functions/auth?clientId=test-client', {
  method: 'POST',
})
.then(r => r.json())
.then(d => console.log('PIN created:', d))
.catch(e => console.error('Error:', e))
```

**Expected response:**
```javascript
{
  id: 1234567890,
  code: "abc123def456",
  authToken: null,
  // ... other fields
}
```

### 4. Click "Sign in to Plex" button

This should:
- ✅ Call `/.netlify/functions/auth` to create PIN
- ✅ Display PIN code
- ✅ Open Plex auth app
- ❌ Should NOT show CORS errors

### 5. Monitor network requests

In DevTools → Network tab:
- Should see `auth?clientId=...` requests to `/.netlify/functions/auth`
- Should NOT see requests to `plex.tv` (all proxied through functions)
- Status should be 200 OK

## Troubleshooting

### 502 Bad Gateway error

This means the function is deployed but has an error:
1. Check Netlify Functions logs
2. Verify `netlify/functions/auth.ts` syntax
3. Ensure all imports exist

### CORS error appears

This means frontend is still calling Plex directly:
1. Check that `src/api/plex.ts` uses `/.netlify/functions/auth`
2. Rebuild and redeploy
3. Clear browser cache (Ctrl+Shift+Delete)

### Network requests go to plex.tv

Frontend is not using the proxy correctly:
1. Verify Netlify deployment is active
2. Check browser console for errors
3. Confirm baseURL in plex.ts

## Network monitoring

To debug network calls:

```javascript
// In browser console
// Monitor all fetch calls
window.originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch:', args[0]);
  return window.originalFetch(...args);
}
```

## Success indicators

✅ Authentication works correctly when:
1. PIN is created without errors
2. All requests go to `/.netlify/functions/auth`
3. No CORS errors in console
4. Plex app opens successfully
5. User can complete authentication

## Next steps

After successful integration test:
1. Test the full authentication flow
2. Monitor function logs for errors
3. Check Netlify analytics for function usage
4. Proceed to Phase 2 features (playlists)
