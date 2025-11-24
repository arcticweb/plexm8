"""
Plex Service Layer
Wrapper around PlexAPI for consistent interface and error handling
"""

import logging
from typing import List, Dict, Optional
from plexapi.server import PlexServer
from plexapi.exceptions import Unauthorized, BadRequest

logger = logging.getLogger(__name__)

class PlexService:
    """Service for interacting with Plex Media Server via PlexAPI"""

    def __init__(self, server_url: str, token: str, client_id: str = 'PlexM8-Local-Backend'):
        """
        Initialize Plex service
        
        Args:
            server_url: Base URL of Plex server (e.g., http://192.168.1.100:32400)
            token: Plex API token
            client_id: Client identifier for Plex API headers
        """
        self.server_url = server_url
        self.token = token
        self.client_id = client_id
        self.plex = None
        self._connect()

    def _connect(self):
        """Connect to Plex server"""
        try:
            self.plex = PlexServer(self.server_url, self.token)
            logger.info(f'Connected to Plex server: {self.server_url}')
        except Unauthorized:
            logger.error('Invalid Plex token')
            raise
        except Exception as e:
            logger.error(f'Failed to connect to Plex server: {str(e)}')
            raise

    def get_playlists(self, playlist_type: str = 'audio') -> List[Dict]:
        """
        Get all playlists for the authenticated user
        
        Args:
            playlist_type: Type of playlists to return ('audio', 'video', 'photo')
            
        Returns:
            List of playlist dictionaries
        """
        try:
            playlists = self.plex.playlists()
            
            result = []
            for pl in playlists:
                if hasattr(pl, 'playlistType') and pl.playlistType == playlist_type:
                    result.append({
                        'key': pl.key,
                        'title': pl.title,
                        'type': getattr(pl, 'playlistType', 'audio'),
                        'smart': getattr(pl, 'smart', 0),
                        'summary': getattr(pl, 'summary', ''),
                        'leafCount': getattr(pl, 'leafCount', 0),
                        'thumb': getattr(pl, 'thumb', ''),
                        'icon': getattr(pl, 'icon', ''),
                        'addedAt': getattr(pl, 'addedAt', None),
                        'updatedAt': getattr(pl, 'updatedAt', None),
                    })
            
            logger.info(f'Retrieved {len(result)} playlists')
            return result
        except Exception as e:
            logger.error(f'Error getting playlists: {str(e)}')
            raise

    def get_playlist_items(self, playlist_key: str, limit: int = 50) -> List[Dict]:
        """
        Get items in a specific playlist
        
        Args:
            playlist_key: Playlist key/id
            limit: Maximum number of items to return
            
        Returns:
            List of track dictionaries
        """
        try:
            playlist = self.plex.playlist(playlist_key)
            items = playlist.items()[:limit]
            
            result = []
            for item in items:
                result.append({
                    'key': item.key,
                    'title': getattr(item, 'title', ''),
                    'artist': getattr(item, 'artist', ''),
                    'album': getattr(item, 'album', ''),
                    'duration': getattr(item, 'duration', 0),
                    'userRating': getattr(item, 'userRating', None),
                    'thumb': getattr(item, 'thumb', ''),
                    'index': getattr(item, 'index', None),
                })
            
            logger.info(f'Retrieved {len(result)} items from playlist {playlist_key}')
            return result
        except Exception as e:
            logger.error(f'Error getting playlist items: {str(e)}')
            raise

    def create_playlist(self, title: str, description: str = '', items: List = None) -> Dict:
        """
        Create a new playlist
        
        Args:
            title: Playlist name
            description: Playlist description
            items: List of items to add to playlist
            
        Returns:
            Created playlist dictionary
        """
        try:
            playlist = self.plex.createPlaylist(title, items=items or [])
            
            logger.info(f'Created playlist: {title}')
            return {
                'key': playlist.key,
                'title': playlist.title,
                'type': getattr(playlist, 'playlistType', 'audio'),
                'itemCount': getattr(playlist, 'leafCount', 0),
            }
        except Exception as e:
            logger.error(f'Error creating playlist: {str(e)}')
            raise

    def rate_track(self, track_key: str, rating: float) -> bool:
        """
        Rate a track (0-10 scale, converted to Plex's 0-10 * 2 scale internally)
        
        Args:
            track_key: Track metadata key
            rating: Rating value 0-10
            
        Returns:
            True if successful
        """
        try:
            # Plex stores ratings 0-10, we accept 0-10 and convert to internal scale
            track = self.plex.library.getByKey(track_key)
            track.rate(rating * 2)  # Plex uses 0-20 internally
            
            logger.info(f'Rated track {track_key}: {rating}/10')
            return True
        except Exception as e:
            logger.error(f'Error rating track: {str(e)}')
            raise

    def get_top_rated_tracks(self, min_rating: float = 7, limit: int = 50) -> List[Dict]:
        """
        Get top-rated tracks from music library
        
        Args:
            min_rating: Minimum rating threshold (0-10)
            limit: Maximum number of tracks to return
            
        Returns:
            List of top-rated track dictionaries
        """
        try:
            music = self.plex.library.section('Music')
            all_tracks = music.all()
            
            # Filter by rating
            rated_tracks = [
                t for t in all_tracks 
                if hasattr(t, 'userRating') and t.userRating is not None
                and t.userRating >= min_rating * 2  # Plex stores as 0-20
            ]
            
            # Sort by rating descending
            rated_tracks.sort(
                key=lambda x: getattr(x, 'userRating', 0),
                reverse=True
            )
            
            result = []
            for track in rated_tracks[:limit]:
                result.append({
                    'key': track.key,
                    'title': getattr(track, 'title', ''),
                    'artist': getattr(track, 'artist', ''),
                    'album': getattr(track, 'album', ''),
                    'userRating': (getattr(track, 'userRating', 0) or 0) / 2,  # Convert back to 0-10
                    'thumb': getattr(track, 'thumb', ''),
                })
            
            logger.info(f'Retrieved {len(result)} top-rated tracks (min: {min_rating})')
            return result
        except Exception as e:
            logger.error(f'Error getting top-rated tracks: {str(e)}')
            raise

    def sync_ratings_from_source(self, source: str, dry_run: bool = True) -> Dict:
        """
        Sync ratings from local media player
        
        Args:
            source: 'itunes' | 'foobar2000' | 'media-monkey'
            dry_run: If True, don't apply changes
            
        Returns:
            Dictionary with sync results
        """
        try:
            # This is a stub - will be implemented per platform
            if source.lower() == 'itunes':
                return self._sync_itunes_ratings(dry_run=dry_run)
            elif source.lower() == 'foobar2000':
                return self._sync_foobar_ratings(dry_run=dry_run)
            else:
                raise ValueError(f'Unsupported source: {source}')
        except Exception as e:
            logger.error(f'Error syncing ratings: {str(e)}')
            raise

    def _sync_itunes_ratings(self, dry_run: bool = True) -> Dict:
        """Sync ratings from iTunes library"""
        return {
            'success': False,
            'message': 'iTunes sync not yet implemented',
            'synced': 0,
            'conflicts': 0,
            'failed': 0,
        }

    def _sync_foobar_ratings(self, dry_run: bool = True) -> Dict:
        """Sync ratings from foobar2000 library"""
        return {
            'success': False,
            'message': 'foobar2000 sync not yet implemented',
            'synced': 0,
            'conflicts': 0,
            'failed': 0,
        }

    def get_similar_tracks(self, track_key: str, limit: int = 10) -> List[Dict]:
        """
        Get recommendations similar to a track
        
        Args:
            track_key: Reference track key
            limit: Number of recommendations
            
        Returns:
            List of similar track dictionaries with match scores
        """
        try:
            # Placeholder - will implement ML-based recommendations later
            return {
                'success': False,
                'message': 'Similarity recommendations not yet implemented',
                'recommendations': [],
            }
        except Exception as e:
            logger.error(f'Error getting similar tracks: {str(e)}')
            raise

    def get_recommendations_based_on_ratings(
        self,
        min_rating: float = 8,
        limit: int = 10
    ) -> List[Dict]:
        """
        Get recommendations based on user's top-rated tracks
        
        Args:
            min_rating: Minimum rating to consider (0-10)
            limit: Number of recommendations
            
        Returns:
            List of recommended track dictionaries
        """
        try:
            # Placeholder - will implement ML-based recommendations later
            return {
                'success': False,
                'message': 'Rating-based recommendations not yet implemented',
                'recommendations': [],
            }
        except Exception as e:
            logger.error(f'Error getting recommendations: {str(e)}')
            raise
