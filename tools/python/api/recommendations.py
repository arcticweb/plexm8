"""
API: Recommendations Endpoints
Handles AI-powered music recommendations
"""

from flask import Blueprint, request, jsonify
import logging
from services.plex_service import PlexService

logger = logging.getLogger(__name__)
bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')

plex_service = None  # Will be initialized in main app

def set_plex_service(service):
    """Set the Plex service instance"""
    global plex_service
    plex_service = service

@bp.route('/similar', methods=['GET', 'OPTIONS'])
def get_similar_tracks():
    """
    Get recommendations similar to a given track
    Query params:
      - track_key: Track to base recommendations on (required)
      - limit: Number of recommendations (default: 10)
    """
    try:
        if not plex_service:
            return jsonify({'error': 'Plex service not initialized'}), 500

        track_key = request.args.get('track_key')
        limit = request.args.get('limit', 10, type=int)

        if not track_key:
            return jsonify({'error': 'track_key is required'}), 400

        recommendations = plex_service.get_similar_tracks(track_key, limit=limit)
        return jsonify({
            'recommendations': recommendations,
            'count': len(recommendations),
        }), 200
    except Exception as e:
        logger.error(f'Error getting recommendations: {str(e)}')
        return jsonify({
            'error': 'Failed to get recommendations',
            'message': str(e)
        }), 500

@bp.route('/based-on-ratings', methods=['GET', 'OPTIONS'])
def get_recommendations_based_on_ratings():
    """
    Get recommendations based on user's top-rated tracks
    Query params:
      - min_rating: Minimum rating to consider (0-10, default: 8)
      - limit: Number of recommendations (default: 10)
    """
    try:
        if not plex_service:
            return jsonify({'error': 'Plex service not initialized'}), 500

        min_rating = request.args.get('min_rating', 8, type=float)
        limit = request.args.get('limit', 10, type=int)

        recommendations = plex_service.get_recommendations_based_on_ratings(
            min_rating=min_rating,
            limit=limit
        )
        return jsonify({
            'recommendations': recommendations,
            'count': len(recommendations),
            'based_on_rating': min_rating,
        }), 200
    except Exception as e:
        logger.error(f'Error getting recommendations: {str(e)}')
        return jsonify({
            'error': 'Failed to get recommendations',
            'message': str(e)
        }), 500
