# Plex API Integration

Complete guide to Plex API integration, authentication, and implementation details.

## Overview

PlexM8 communicates with Plex servers using the official Plex API v2. The implementation uses OAuth-based authentication with PIN verification.

**API Documentation**: https://developer.plex.tv/pms/

## Authentication Flow

### Step 1: Create Client Identifier

Generate a unique identifier for this device instance:

```typescript
const clientId = `plexm8-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
localStorage.setItem('plexm8-client-id', clientId)
```

### Step 2: Create PIN

Request a PIN from plex.tv that the user will claim:

```bash
POST https://plex.tv/api/v2/auth/pin?strong=true
Headers:
  X-Plex-Product: PlexM8
  X-Plex-Client-Identifier: <clientId>
  Accept: application/json
```

Response:
```json
{
  "id": 564964751,
  "code": "8lzjqnq8lye02n52jq3fqxf8e",
  "expiresAt": 1640000000
}
```

### Step 3: User Authentication

Direct user to Plex auth app:

```
https://app.plex.tv/auth#?
  clientID=<clientId>&
  code=<pinCode>&
  context[device][product]=PlexM8&
  forwardUrl=<appUrl>
```

User authenticates with their Plex account and claims the PIN.

### Step 4: Check PIN Status

Poll the PIN endpoint to check if user has authenticated:

```bash
GET https://plex.tv/api/v2/auth/pin/<pinId>
Headers:
  X-Plex-Client-Identifier: <clientId>
  Accept: application/json
```

Response (after user authenticates):
```json
{
  "id": 564964751,
  "code": "8lzjqnq8lye02n52jq3fqxf8e",
  "authToken": "XXXXXXXXXXXX",
  "user": {
    "id": 12345,
    "email": "user@example.com",
    "username": "myusername"
  }
}
```

### Step 5: Store Token

Save the access token for future API calls:

```typescript
localStorage.setItem('plexm8-token', authToken)
```

## API Requests

### Headers

All Plex API requests require these headers:

```typescript
{
  'X-Plex-Product': 'PlexM8',                    // App name
  'X-Plex-Client-Identifier': clientId,          // Device ID
  'X-Plex-Token': accessToken,                   // Auth token
  'X-Plex-Platform': 'Web|Android|iOS|macOS',    // Device platform
  'X-Plex-Device-Name': 'PlexM8 Web',            // Friendly name
  'Accept': 'application/json'                   // Response format
}
```

### Verify Token

Check if stored token is still valid:

```bash
GET https://plex.tv/api/v2/user
Headers: [standard headers with token]
```

Response codes:
- `200`: Token is valid
- `401`: Token is invalid/expired
- `429`: Rate limited (retry after delay)

## Getting Servers

### List Available Servers

```bash
GET https://clients.plex.tv/api/v2/resources
  ?includeHttps=1
  &includeRelay=1
  &includeIPv6=1
Headers: [standard headers]
```

Response includes:

```json
[
  {
    "name": "My Plex Server",
    "clientIdentifier": "abc123def456",
    "accessToken": "server-access-token",
    "address": "192.168.1.100",
    "port": 32400,
    "scheme": "http",
    "publicAddress": "1.2.3.4",
    "connection": [
      {
        "protocol": "http",
        "address": "192.168.1.100",
        "port": 32400,
        "uri": "http://192.168.1.100:32400",
        "local": true
      },
      {
        "protocol": "https",
        "address": "1-2-3-4.abc123.plex.direct",
        "port": 32400,
        "uri": "https://1-2-3-4.abc123.plex.direct:32400",
        "local": false
      }
    ]
  }
]
```

**Connection Priority**:
1. Local connections (`local: true`) - fastest
2. Relay connections - fallback if local unavailable
3. Remote connections - slowest

## Plex Media Server API

### Connect to Server

Use server's access token and URL from resources response:

```typescript
const serverUrl = `http://${server.address}:${server.port}`
const serverToken = server.accessToken
```

### Get Library Sections

```bash
GET http://<server>:32400/library/sections
  ?includeDetails=1
Headers:
  X-Plex-Token: <serverToken>
  Accept: application/json
```

Response includes music library sections with metadata.

### Get Playlists

For music library, fetch playlists:

```bash
GET http://<server>:32400/playlists
  ?type=10  # type 10 = music tracks
