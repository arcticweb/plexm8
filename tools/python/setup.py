#!/usr/bin/env python3
"""
PlexM8 Python Backend Setup Script
Handles virtual environment creation, dependency installation, and validation.
Cross-platform (Windows, macOS, Linux)
"""

import os
import sys
import subprocess
import venv
from pathlib import Path

# ANSI color codes for terminal output
class Colors:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(msg):
    """Print a formatted header message"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{msg}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}\n")

def print_success(msg):
    """Print a success message"""
    print(f"{Colors.GREEN}✓ {msg}{Colors.RESET}")

def print_warning(msg):
    """Print a warning message"""
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.RESET}")

def print_error(msg):
    """Print an error message"""
    print(f"{Colors.RED}✗ {msg}{Colors.RESET}")

def print_info(msg):
    """Print an info message"""
    print(f"{Colors.BLUE}ℹ {msg}{Colors.RESET}")

def check_python_version():
    """Check if Python version is compatible (3.9+)"""
    print_header("Checking Python Version")
    
    version_info = sys.version_info
    version_str = f"{version_info.major}.{version_info.minor}.{version_info.micro}"
    print_info(f"Found Python {version_str}")
    
    if version_info.major < 3 or (version_info.major == 3 and version_info.minor < 9):
        print_error(f"Python 3.9+ is required (found {version_str})")
        sys.exit(1)
    
    print_success(f"Python {version_str} is compatible")
    return version_str

def get_venv_path():
    """Get the virtual environment path"""
    script_dir = Path(__file__).parent
    venv_path = script_dir / 'venv'
    return venv_path

def create_venv(venv_path):
    """Create virtual environment if it doesn't exist"""
    print_header("Setting Up Virtual Environment")
    
    if venv_path.exists():
        print_warning(f"Virtual environment already exists at {venv_path}")
        return True
    
    try:
        print_info(f"Creating virtual environment at {venv_path}...")
        venv.create(venv_path, with_pip=True, upgrade_deps=False)
        print_success("Virtual environment created successfully")
        return True
    except Exception as e:
        print_error(f"Failed to create virtual environment: {e}")
        return False

def get_pip_command(venv_path):
    """Get the pip command for the virtual environment"""
    if sys.platform == 'win32':
        return str(venv_path / 'Scripts' / 'pip.exe')
    else:
        return str(venv_path / 'bin' / 'pip')

def get_python_command(venv_path):
    """Get the python command for the virtual environment"""
    if sys.platform == 'win32':
        return str(venv_path / 'Scripts' / 'python.exe')
    else:
        return str(venv_path / 'bin' / 'python')

def upgrade_pip(pip_cmd):
    """Upgrade pip, setuptools, and wheel"""
    print_header("Upgrading pip, setuptools, and wheel")
    
    packages = ['pip', 'setuptools', 'wheel']
    print_info(f"Upgrading: {', '.join(packages)}...")
    
    try:
        subprocess.check_call([pip_cmd, 'install', '--upgrade'] + packages)
        print_success("pip, setuptools, and wheel upgraded successfully")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to upgrade packages: {e}")
        return False

def install_requirements(pip_cmd, venv_path):
    """Install requirements from requirements.txt"""
    print_header("Installing Dependencies")
    
    req_file = venv_path.parent / 'requirements.txt'
    
    if not req_file.exists():
        print_error(f"requirements.txt not found at {req_file}")
        return False
    
    print_info(f"Installing from {req_file}...")
    
    try:
        subprocess.check_call([pip_cmd, 'install', '-r', str(req_file)])
        print_success("Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to install dependencies: {e}")
        return False

def validate_installation(python_cmd):
    """Validate that key packages are installed"""
    print_header("Validating Installation")
    
    packages = [
        'flask',
        'flask_cors',
        'plexapi',
        'dotenv',
        'requests'
    ]
    
    print_info("Checking for required packages...")
    
    for package in packages:
        try:
            # Use Python to import and check each package
            subprocess.check_call(
                [python_cmd, '-c', f'import {package}'],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            print_success(f"{package} is installed")
        except subprocess.CalledProcessError:
            print_error(f"{package} is NOT installed")
            return False
    
    print_success("All required packages are installed")
    return True

def setup_env_file(venv_path):
    """Check for .env.local file and guide user if missing"""
    print_header("Configuration Check")
    
    env_file = venv_path.parent / '.env.local'
    template_file = venv_path.parent / '.env.local.template'
    
    if env_file.exists():
        print_success(".env.local configuration file found")
        return True
    
    if template_file.exists():
        print_warning(".env.local not found, but template exists")
        print_info("To configure the backend:")
        print_info(f"  1. Copy template: cp .env.local.template .env.local")
        print_info(f"  2. Edit .env.local with your Plex server details")
        print_info(f"  3. Especially set PLEX_TOKEN with your Plex authentication token")
        return True
    
    print_warning("Neither .env.local nor .env.local.template found")
    return True

def main():
    """Main setup function"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}PlexM8 Python Backend Setup{Colors.RESET}")
    print(f"{Colors.BLUE}Automated environment configuration{Colors.RESET}\n")
    
    # Step 1: Check Python version
    python_version = check_python_version()
    
    # Step 2: Get venv path
    venv_path = get_venv_path()
    print_info(f"Virtual environment path: {venv_path}")
    
    # Step 3: Create venv
    if not create_venv(venv_path):
        print_error("Setup failed at virtual environment creation")
        sys.exit(1)
    
    # Get commands for venv
    pip_cmd = get_pip_command(venv_path)
    python_cmd = get_python_command(venv_path)
    
    # Step 4: Upgrade pip/setuptools/wheel
    if not upgrade_pip(pip_cmd):
        print_error("Setup failed at pip upgrade")
        sys.exit(1)
    
    # Step 5: Install requirements
    if not install_requirements(pip_cmd, venv_path):
        print_error("Setup failed at dependency installation")
        sys.exit(1)
    
    # Step 6: Validate installation
    if not validate_installation(python_cmd):
        print_error("Setup failed at validation")
        sys.exit(1)
    
    # Step 7: Check configuration
    setup_env_file(venv_path)
    
    # Final summary
    print_header("Setup Complete!")
    print_success("PlexM8 backend environment is ready")
    
    activate_cmd = f"venv\\Scripts\\Activate.ps1" if sys.platform == 'win32' else "source venv/bin/activate"
    print_info(f"\nTo activate the environment:")
    print_info(f"  {activate_cmd}")
    print_info(f"\nTo start the backend:")
    print_info(f"  python app.py")
    print(f"\n{Colors.GREEN}Happy coding!{Colors.RESET}\n")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Setup cancelled by user{Colors.RESET}\n")
        sys.exit(0)
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        sys.exit(1)
