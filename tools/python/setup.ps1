# PlexM8 Python Backend Setup Script for Windows
# Handles Python installation, virtual environment setup, and dependency installation
# Usage: .\setup.ps1 or powershell -ExecutionPolicy Bypass -File setup.ps1

param(
    [switch]$SkipPythonCheck = $false
)

# Simple message functions
function Write-Success { Write-Host "[OK] $args" -ForegroundColor Green }
function Write-ErrorMsg { Write-Host "[ERROR] $args" -ForegroundColor Red }
function Write-InfoMsg { Write-Host "[INFO] $args" -ForegroundColor Cyan }
function Write-Header { Write-Host "`n$('='*60)`n$args`n$('='*60)`n" -ForegroundColor Blue }

# Check if Python is installed
function Test-PythonInstalled {
    try {
        $version = & python --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $true, $version
        }
        return $false, $null
    }
    catch {
        return $false, $null
    }
}

# Validate Python version (3.9+)
function Test-PythonVersion {
    try {
        $output = & python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $parts = $output.Split('.')
            $major = [int]$parts[0]
            $minor = [int]$parts[1]
            
            if ($major -lt 3 -or ($major -eq 3 -and $minor -lt 9)) {
                return $false, $output
            }
            return $true, $output
        }
        return $false, $null
    }
    catch {
        return $false, $null
    }
}

# Main setup function
function Main {
    Write-Host "`nPlexM8 Python Backend Setup (Windows)`nAutomated environment configuration`n" -ForegroundColor Blue
    
    # Check Python
    Write-Header "Checking Python Installation"
    
    $installed, $version = Test-PythonInstalled
    
    if (-not $installed) {
        Write-ErrorMsg "Python is not installed or not in PATH"
        Write-InfoMsg "Please install Python 3.9+ from https://www.python.org/downloads/"
        Write-InfoMsg "Make sure to check 'Add Python to PATH' during installation"
        Write-InfoMsg "After installation, run this script again"
        exit 1
    }
    
    Write-Success "Python found: $version"
    
    # Validate version
    $validVersion, $versionNumber = Test-PythonVersion
    if (-not $validVersion) {
        Write-ErrorMsg "Python 3.9+ is required (found $versionNumber)"
        exit 1
    }
    Write-Success "Python version $versionNumber is compatible"
    
    # Get script directory
    # Note: Works both from venv and regular PowerShell
    $scriptDir = $PSScriptRoot
    if (-not $scriptDir) {
        $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    }
    if (-not $scriptDir) {
        $scriptDir = Get-Location
    }
    $venvPath = Join-Path $scriptDir "venv"
    $setupPyPath = Join-Path $scriptDir "setup.py"
    
    Write-InfoMsg "Virtual environment path: $venvPath"
    Write-InfoMsg "Setup script: $setupPyPath"
    
    # Check if setup.py exists
    if (-not (Test-Path $setupPyPath)) {
        Write-ErrorMsg "setup.py not found at $setupPyPath"
        exit 1
    }
    
    # Run Python setup script
    Write-Header "Running Python Setup Script"
    Write-InfoMsg "Executing: python setup.py"
    
    & python "$setupPyPath"
    
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "Setup script failed with exit code $LASTEXITCODE"
        exit 1
    }
    
    # Display completion message
    Write-Header "Setup Complete!"
    Write-Success "PlexM8 backend environment is ready"
    
    Write-InfoMsg ""
    Write-InfoMsg "Next steps:"
    Write-InfoMsg ""
    Write-InfoMsg "1. Configure the backend:"
    Write-InfoMsg "   cd $scriptDir"
    Write-InfoMsg "   cp .env.local.template .env.local"
    Write-InfoMsg "   notepad .env.local"
    Write-InfoMsg ""
    Write-InfoMsg "2. Activate the environment:"
    Write-InfoMsg "   $venvPath\Scripts\Activate.ps1"
    Write-InfoMsg ""
    Write-InfoMsg "3. Start the backend:"
    Write-InfoMsg "   python app.py"
    Write-InfoMsg ""
    Write-InfoMsg "4. Test the backend:"
    Write-InfoMsg "   curl http://localhost:5000/api/health"
    Write-InfoMsg ""
    Write-Host "Happy coding!`n" -ForegroundColor Green
}

# Error handling
$ErrorActionPreference = "Continue"

try {
    Main
}
catch {
    Write-ErrorMsg "Error: $_"
    exit 1
}
