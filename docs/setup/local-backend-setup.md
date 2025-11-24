# Local Backend Setup Guide

Complete step-by-step instructions for setting up the optional PlexM8 local Python backend for advanced features.

## Overview

The PlexM8 local backend is an **optional** Python application that enables advanced features like:
- 🎵 **Ratings Sync**: Sync music ratings from iTunes, foobar2000, etc.
- 🎯 **Smart Playlists**: Auto-create playlists based on ratings and criteria
- 💡 **Recommendations**: AI-powered music recommendations
- ⭐ **Advanced Tools**: Batch operations and bulk management

**Note**: This is completely optional. The web app works fine with just the Netlify proxy.

---

## System Requirements

### Minimum Requirements
- Python 3.9 or higher
- 100 MB disk space
- 256 MB RAM
- Windows, macOS, or Linux

### Network Requirements
- Local network access to your Plex server
- No internet required (runs locally)
- Port 5000 available (configurable)

---

## Installation

### Step 1: Install Python

#### Windows
1. Go to https://www.python.org/downloads/
2. Download Python 3.9+ installer
3. **Important**: Check "Add Python to PATH"
4. Click Install
5. Verify installation:
   ```powershell
   python --version
   # Should show: Python 3.x.x
   ```

#### macOS
```bash
# Using Homebrew (recommended)
brew install python@3.9

# Verify installation
python3.9 --version
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install python3.9 python3.9-venv

# Fedora/RHEL
sudo dnf install python3.9

# Verify installation
python3.9 --version
```

---

### Step 2: Clone or Download PlexM8

Option A: Using Git (Recommended)
```bash
git clone https://github.com/arcticweb/plexm8.git
cd plexm8/tools/python
```

Option B: Download ZIP
1. Go to https://github.com/arcticweb/plexm8
2. Click "Code" → "Download ZIP"
3. Extract to your desired location
4. Open terminal/PowerShell in `plexm8/tools/python`

---

### Step 3: Run Automated Setup

We provide automated setup scripts for both Python and PowerShell (Windows).

#### Option A: Python Script (Recommended - All Platforms)
```bash
cd plexm8/tools/python
python setup.py
```

This will:
- Verify Python version compatibility
- Create virtual environment
- Upgrade pip, setuptools, wheel
- Install all dependencies
- Validate installation
- Guide you through configuration

#### Option B: PowerShell Script (Windows Only)
```powershell
cd plexm8\tools\python
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\setup.ps1
```

This will:
- Check for Python installation
- Verify Python version
- Run the Python setup script
- Display next steps

---

### Step 4: Manual Setup (If Needed)

If the automated scripts don't work, you can manually set up:

#### Create Virtual Environment

##### Windows (PowerShell)
```powershell
cd plexm8\tools\python
python -m venv venv
.\venv\Scripts\Activate.ps1
```

##### Windows (Command Prompt)
```cmd
cd plexm8\tools\python
python -m venv venv
venv\Scripts\activate.bat
```

##### macOS/Linux
```bash
cd plexm8/tools/python
python3.9 -m venv venv
source venv/bin/activate
```

#### Install Dependencies

With virtual environment activated:
```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

---

### Step 5: Configure Environment

1. Copy the template file:
   ```bash
   # Windows
   copy .env.local.template .env.local
   
   # macOS/Linux
   cp .env.local.template .env.local
   ```

2. Edit `.env.local` with your Plex details:
   ```env
   # Get your token from: https://support.plex.tv/articles/204059436/
   PLEX_TOKEN=your_plex_token_here
   
   # Your Plex server address (usually auto-detected)
   PLEX_SERVER_URL=http://192.168.1.100:32400
   
   # Or for domain-based:
   # PLEX_SERVER_URL=https://your-server.plex.direct
   
   # Leave the rest as defaults
   DEBUG=False
   HOST=127.0.0.1
   PORT=5000
   ```

### Getting Your Plex Token

1. Go to https://www.plex.tv
2. Log in to your account
3. Settings → Account
4. Look for "Access Token" (click icon to show)
5. Copy and paste into `.env.local`

---

### Step 6: Start the Backend

With the virtual environment activated:

```bash
python app.py
```

You should see:
```
============================================================
PlexM8 Local Backend
============================================================
Configuration:
  Host: 127.0.0.1
  Port: 5000
  Debug: False
  Plex Server: http://192.168.1.100:32400
  ...
