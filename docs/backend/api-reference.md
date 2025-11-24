# PlexM8 Local Backend - API Reference

## Base URL

```
http://localhost:5000
```

## Authentication

All endpoints use Plex API token authentication:

```
Header: X-Plex-Token: <your_plex_token>
```

For local backend, token is configured in `.env.local` (transparent to client).

---

## Health Check

### GET `/api/health`

Backend status and available features.

**Response**:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2024-11-23T14:30:00.000000",
  "features": [
    "playlists",
    "ratings",
    "recommendations",
    "smart-playlists"
  ],
  "backend": "python-plexapi",
  "plex_api_version": "4.17.2"
}
```

**Status Codes**:
- `200 OK` - Backend is running
- `500 Internal Server Error` - Backend error

---

## Playlists Endpoints

### GET `/api/playlists`

List all playlists for the authenticated user.

**Query Parameters**:
- `server_id` (optional) - Specific server ID

**Response**:
```json
{
  "MediaContainer": {
    "Metadata": [
      {
        "key": "/playlists/123",
        "title": "Favorites",
        "type": "audio",
        "smart": 0,
        "summary": "My favorite tracks",
        "leafCount": 42,
        "thumb": "/library/playlists/123/thumb",
        "icon": "playlist",
        "addedAt": 1700000000,
        "updatedAt": 1700000100
      }
    ]
  }
}
```

**Status Codes**:
- `200 OK` - Playlists retrieved
- `500 Internal Server Error` - Failed to fetch

---

### POST `/api/playlists`

Create a new playlist.

**Request Body**:
```json
{
  "title": "New Playlist",
  "description": "Optional description"
}
```

**Response**:
```json
{
  "success": true,
  "playlist": {
    "key": "/playlists/456",
    "title": "New Playlist",
    "type": "audio",
    "itemCount": 0
  }
}
```

**Status Codes**:
- `201 Created` - Playlist created
- `400 Bad Request` - Missing required fields
- `500 Internal Server Error` - Server error

---

### GET `/api/playlists/{id}/items`

Get items in a specific playlist.

**Path Parameters**:
- `id` - Playlist key/ID

**Query Parameters**:
- `limit` (optional, default: 50) - Number of items to return

**Response**:
```json
{
  "MediaContainer": {
    "Metadata": [
      {
        "key": "/library/metadata/1001",
        "title": "Song Title",
        "artist": "Artist Name",
        "album": "Album Name",
        "duration": 240000,
        "userRating": 8,
        "thumb": "/library/metadata/1001/thumb",
        "index": 1
      }
    ]
  }
}
```

**Status Codes**:
- `200 OK` - Items retrieved
- `500 Internal Server Error` - Server error

---

## Ratings Endpoints

### POST `/api/ratings/rate`

Rate a track on the Plex server.

**Request Body**:
```json
{
  "track_key": "/library/metadata/1001",
  "rating": 8
}
```

**Parameters**:
- `track_key` (required) - Track metadata key
- `rating` (required) - Rating value 0-10

**Response**:
```json
{
  "success": true,
  "message": "Track rated: 8/10",
  "track_key": "/library/metadata/1001"
}
```

**Status Codes**:
- `200 OK` - Track rated
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Server error

---

### GET `/api/ratings/top-rated`

Get top-rated tracks from the music library.

**Query Parameters**:
- `min_rating` (optional, default: 7) - Minimum rating threshold (0-10)
- `limit` (optional, default: 50) - Number of tracks to return

**Response**:
```json
{
  "tracks": [
    {
      "key": "/library/metadata/1001",
      "title": "Best Song",
      "artist": "Best Artist",
      "album": "Best Album",
      "userRating": 9.5,
      "thumb": "/library/metadata/1001/thumb"
    }
  ],
  "count": 5,
  "min_rating": 7
}
```

**Status Codes**:
- `200 OK` - Tracks retrieved
- `500 Internal Server Error` - Server error

---

### POST `/api/ratings/sync`

Sync ratings from a local media player to Plex.

**Request Body**:
```json
{
  "source": "itunes",
  "dry_run": true
}
```

**Parameters**:
- `source` (required) - 'itunes' | 'foobar2000' | 'media-monkey'
- `dry_run` (optional, default: true) - Test without applying changes

**Response**:
```json
{
  "source": "itunes",
  "synced": 42,
  "conflicts": 2,
  "failed": 0,
  "message": "Successfully synced 42 ratings"
}
```

**Status Codes**:
- `200 OK` - Sync completed
- `400 Bad Request` - Invalid source
- `500 Internal Server Error` - Server error

---

## Recommendations Endpoints

### GET `/api/recommendations/similar`

Get recommendations similar to a given track.

**Query Parameters**:
- `track_key` (required) - Reference track key
- `limit` (optional, default: 10) - Number of recommendations

**Response**:
```json
{
  "recommendations": [
    {
      "track": {
        "key": "/library/metadata/2001",
        "title": "Similar Song",
        "artist": "Similar Artist",
        "album": "Album"
      },
      "matchScore": 0.92,
      "reason": "Similar artist and genre"
    }
  ],
  "count": 5
}
```

**Status Codes**:
- `200 OK` - Recommendations retrieved
- `400 Bad Request` - Missing track_key
- `500 Internal Server Error` - Server error

---

### GET `/api/recommendations/based-on-ratings`

Get recommendations based on the user's top-rated tracks.

**Query Parameters**:
- `min_rating` (optional, default: 8) - Minimum rating to consider (0-10)
- `limit` (optional, default: 10) - Number of recommendations

**Response**:
```json
{
  "recommendations": [
    {
      "track": {
        "key": "/library/metadata/3001",
        "title": "Recommended Song",
        "artist": "Recommended Artist"
      },
      "matchScore": 0.87,
      "reason": "Similar to your top-rated tracks"
    }
  ],
  "count": 8,
  "based_on_rating": 8
}
```

**Status Codes**:
- `200 OK` - Recommendations retrieved
- `500 Internal Server Error` - Server error

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required parameters",
  "message": "Parameter 'rating' is required"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "The requested endpoint does not exist"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch playlists",
  "message": "Connection refused to Plex server"
}
```

