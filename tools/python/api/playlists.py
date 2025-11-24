"""
API: Playlists Endpoints
Handles playlist operations via PlexAPI
"""

from flask import Blueprint, request, jsonify
import logging
from services.plex_service import PlexService

logger = logging.getLogger(__name__)
bp = Blueprint('playlists', __name__, url_prefix='/api/playlists')

plex_service = None  # Will be initialized in main app

def set_plex_service(service):
    """Set the Plex service instance"""
    global plex_service
    plex_service = service

@bp.route('', methods=['GET', 'OPTIONS'])
def get_playlists():
    """
    Get all playlists for the authenticated user
    Query params:
      - server_id: Specific server to query (optional, defaults to configured server)
    """
    try:
        if not plex_service:
            return jsonify({'error': 'Plex service not initialized'}), 500

        playlists = plex_service.get_playlists()
        return jsonify({
            'MediaContainer': {
                'Metadata': playlists
            }
        }), 200
    except Exception as e:
        logger.error(f'Error fetching playlists: {str(e)}')
        return jsonify({
            'error': 'Failed to fetch playlists',
            'message': str(e)
        }), 500

@bp.route('/<playlist_id>/items', methods=['GET', 'OPTIONS'])
def get_playlist_items(playlist_id):
    """
    Get items in a specific playlist
    Path params:
      - playlist_id: Playlist key/id
    Query params:
      - limit: Number of items to return (default: 50)
    """
    try:
        if not plex_service:
            return jsonify({'error': 'Plex service not initialized'}), 500

        limit = request.args.get('limit', 50, type=int)
        items = plex_service.get_playlist_items(playlist_id, limit=limit)
        
        return jsonify({
            'MediaContainer': {
                'Metadata': items
            }
        }), 200
    except Exception as e:
        logger.error(f'Error fetching playlist items: {str(e)}')
        return jsonify({
            'error': 'Failed to fetch playlist items',
            'message': str(e)
        }), 500

@bp.route('', methods=['POST', 'OPTIONS'])
def create_playlist():
    """
    Create a new playlist
    Body:
      - title: Playlist name (required)
      - description: Playlist description (optional)
    """
    try:
        if not plex_service:
            return jsonify({'error': 'Plex service not initialized'}), 500

        data = request.get_json()
        title = data.get('title')
        description = data.get('description', '')

        if not title:
            return jsonify({'error': 'Playlist title is required'}), 400

        playlist = plex_service.create_playlist(title, description)
        return jsonify({
            'success': True,
            'playlist': playlist
        }), 201
    except Exception as e:
        logger.error(f'Error creating playlist: {str(e)}')
        return jsonify({
            'error': 'Failed to create playlist',
            'message': str(e)
        }), 500
