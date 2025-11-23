/**
 * Plex Authentication API Endpoint
 * 
 * This Vercel/Node.js serverless function acts as a proxy to Plex API
 * to bypass CORS restrictions when called from the browser.
 * 
 * Handles:
 * - PIN generation for authentication
 * - PIN status checking
 * - User verification
 * - Resources/servers listing
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const PLEX_BASE_URL = 'https://plex.tv/api/v2';
const CLIENTS_BASE_URL = 'https://clients.plex.tv/api/v2';

interface PinRequest {
  clientId: string;
}

interface CheckPinRequest {
  clientId: string;
  pinId: number;
}

interface VerifyTokenRequest {
  clientId: string;
  token: string;
}

interface ResourcesRequest {
  clientId: string;
  token: string;
}

/**
 * Get common Plex headers
 */
function getPlexHeaders(clientId: string, token?: string) {
  const headers: Record<string, string> = {
    'X-Plex-Product': 'PlexM8',
    'X-Plex-Client-Identifier': clientId,
    'Accept': 'application/json',
  };

  if (token) {
    headers['X-Plex-Token'] = token;
  }

  return headers;
}

/**
 * Create a PIN for authentication
 */
async function createPin(req: VercelRequest, res: VercelResponse) {
  try {
    const { clientId } = req.body as PinRequest;

    if (!clientId) {
      return res.status(400).json({ error: 'Missing clientId' });
    }

    const response = await axios.post(
      `${PLEX_BASE_URL}/pins?strong=true`,
      null,
      {
        headers: getPlexHeaders(clientId),
        validateStatus: () => true, // Don't throw on any status
      }
    );

    if (response.status !== 201 && response.status !== 200) {
      return res.status(response.status).json({
        error: `Plex API error: ${response.statusText}`,
        details: response.data,
      });
    }

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('PIN creation error:', error);
    return res.status(500).json({
      error: 'Failed to create PIN',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Check PIN status and get auth token
 */
async function checkPin(req: VercelRequest, res: VercelResponse) {
  try {
    const { clientId, pinId } = req.body as CheckPinRequest;

    if (!clientId || !pinId) {
      return res.status(400).json({ error: 'Missing clientId or pinId' });
    }

    const response = await axios.get(
      `${PLEX_BASE_URL}/pins/${pinId}`,
      {
        headers: getPlexHeaders(clientId),
        validateStatus: () => true,
      }
    );

    if (response.status !== 200) {
      return res.status(response.status).json({
        error: `Plex API error: ${response.statusText}`,
        details: response.data,
      });
    }

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('PIN check error:', error);
    return res.status(500).json({
      error: 'Failed to check PIN',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Verify that a token is valid
 */
async function verifyToken(req: VercelRequest, res: VercelResponse) {
  try {
    const { clientId, token } = req.body as VerifyTokenRequest;

    if (!clientId || !token) {
      return res.status(400).json({ error: 'Missing clientId or token' });
    }

    const response = await axios.get(
      `${PLEX_BASE_URL}/user`,
      {
        headers: getPlexHeaders(clientId, token),
        validateStatus: () => true,
      }
    );

    // 200 = valid, 401 = invalid, anything else is an error
    if (response.status === 200) {
      return res.status(200).json({
        valid: true,
        user: response.data,
      });
    } else if (response.status === 401) {
      return res.status(200).json({
        valid: false,
        error: 'Invalid token',
      });
    } else {
      return res.status(response.status).json({
        error: `Plex API error: ${response.statusText}`,
        details: response.data,
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({
      error: 'Failed to verify token',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get list of available Plex Media Servers
 */
async function getResources(req: VercelRequest, res: VercelResponse) {
  try {
    const { clientId, token } = req.body as ResourcesRequest;

    if (!clientId || !token) {
      return res.status(400).json({ error: 'Missing clientId or token' });
    }

    const response = await axios.get(
      `${CLIENTS_BASE_URL}/resources?includeHttps=1&includeRelay=1&includeIPv6=1`,
      {
        headers: getPlexHeaders(clientId, token),
        validateStatus: () => true,
      }
    );

    if (response.status !== 200) {
      return res.status(response.status).json({
        error: `Plex API error: ${response.statusText}`,
        details: response.data,
      });
    }

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Resources error:', error);
    return res.status(500).json({
      error: 'Failed to get resources',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Main handler - routes requests based on action
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for browser requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query;

  switch (action) {
    case 'createPin':
      return createPin(req, res);
    case 'checkPin':
      return checkPin(req, res);
    case 'verifyToken':
      return verifyToken(req, res);
    case 'getResources':
      return getResources(req, res);
    default:
      return res.status(400).json({ error: 'Unknown action' });
  }
}