---

## Rate Limiting

Currently no rate limiting. Future versions may implement:
- Per-IP rate limiting
- Per-user quota
- Burst allowance

---

## CORS Headers

All endpoints return CORS headers for localhost:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, X-Plex-Token, X-Plex-Client-Identifier
```

---

## Content Types

All endpoints:
- **Accept**: `application/json`
- **Return**: `application/json`

---

## Versioning

API version is returned in `/api/health`:

```json
{
  "version": "1.0.0"
}
```

Format: `MAJOR.MINOR.PATCH`

Breaking changes will increment MAJOR version.

---

## Examples

### cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Get playlists
curl http://localhost:5000/api/playlists

# Get top-rated tracks
curl http://localhost:5000/api/ratings/top-rated?min_rating=8&limit=20

# Rate a track
curl -X POST http://localhost:5000/api/ratings/rate \
  -H "Content-Type: application/json" \
  -d '{"track_key": "/library/metadata/123", "rating": 9}'
```

### JavaScript/Fetch

```javascript
// Health check
const response = await fetch('http://localhost:5000/api/health');
const data = await response.json();
console.log(data);

// Get playlists
const playlists = await fetch('http://localhost:5000/api/playlists');
const playlistData = await playlists.json();

// Rate a track
const rateResponse = await fetch('http://localhost:5000/api/ratings/rate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    track_key: '/library/metadata/123',
    rating: 9
  })
});
const rateData = await rateResponse.json();
```

### Python

```python
import requests

# Health check
response = requests.get('http://localhost:5000/api/health')
print(response.json())

# Get playlists
playlists = requests.get('http://localhost:5000/api/playlists')
print(playlists.json())

# Rate a track
response = requests.post(
    'http://localhost:5000/api/ratings/rate',
    json={
        'track_key': '/library/metadata/123',
        'rating': 9
    }
)
print(response.json())
```

---

## Future Endpoints (Planned)

- `GET /api/smart-playlists` - List smart playlists
- `POST /api/smart-playlists` - Create smart playlist
- `GET /api/collections` - List collections
- `POST /api/collections` - Create collection
- `PUT /api/playlists/{id}` - Update playlist
- `DELETE /api/playlists/{id}` - Delete playlist
- `DELETE /api/ratings/clear` - Clear all ratings

---

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/arcticweb/plexm8/issues
- Documentation: `/docs/hybrid-architecture.md`
