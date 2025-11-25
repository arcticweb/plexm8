# Audio Quality Settings

User-configurable audio transcoding and playback quality settings for PlexM8.

## Overview

The Audio Quality settings allow users to configure how lossless audio files (FLAC) are transcoded for browser playback. Different bitrates are recommended based on network conditions and data constraints.

## Settings

### 1. Transcode Bitrate

Controls the quality of transcoded audio for FLAC and other lossless formats.

**Options:**
- **320 kbps (High Quality)** - Near-transparent quality
  - Use when: Connected to WiFi or home network
  - Data usage: ~2.4 MB per minute (~144 MB per hour)
  - Best for: Critical listening, high-quality headphones
  
- **192 kbps (Medium Quality)** - Good balance
  - Use when: Mobile data (LTE/5G) with generous data plan
  - Data usage: ~1.4 MB per minute (~86 MB per hour)
  - Best for: General listening on mobile devices
  
- **128 kbps (Low Quality)** - Acceptable quality
  - Use when: Limited data plan or cellular connection
  - Data usage: ~0.96 MB per minute (~58 MB per hour)
  - Best for: Background listening, data conservation

**Default:** 320 kbps

### 2. Transcode Format

Audio codec used for transcoded files. Currently fixed to MP3 for best browser compatibility.

**Options:**
- **MP3** (Current) - Universal browser support
- **AAC** (Future) - Better quality at same bitrate
- **Opus** (Future) - Most efficient, modern codec

**Default:** MP3

### 3. Adaptive Quality (Experimental)

Automatically adjust bitrate based on detected network type.

**When enabled:**
- WiFi connections → 320 kbps (high quality)
- Mobile data → 192 kbps (medium quality)
- Cellular (2G/3G) → 128 kbps (low quality)

**Note:** Network detection uses browser's Network Information API, which may not be available in all browsers.

**Default:** Enabled

### 4. Direct Play

Skip transcoding for browser-compatible formats (MP3, M4A, OGG).

**When enabled:**
- Supported formats play directly without transcoding
- Faster playback start
- Reduces server load

**When disabled:**
- All audio files are transcoded regardless of format
- Consistent quality across all tracks
- May increase server load

**Default:** Enabled (Recommended)

## How It Works

### FLAC Transcoding

When a FLAC file is detected:

1. App checks user's bitrate setting (Settings → Audio Quality)
2. Constructs Plex Universal Transcode URL with user's preferences
3. Plex server converts FLAC → MP3 on-the-fly at requested bitrate
4. Browser receives MP3 stream and plays normally

**Transcode URL Example:**
```
https://plex-server/music/:/transcode/universal/decision
  ?path=/library/metadata/12345
  &directPlay=0
  &directStream=0
  &audioCodec=mp3
  &musicBitrate=192
  &X-Plex-Token=xxxxx
```

### Direct Playback

For supported formats (MP3, M4A, AAC, OGG):

1. If Direct Play is enabled → Stream directly from Plex
2. If Direct Play is disabled → Transcode using user's settings

## Data Usage Calculator

Use this table to estimate data usage for different bitrates:

| Bitrate | Per Minute | Per Hour | Per 100 Songs* |
|---------|-----------|----------|----------------|
| 128 kbps | 0.96 MB | 58 MB | 291 MB |
| 192 kbps | 1.44 MB | 86 MB | 432 MB |
| 320 kbps | 2.40 MB | 144 MB | 720 MB |

*Assuming average song length of 3 minutes

## Recommendations

### WiFi / Home Network
```
Bitrate: 320 kbps
Adaptive Quality: Disabled (or enabled for laptop mobility)
Direct Play: Enabled
```

### Mobile Data (LTE/5G)
```
Bitrate: 192 kbps
Adaptive Quality: Enabled
Direct Play: Enabled
```

### Limited Data Plan
```
Bitrate: 128 kbps
Adaptive Quality: Disabled
Direct Play: Enabled
```

### Audiophile / Critical Listening
```
Bitrate: 320 kbps
Adaptive Quality: Disabled
Direct Play: Enabled
Format: MP3 (or AAC when available)
```

## Technical Details

### Plex Universal Transcode API

PlexM8 uses the `/music/:/transcode/universal/decision` endpoint:

**Parameters:**
- `directPlay=0` - Force transcoding (don't try direct play)
- `directStream=0` - Force transcoding (don't try direct stream)
- `audioCodec=mp3` - Target codec (MP3 for browser compatibility)
- `musicBitrate={user_setting}` - Bitrate from Audio Quality settings
- `protocol=http` - Streaming protocol
- `fastSeek=1` - Enable fast seeking in transcoded stream

**Response:**
- Returns streaming URL for transcoded audio
- Plex server handles conversion in real-time
- Client receives MP3 stream at requested bitrate

### Browser Compatibility

**MP3 Support:** Universal (all modern browsers)

**Future Codec Support:**
- AAC: Safari, Chrome (proprietary), Firefox (limited)
- Opus: Chrome, Firefox, Edge (not Safari)

**Why MP3 is default:**
- Universal browser support (100% compatibility)
- Stable, well-tested
- Predictable quality and performance

## Troubleshooting

### "FLAC files still won't play"

1. Check Settings → Audio Quality → Transcode Bitrate is set (not null)
2. Verify Plex server supports transcoding (Plex Pass may be required)
3. Check browser console for errors: `logger.setLevel('DEBUG')`
4. Try lower bitrate (320 → 192 → 128)

### "Playback stutters on mobile"

1. Lower bitrate: Settings → Audio Quality → 192 or 128 kbps
2. Enable Adaptive Quality to auto-adjust
3. Check network speed (may be insufficient for current bitrate)

### "Too much data usage"

1. Lower bitrate to 128 kbps
2. Enable Direct Play (avoids transcoding MP3/M4A files)
3. Monitor usage: ~58 MB per hour at 128 kbps

### "Quality sounds poor"

1. Increase bitrate to 192 or 320 kbps
2. Check headphones/speakers quality
3. Verify source FLAC quality (some are low-quality rips)
4. Try different audio output (Bluetooth may compress further)

## Future Enhancements

### Planned Features

1. **AAC/Opus Codec Support** - Better quality at lower bitrates
2. **Network Speed Detection** - Auto-adjust based on measured speed (not just type)
3. **Per-Track Quality Override** - Different bitrates for specific tracks
4. **Quality Presets** - "High/Medium/Low" instead of specific kbps values
5. **Transcode Statistics** - Show data saved vs direct play

### Under Consideration

- Offline caching of transcoded files
- Pre-transcoding for playlist (buffer next 3 tracks)
- Dynamic bitrate adjustment during playback
- Sample rate configuration (44.1 vs 48 kHz)

## Related Documentation

- [FLAC Transcode Implementation](flac-transcode-implementation.md) - Technical implementation details
- [Plex API Integration](api/plex-integration.md) - Plex Universal Transcode API reference
- [Debug Logging](debug-logging.md) - Enable detailed logging for troubleshooting
- [Settings Store](../src/utils/settingsStore.ts) - Audio settings implementation

## Changelog

### 2024-12-20
- Initial implementation of audio quality settings
- User-configurable bitrate (128/192/320 kbps)
- Settings UI with detailed help text
- Integration with FLAC transcode endpoint
- Default to 320 kbps (high quality)