Headers:
  X-Plex-Token: <serverToken>
```

### Playlist Types

```
Type 1:  Movie
Type 2:  Show
Type 3:  Season
Type 4:  Episode
Type 8:  Artist
Type 9:  Album
Type 10: Track
Type 15: Playlist
```

## Error Handling

### Common Errors

```
401 Unauthorized
  → Token invalid or expired
  → Solution: Re-authenticate

429 Too Many Requests
  → Rate limited by API
  → Solution: Retry after delay (Retry-After header)

503 Service Unavailable
  → Server connection failed
  → Solution: Try alternate connection URL

400 Bad Request
  → Invalid request parameters
  → Solution: Check API documentation
```

### Retry Strategy

```typescript
async function callWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (error.status === 429) {
        const delay = error.headers['retry-after'] || (1000 * Math.pow(2, i))
        await sleep(delay)
      } else {
        throw error
      }
    }
  }
}
```

## Implementation Details

### PlexApiClient Class

Main client for API communication:

```typescript
class PlexApiClient {
  constructor(clientId: string, token?: string)
  
  async createPin(): Promise<PinResponse>
  async checkPin(pinId: number): Promise<PinResponse>
  async getCurrentUser()
  async getResources()
  setToken(token: string)
  getToken(): string | undefined
}
```

### Usage Example

```typescript
// Initialize
const client = new PlexApiClient(clientId)

// Create PIN and authenticate
const pin = await client.createPin()
// User authenticates in browser...
const pinResponse = await client.checkPin(pin.id)

// Set token and fetch user
if (pinResponse.authToken) {
  client.setToken(pinResponse.authToken)
  const user = await client.getCurrentUser()
  const servers = await client.getResources()
}
```

## Security Best Practices

### Token Storage

```typescript
// ✅ Do: Store in localStorage (encrypted by browser)
localStorage.setItem('plexm8-token', token)

// ❌ Don't: Log tokens to console in production
console.log(token)

// ❌ Don't: Send to external servers
fetch('https://example.com', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### HTTPS Only

```typescript
// ✅ All API requests use HTTPS
const baseURL = 'https://plex.tv/api/v2'

// ❌ Never use HTTP for token transmission
const baseURL = 'http://plex.tv/api/v2' // Don't!
```

### Token Expiration

```typescript
// Check token validity periodically
async function validateToken() {
  try {
    await client.getCurrentUser()
  } catch (error) {
    if (error.status === 401) {
      // Token expired, force re-authentication
      clearAuth()
    }
  }
}
```

## Pagination

Large responses support pagination:

```bash
GET http://<server>:32400/library/metadata
  ?X-Plex-Container-Start=0
  &X-Plex-Container-Size=50
```

Response headers:
```
X-Plex-Container-Start: 0
X-Plex-Container-Size: 50
X-Plex-Container-Total-Size: 1234
```

## Rate Limiting

Plex API enforces rate limits. Respect these headers:

```
Rate-Limit-Limit: 100         # Requests per minute
Rate-Limit-Remaining: 42      # Remaining in window
Retry-After: 60               # Seconds to wait (on 429)
```

## Testing with Actual Server

### Local Server Setup

1. Install Plex Media Server
2. Add music library with test files
3. Enable remote access in settings
4. Note server machine identifier and URL

### Testing Authentication

```bash
# Create test PIN
curl -X POST https://plex.tv/api/v2/auth/pin?strong=true \
  -H 'X-Plex-Product: PlexM8' \
  -H 'X-Plex-Client-Identifier: test-client-123'

# Manually authenticate in browser
# https://app.plex.tv/auth#?clientID=...

# Check PIN status
curl https://plex.tv/api/v2/auth/pin/<pinId> \
  -H 'X-Plex-Client-Identifier: test-client-123'
```

## Advanced Features

### Media Queries

Filter and search content:

```
GET http://<server>:32400/library/sections/1/all
  ?type=10              # Type (track)
  &sort=title           # Sort by title
  &limit=50             # Limit results
```

### Metadata Fields

Customize response fields:

```
GET http://<server>:32400/library/metadata/123
  ?includeOptionalFields=musicAnalysis
```

## Related Documentation

- [Plex API Reference](https://developer.plex.tv/pms/)
- [Architecture Overview](./architecture.md)
- [Deployment Guide](./deployment.md)
