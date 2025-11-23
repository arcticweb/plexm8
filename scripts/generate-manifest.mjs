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
  screenshots: [],
};

// Write manifest to public directory so Vite copies it to dist
const outputPath = path.join(process.cwd(), 'public', 'manifest.json');
const outputDir = path.dirname(outputPath);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
console.log(`✓ Generated manifest.json with base path: ${basePath}`);
