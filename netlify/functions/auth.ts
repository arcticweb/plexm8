/**
 * Netlify Function: Plex Authentication Proxy
 * 
 * Handles authentication with Plex Media Server API.
 * Proxies requests to plex.tv API to bypass CORS restrictions.
 * 
 * Endpoints:
 * - POST /api/auth/pin - Create authentication PIN
 * - GET /api/auth/pin/:id - Check PIN status and get token
 * - GET /api/auth/user - Get current user info
 */

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import axios from 'axios';

// Plex API base URL
const PLEX_API_BASE = 'https://plex.tv/api/v2';

// Client configuration (should match frontend)
const PLEX_PRODUCT = 'PlexM8';

/**
 * Get common Plex API headers
 */
function getPlexHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Plex-Product': PLEX_PRODUCT,
    'Accept': 'application/json',
  };

  if (token) {
    headers['X-Plex-Token'] = token;
  }

  return headers;
}

/**
 * POST /api/auth/pin
 * Create a new authentication PIN
 */
async function handleCreatePin(event: HandlerEvent) {
  try {
    const clientId = event.queryStringParameters?.clientId;

    if (!clientId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing clientId parameter' }),
      };
    }

    const response = await axios.post(
      `${PLEX_API_BASE}/pins?strong=true`,
      null,
      {
        headers: {
          ...getPlexHeaders(),
          'X-Plex-Client-Identifier': clientId,
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error creating PIN:', error);
    const errorMessage = axios.isAxiosError(error) 
      ? `Plex API error: ${error.response?.status} ${error.response?.statusText}`
      : error instanceof Error ? error.message : 'Unknown error';
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to create authentication PIN',
        message: errorMessage,
        details: axios.isAxiosError(error) ? error.response?.data : undefined,
      }),
    };
  }
}

/**
 * GET /api/auth/pin/:id
 * Check PIN status and retrieve auth token if claimed
 */
async function handleCheckPin(
  event: HandlerEvent,
  pinId: string
) {
  try {
    const clientId = event.queryStringParameters?.clientId;

    if (!clientId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing clientId parameter' }),
      };
    }

    const response = await axios.get(
      `${PLEX_API_BASE}/pins/${pinId}`,
      {
        headers: {
          ...getPlexHeaders(),
          'X-Plex-Client-Identifier': clientId,
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'PIN not found or expired' }),
      };
    }
    console.error('Error checking PIN:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to check PIN status',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

/**
 * GET /api/auth/user
 * Get current user information using auth token
 */
async function handleGetUser(event: HandlerEvent) {
  try {
    const token = event.queryStringParameters?.token;
    const clientId = event.queryStringParameters?.clientId;

    if (!token || !clientId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Missing token or clientId parameter' 
        }),
      };
    }

    const response = await axios.get(
      `${PLEX_API_BASE}/user`,
      {
        headers: {
          ...getPlexHeaders(token),
          'X-Plex-Client-Identifier': clientId,
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid or expired token' }),
      };
    }
    console.error('Error getting user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to get user information',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

/**
 * Main handler
 * Uses query parameters to route actions since Netlify Functions
 * don't support sub-path routing (all requests go to /.netlify/functions/auth)
 */
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Get action from query parameters
  const action = event.queryStringParameters?.action;

  console.log('Netlify Function called:', {
    action,
    method: event.httpMethod,
    queryStringParameters: event.queryStringParameters,
  });

  try {
    // Route: POST /?action=createPin
    if (action === 'createPin' && event.httpMethod === 'POST') {
      const response = await handleCreatePin(event);
      return { ...response, headers };
    }

    // Route: GET /?action=checkPin&pinId=123
    if (action === 'checkPin' && event.httpMethod === 'GET') {
      const pinId = event.queryStringParameters?.pinId;
      if (!pinId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing pinId parameter' }),
        };
      }
      const response = await handleCheckPin(event, pinId);
      return { ...response, headers };
    }

    // Route: GET /?action=getUser
    if (action === 'getUser' && event.httpMethod === 'GET') {
      const response = await handleGetUser(event);
      return { ...response, headers };
    }

    // Missing action parameter
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Missing action parameter',
        validActions: ['createPin', 'checkPin', 'getUser'],
      }),
    };
  } catch (error) {
    console.error('Unhandled error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