============================================================
Starting server on http://localhost:5000
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to stop
```

**Backend is running!**

---

## Usage

### In PlexM8 Web App

1. Open https://plexm8.netlify.app
2. The app will automatically detect the local backend
3. If running, you'll see:
   - Local backend indicator in navigation
   - New "Tools" menu item
4. Click "Tools" to access advanced features

### Testing the Backend

In another terminal/PowerShell:

```bash
# Test health check
curl http://localhost:5000/api/health

# Should return:
# {
#   "status": "ok",
#   "version": "1.0.0",
#   "features": ["playlists", "ratings", "recommendations"],
#   ...
# }
```

---

## Troubleshooting

### "Python not found"
- **Solution**: Add Python to PATH or use full path `/usr/bin/python3.9`
- **Verify**: `python --version`

### "Virtual environment activation failed"
- **Windows**: Use `venv\Scripts\activate.bat` instead of `.ps1`
- **macOS/Linux**: Use `source venv/bin/activate`

### "ModuleNotFoundError: No module named 'flask'"
- **Solution**: Ensure virtual environment is activated (check `(venv)` in prompt)
- **Then**: `pip install -r requirements.txt`

### "distutils" module not found (Python 3.12+)
- **Solution**: Update requirements.txt with compatible versions
- **Run**: `pip install --upgrade pip setuptools wheel` before installing requirements
- **Then**: `pip install -r requirements.txt`

### "Connection refused" on Plex
- **Check**: Plex server is running (`ping 192.168.1.100`)
- **Check**: Server URL is correct in `.env.local`
- **Check**: Token is valid (test on plex.tv)

### "CORS error" in web app
- **Check**: Backend shows "running on http://127.0.0.1:5000"
- **Check**: Web app is at https://plexm8.netlify.app (not localhost)
- **Check**: No firewall blocking port 5000

### "Port 5000 already in use"
- **Option A**: Change PORT in `.env.local` (e.g., 5001)
- **Option B**: Find what's using it:
  - Windows: `netstat -ano | findstr :5000`
  - macOS/Linux: `lsof -i :5000`

---

## Advanced Configuration

### Running on Startup (Optional)

#### Windows (Task Scheduler)
1. Create `start-backend.bat`:
```batch
@echo off
cd /d "C:\path\to\plexm8\tools\python"
call venv\Scripts\activate.bat
python app.py
pause
```

2. Open Task Scheduler → Create Basic Task
3. Set trigger to "At startup"
4. Set action to run your `.bat` file

#### macOS (LaunchAgent)
Create `~/Library/LaunchAgents/com.plexm8.backend.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.plexm8.backend</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3.9</string>
        <string>/path/to/plexm8/tools/python/app.py</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
```

#### Linux (Systemd)
Create `/etc/systemd/system/plexm8-backend.service`:
```ini
[Unit]
Description=PlexM8 Local Backend
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/path/to/plexm8/tools/python
ExecStart=/path/to/plexm8/tools/python/venv/bin/python app.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then enable with: `sudo systemctl enable plexm8-backend`

---

## Maintenance

### Updating

To update dependencies:

```bash
# Activate virtual environment
# Then:
pip install --upgrade -r requirements.txt
```

To update PlexM8:

```bash
# If using Git
git pull origin main

# Then reinstall dependencies in case of changes
pip install -r requirements.txt
```

### Uninstalling

To remove the backend:

```bash
# Deactivate virtual environment
deactivate

# Delete the virtual environment
rm -rf venv

# Or remove entire tools/python directory if desired
rm -rf ../..
```

No permanent changes are made to your system.

---

## Next Steps

Once you have the backend running:

1. Verify it's detected (check for local backend indicator)
2. Go to Tools menu in the web app
3. Explore Ratings Manager
4. Check recommendations
5. Create smart playlists

---

## See Also

- [Backend API Reference](../backend/api-reference.md) - Full API documentation
- [Hybrid Architecture](../hybrid-architecture.md) - System design overview
- [Backend Features](../backend/features.md) - What the backend can do

---

## Support

- **Issues**: https://github.com/arcticweb/plexm8/issues
- **Documentation**: See the [docs](../) folder
