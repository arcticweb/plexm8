"""
API: Health Check Endpoint
Provides backend status and available features for frontend detection
"""

from flask import Blueprint, jsonify
from datetime import datetime
import config

bp = Blueprint('health', __name__, url_prefix='/api/health')

@bp.route('', methods=['GET', 'OPTIONS'])
def health_check():
    """
    Health check endpoint for frontend auto-detection
    Returns backend status and available features
    """
    return jsonify({
        'status': 'ok',
        'version': config.VERSION,
        'timestamp': datetime.now().isoformat(),
        'features': [
            'playlists',
            'ratings',
            'recommendations',
            'smart-playlists',
        ],
        'backend': 'python-plexapi',
        'plex_api_version': '4.17.2',
    }), 200
