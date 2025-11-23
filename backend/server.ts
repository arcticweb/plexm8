/**
 * Plex Authentication API Backend
 * 
 * Minimal Node.js Express server that proxies Plex API calls
 * Deploy to: Railway.app, Render.com, or similar free tier
 * 
 * See: ../../docs/authentication.md
 */

import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;
const PLEX_BASE = 'https://plex.tv/api/v2';
const CLIENTS_BASE = 'https://clients.plex.tv/api/v2';

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create PIN for authentication
app.post('/api/auth/pin', async (req, res) => {
  try {
    const { clientId } = req.body;
    if (!clientId) return res.status(400).json({ error: 'Missing clientId' });

    const response = await axios.post(
      `${PLEX_BASE}/pins?strong=true`,
      null,
      {
        headers: {
          'X-Plex-Product': 'PlexM8',
          'X-Plex-Client-Identifier': clientId,
          'Accept': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('PIN creation error:', error);
    res.status(500).json({
      error: 'Failed to create PIN',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Check PIN status
app.post('/api/auth/check-pin', async (req, res) => {
  try {
    const { clientId, pinId } = req.body;
    if (!clientId || !pinId) {
      return res.status(400).json({ error: 'Missing clientId or pinId' });
    }

    const response = await axios.get(
      `${PLEX_BASE}/pins/${pinId}`,
      {
        headers: {
          'X-Plex-Product': 'PlexM8',
          'X-Plex-Client-Identifier': clientId,
          'Accept': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('PIN check error:', error);
    res.status(500).json({
      error: 'Failed to check PIN',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Verify token validity
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { clientId, token } = req.body;
    if (!clientId || !token) {
      return res.status(400).json({ error: 'Missing clientId or token' });
    }

    const response = await axios.get(
      `${PLEX_BASE}/user`,
      {
        headers: {
          'X-Plex-Product': 'PlexM8',
          'X-Plex-Client-Identifier': clientId,
          'X-Plex-Token': token,
          'Accept': 'application/json',
        },
        validateStatus: () => true,
      }
    );

    if (response.status === 200) {
      res.json({ valid: true, user: response.data });
    } else if (response.status === 401) {
      res.json({ valid: false, error: 'Invalid token' });
    } else {
      res.status(response.status).json({
        error: 'Plex API error',
        details: response.data,
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      error: 'Failed to verify token',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get available Plex servers
app.post('/api/auth/resources', async (req, res) => {
  try {
    const { clientId, token } = req.body;
    if (!clientId || !token) {
      return res.status(400).json({ error: 'Missing clientId or token' });
    }

    const response = await axios.get(
      `${CLIENTS_BASE}/resources?includeHttps=1&includeRelay=1&includeIPv6=1`,
      {
        headers: {
          'X-Plex-Product': 'PlexM8',
          'X-Plex-Client-Identifier': clientId,
          'X-Plex-Token': token,
          'Accept': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Resources error:', error);
    res.status(500).json({
      error: 'Failed to get resources',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`PlexM8 Auth Backend listening on port ${PORT}`);
});
