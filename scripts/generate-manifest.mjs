/**
 * Manifest Generator Script
 * Generates manifest.json with proper base path configuration
 * Run during build via: npm run build
 */

import fs from 'fs';
import path from 'path';

const basePath = process.env.VITE_APP_BASE_PATH || '/';

const manifest = {
  name: 'PlexM8',
  short_name: 'PlexM8',
  description: 'Smart Playlist Manager for Plex Media Server',
  start_url: `${basePath}`,
  scope: `${basePath}`,
  display: 'standalone',
  orientation: 'portrait-primary',
  background_color: '#1e1e2e',
  theme_color: '#e50914',
  icons: [
    {
      src: `${basePath}icons/plex512_rounded.png`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: `${basePath}icons/plex512_maskable.png`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
  categories: ['music', 'productivity'],
  screenshots: [
    {
      src: `${basePath}screenshots/screenshot-540x720.png`,
      sizes: '540x720',
      type: 'image/png',
      form_factor: 'narrow',
    },
    {
      src: `${basePath}screenshots/screenshot-1280x720.png`,
      sizes: '1280x720',
      type: 'image/png',
      form_factor: 'wide',
    },
  ],
};

// Write manifest to dist directory during build
const outputPath = path.join(process.cwd(), 'dist', 'manifest.json');
const outputDir = path.dirname(outputPath);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
console.log(`✓ Generated manifest.json with base path: ${basePath}`);
