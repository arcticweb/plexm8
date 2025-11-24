"""
PlexM8 Local Backend
Flask application for advanced Plex music management features

Features:
- Ratings synchronization
- Smart playlist creation
- Music recommendations
- Local playback control

Usage:
    python app.py
    
    Then access at: http://localhost:5000/api/health
"""

import logging
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime

# Import configuration and services
import config
from services.plex_service import PlexService

# Import API blueprints
from api import health, playlists, ratings, recommendations

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL, logging.INFO),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": config.CORS_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": False,
    }
})

# Initialize Plex service
plex_service = None

@app.before_request
def initialize_services():
    """Initialize services before first request"""
    global plex_service
    
    if plex_service is None:
        try:
            logger.info('Initializing Plex service...')
            plex_service = PlexService(
                server_url=config.PLEX_SERVER_URL,
                token=config.PLEX_TOKEN,
                client_id=config.PLEX_CLIENT_ID,
            )
            
            # Set service in all API modules
            playlists.set_plex_service(plex_service)
            ratings.set_plex_service(plex_service)
            recommendations.set_plex_service(plex_service)
            
            logger.info('Plex service initialized successfully')
        except Exception as e:
            logger.error(f'Failed to initialize Plex service: {str(e)}')
            # Service will be retried on next request

# Register API blueprints
app.register_blueprint(health.bp)
app.register_blueprint(playlists.bp)
app.register_blueprint(ratings.bp)
app.register_blueprint(recommendations.bp)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Not Found',
        'message': 'The requested endpoint does not exist',
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f'Internal server error: {str(error)}')
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'An unexpected error occurred',
    }), 500

@app.errorhandler(cors.CORSRequestDidNotMatch)
def cors_error(error):
    """Handle CORS errors"""
    return jsonify({
        'error': 'CORS Error',
        'message': 'Cross-origin request not allowed',
    }), 403

# Root endpoint
@app.route('/', methods=['GET'])
def root():
    """Root endpoint with API information"""
    return jsonify({
        'name': 'PlexM8 Local Backend',
        'version': config.VERSION,
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'docs': {
            'health': '/api/health',
            'playlists': '/api/playlists',
            'ratings': '/api/ratings',
            'recommendations': '/api/recommendations',
        }
    }), 200

def main():
    """Main entry point"""
    logger.info('=' * 60)
    logger.info('PlexM8 Local Backend')
    logger.info('=' * 60)
    logger.info(f'Configuration:')
    logger.info(f'  Host: {config.HOST}')
    logger.info(f'  Port: {config.PORT}')
    logger.info(f'  Debug: {config.DEBUG}')
    logger.info(f'  Plex Server: {config.PLEX_SERVER_URL}')
    logger.info(f'  Allowed Origins: {", ".join(config.CORS_ORIGINS)}')
    logger.info('=' * 60)
    
    try:
        logger.info(f'Starting server on http://{config.HOST}:{config.PORT}')
        app.run(
            host=config.HOST,
            port=config.PORT,
            debug=config.DEBUG,
            threaded=True,
        )
    except KeyboardInterrupt:
        logger.info('Shutting down...')
        sys.exit(0)
    except Exception as e:
        logger.error(f'Failed to start server: {str(e)}')
        sys.exit(1)

if __name__ == '__main__':
    main()
