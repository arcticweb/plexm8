"""
Data models for PlexM8 Local Backend
"""

from dataclasses import dataclass
from typing import Optional, List


@dataclass
class Track:
    """Music track model"""
    key: str
    title: str
    artist: str
    album: str
    duration: int
    user_rating: Optional[float] = None
    thumb: Optional[str] = None
    index: Optional[int] = None


@dataclass
class Playlist:
    """Playlist model"""
    key: str
    title: str
    playlist_type: str  # 'audio', 'video', 'photo'
    smart: bool
    summary: str
    leaf_count: int
    thumb: Optional[str] = None
    icon: Optional[str] = None
    added_at: Optional[int] = None
    updated_at: Optional[int] = None


@dataclass
class Recommendation:
    """Music recommendation model"""
    track: Track
    match_score: float  # 0.0 - 1.0
    reason: str


@dataclass
class RatingSync:
    """Rating synchronization result"""
    source: str  # 'itunes', 'foobar2000', etc.
    synced: int
    conflicts: int
    failed: int
    details: List[str]
