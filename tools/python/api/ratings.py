"""
API: Ratings Endpoints
Handles track rating operations
"""

from flask import Blueprint, request, jsonify
import logging
from services.plex_service import PlexService

logger = logging.getLogger(__name__)
bp = Blueprint('ratings', __name__, url_prefix='/api/ratings')

plex_service = None  # Will be initialized in main app

def set_plex_service(service):
    """Set the Plex service instance"""
    global plex_service
    plex_service = service

@bp.route('/rate', methods=['POST', 'OPTIONS'])
def rate_track():
    """
    Rate a track on the Plex server
    Body:
      - track_key: Track metadata key (required)
      - rating: Rating value 0-10 (required)
    """
    try:
        if not plex_service:
            return jsonify({'error': 'Plex service not initialized'}), 500

        data = request.get_json()
        track_key = data.get('track_key')
        rating = data.get('rating')

        if not track_key or rating is None:
            return jsonify({'error': 'track_key and rating are required'}), 400

        if not (0 <= rating <= 10):
            return jsonify({'error': 'rating must be between 0 and 10'}), 400

        result = plex_service.rate_track(track_key, rating)
        return jsonify({
            'success': True,
            'message': f'Track rated: {rating}/10',
            'track_key': track_key,
        }), 200
    except Exception as e:
        logger.error(f'Error rating track: {str(e)}')
        return jsonify({
            'error': 'Failed to rate track',
            'message': str(e)
        }), 500

@bp.route('/top-rated', methods=['GET', 'OPTIONS'])
def get_top_rated():
    """
    Get top-rated tracks
    Query params:
      - min_rating: Minimum rating threshold (0-10, default: 7)
      - limit: Number of tracks to return (default: 50)
    """
    try:
        if not plex_service:
            return jsonify({'error': 'Plex service not initialized'}), 500

        min_rating = request.args.get('min_rating', 7, type=float)
        limit = request.args.get('limit', 50, type=int)

        tracks = plex_service.get_top_rated_tracks(min_rating, limit)
        return jsonify({
            'tracks': tracks,
            'count': len(tracks),
            'min_rating': min_rating,
        }), 200
    except Exception as e:
        logger.error(f'Error fetching top-rated tracks: {str(e)}')
        return jsonify({
            'error': 'Failed to fetch top-rated tracks',
            'message': str(e)
        }), 500

@bp.route('/sync', methods=['POST', 'OPTIONS'])
def sync_ratings():
    """
    Sync ratings from local media player to Plex
    Body:
      - source: 'itunes' | 'foobar2000' | 'media-monkey'
      - dry_run: Boolean, test without applying changes (default: true)
    """
    try:
        if not plex_service:
            return jsonify({'error': 'Plex service not initialized'}), 500

        data = request.get_json()
        source = data.get('source')
        dry_run = data.get('dry_run', True)

        if not source:
            return jsonify({'error': 'source is required'}), 400

        result = plex_service.sync_ratings_from_source(source, dry_run=dry_run)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f'Error syncing ratings: {str(e)}')
        return jsonify({
            'error': 'Failed to sync ratings',
            'message': str(e)
        }), 500
