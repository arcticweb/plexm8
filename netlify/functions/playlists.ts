/**
 * Netlify Function: Plex Playlists Proxy
 * 
 * Handles all playlist operations by proxying to plex.tv API.
 * This provides Plex playlist endpoints locally over Netlify Functions.
 * 
 * Endpoints proxy structure:
 * /.netlify/functions/playlists?action=list&token=...
 * /.netlify/functions/playlists?action=create&title=...&token=...
 * etc.
 */

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import axios from 'axios';
import { PLEX_CONFIG, getPlexHeaders } from './config';

// Plex API base URL (clients for PMS access)
const PLEX_API_CLIENTS = PLEX_CONFIG.api.clients;

/**
 * Main handler
 */
const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

  const token = event.queryStringParameters?.token;
  const serverUrl = event.queryStringParameters?.serverUrl;

  if (!token) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing token parameter' }),
    };
  }

  if (!serverUrl) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing serverUrl parameter' }),
    };
  }

  try {
    // Proxy the request to Plex server
    const response = await axios({
      method: event.httpMethod as any,
      url: serverUrl,
      headers: getPlexHeaders(token),
      params: event.queryStringParameters,
      data: event.body ? JSON.parse(event.body) : undefined,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error proxying playlist request:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const data = error.response?.data;

      return {
        statusCode: status,
        headers,
        body: JSON.stringify({
          error: 'Failed to proxy request to Plex server',
          details: data,
        }),
      };
    }

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
