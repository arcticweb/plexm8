/**
 * Netlify Function: Plex API Proxy
 * 
 * Proxies requests to Plex Media Server with proper CORS headers.
 * This bypasses browser CORS restrictions when accessing local Plex servers.
 * 
 * Endpoints:
 * - GET /api/plex/playlists - Fetch user's playlists from selected server
 * - POST /api/plex/rate - Rate a track on the Plex server
 * - GET /api/plex/resources - Get available servers
 * - GET /api/plex/library/* - Access library sections
 */

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import axios from 'axios';
import { PLEX_CONFIG, getPlexHeaders, fillEndpointParams } from './config';

/**
 * Add CORS headers to response
 * Allows requests from plexm8.netlify.app
 */
function addCorsHeaders(statusCode: number, body: any) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, X-Plex-Token, X-Plex-Client-Identifier',
      'Content-Type': 'application/json',
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  };
}

/**
 * GET /api/plex/playlists
 * Fetch playlists from user's Plex server
 * Query params: serverUrl, token, clientId
 */
async function handleGetPlaylists(event: HandlerEvent) {
  try {
    const { serverUrl, token, clientId } = event.queryStringParameters || {};

    if (!serverUrl || !token || !clientId) {
      return addCorsHeaders(400, { 
        error: 'Missing required parameters: serverUrl, token, clientId' 
      });
    }

    // Decode base64-encoded URL if needed
    const decodedUrl = Buffer.from(serverUrl, 'base64').toString('utf-8');
    const plexUrl = `${decodedUrl}/playlists`;

    const response = await axios.get(plexUrl, {
      headers: getPlexHeaders(token, clientId),
      timeout: 10000,
    });

    return addCorsHeaders(200, response.data);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    const errorMessage = axios.isAxiosError(error)
      ? `${error.response?.status || 'Unknown'}: ${error.response?.statusText || error.message}`
      : error instanceof Error ? error.message : 'Unknown error';

    return addCorsHeaders(500, {
      error: 'Failed to fetch playlists',
      message: errorMessage,
    });
  }
}

/**
 * POST /api/plex/rate
 * Rate a track on the Plex server
 * Body: { serverUrl, token, clientId, trackKey, rating }
 */
async function handleRateTrack(event: HandlerEvent) {
  try {
    if (!event.body) {
      return addCorsHeaders(400, { error: 'Missing request body' });
    }

    const { serverUrl, token, clientId, trackKey, rating } = JSON.parse(event.body);

    if (!serverUrl || !token || !clientId || !trackKey || rating === undefined) {
      return addCorsHeaders(400, {
        error: 'Missing required fields: serverUrl, token, clientId, trackKey, rating',
      });
    }

    // Validate rating (0-10 scale)
    if (rating < 0 || rating > 10) {
      return addCorsHeaders(400, { error: 'Rating must be between 0 and 10' });
    }

    const decodedUrl = Buffer.from(serverUrl, 'base64').toString('utf-8');
    // Plex rating endpoint: /library/metadata/{key}/rate?rating={rating}
    const plexUrl = `${decodedUrl}${trackKey}/rate?rating=${Math.round(rating * 2)}`;

    const response = await axios.put(plexUrl, null, {
      headers: getPlexHeaders(token, clientId),
      timeout: 10000,
    });

    return addCorsHeaders(200, { 
      success: true, 
      message: `Track rated: ${rating}/10` 
    });
  } catch (error) {
    console.error('Error rating track:', error);
    const errorMessage = axios.isAxiosError(error)
      ? `${error.response?.status || 'Unknown'}: ${error.response?.statusText || error.message}`
      : error instanceof Error ? error.message : 'Unknown error';

    return addCorsHeaders(500, {
      error: 'Failed to rate track',
      message: errorMessage,
    });
  }
}

/**
 * OPTIONS handler for preflight requests
 * Browser sends OPTIONS before actual request
 */
async function handleOptions(event: HandlerEvent) {
  return addCorsHeaders(200, {});
}

/**
 * Main handler - routes to appropriate endpoint
 */
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const path = event.path || '';
  const method = event.httpMethod || 'GET';

  console.log(`${method} ${path}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return handleOptions(event);
  }

  // Route based on path
  if (path.includes('/plex-proxy') || path.includes('/plex')) {
    if (path.includes('playlists')) {
      return handleGetPlaylists(event);
    } else if (path.includes('rate') && method === 'POST') {
      return handleRateTrack(event);
    }
  }

  return addCorsHeaders(404, { error: 'Endpoint not found' });
};

export { handler };
