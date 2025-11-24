"""
PlexM8 Local Backend Configuration
Handles environment variables and configuration settings
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

# Flask Configuration
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
HOST = os.getenv('HOST', '127.0.0.1')
PORT = int(os.getenv('PORT', '5000'))

# Plex Configuration
PLEX_SERVER_URL = os.getenv('PLEX_SERVER_URL', 'http://localhost:32400')
PLEX_TOKEN = os.getenv('PLEX_TOKEN', '')
PLEX_CLIENT_ID = os.getenv('PLEX_CLIENT_ID', 'PlexM8-Local-Backend')

# Logging Configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_DIR = os.path.join(os.path.dirname(__file__), 'logs')

# CORS Configuration
CORS_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://plexm8.netlify.app',
]

# Version
VERSION = '1.0.0'
