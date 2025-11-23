# PlexM8 Management Utilities

PowerShell module for automated project management, deployment, and maintenance of the PlexM8 application.

## Quick Start

### Load the utilities module

```powershell
. ./scripts/plexm8-utils.ps1
```

This will load all management functions and display available commands.

## Available Functions

### Update & Maintenance

#### `Update-Project [-Major] [-SkipAudit]`
Performs a complete project update with security checks:
- Audits current dependencies for vulnerabilities
- Updates npm packages (minor/patch by default)
- Optionally includes major version updates with `-Major` flag
- Commits changes to git
- Displays next steps

**Example:**
```powershell
Update-Project                    # Safe update (minor/patch only)
Update-Project -Major             # Include major version updates
```

#### `Get-PackageUpdates`
Lists available package updates without installing them.

```powershell
Get-PackageUpdates
```

#### `Update-Packages [-Major] [-Force]`
Updates npm packages with safety checks.

**Example:**
```powershell
Update-Packages                   # Update minor/patch versions
Update-Packages -Major            # Include major updates
```

### Security & Health

#### `Invoke-SecurityAudit`
Runs npm audit to check for security vulnerabilities.

```powershell
Invoke-SecurityAudit
```

#### `Check-ProjectStatus`
Displays comprehensive project health status including:
- Git branch and uncommitted changes
- Node.js and npm versions
- Security vulnerabilities
- Build configuration validation
- Netlify CLI status

**Example:**
```powershell
Check-ProjectStatus
```

### Build & Deployment

#### `Build-Project [-Environment {dev|prod|staging}]`
Builds the project with type checking and linting.

**Example:**
```powershell
Build-Project                     # Development build
Build-Project -Environment prod   # Production build
Build-Project -Environment staging # Staging build
```

#### `Deploy-ToNetlify [-Production] [-StagingOnly]`
Deploys the project to Netlify with automatic validation:
- Checks project status
- Runs full build
- Deploys to staging by default (preview URL)
- Use `-Production` to deploy to production site

**Example:**
```powershell
Deploy-ToNetlify                  # Deploy to staging/preview
Deploy-ToNetlify -Production      # Deploy to production
```

### Cleanup

#### `Clear-BuildArtifacts [-Full]`
Removes build artifacts and generated files:
- Removes `dist/` directory
- Removes generated `.js`, `.d.ts` files
- With `-Full` flag: also reinstalls `node_modules`

**Example:**
```powershell
Clear-BuildArtifacts              # Remove dist/ and generated files
Clear-BuildArtifacts -Full        # Also reinstall node_modules
```

### Utilities

#### `Test-CommandExists <command>`
Checks if a command is available in the current environment.

```powershell
Test-CommandExists git
Test-CommandExists netlify
```

#### `Write-Message <message> [-Type {Info|Success|Warning|Error}]`
Prints colored messages to the console (used internally by other functions).

```powershell
Write-Message "This is a success message" -Type Success
```

#### `Test-BuildConfiguration`
Validates that all required build configuration files exist.

```powershell
Test-BuildConfiguration
```

## Common Workflows

### Regular Maintenance (Weekly)

```powershell
# 1. Load utilities
. ./scripts/plexm8-utils.ps1

# 2. Check project health
Check-ProjectStatus

# 3. Update dependencies
Update-Project

# 4. Test locally
npm run dev

# 5. Deploy when ready
Deploy-ToNetlify -Production
```

### Security Audit

```powershell
. ./scripts/plexm8-utils.ps1
Invoke-SecurityAudit
```

### Clean Rebuild

```powershell
. ./scripts/plexm8-utils.ps1

# Full clean and rebuild
Clear-BuildArtifacts -Full
Build-Project -Environment prod
```

### Pre-Deployment Checklist

```powershell
. ./scripts/plexm8-utils.ps1

# 1. Check status
Check-ProjectStatus

# 2. Run security audit
Invoke-SecurityAudit

# 3. Build for production
Build-Project -Environment prod

# 4. Deploy
Deploy-ToNetlify -Production
```

## Prerequisites

### Required

- **PowerShell 5.1+** (Windows) or **PowerShell 7+** (cross-platform)
- **Node.js 18+** and **npm 9+**
- **git** for version control

### Optional (for deployment)

- **Netlify CLI** - Install with: `npm install -g netlify-cli`

## Installation

### 1. Ensure prerequisites are installed

```powershell
# Check PowerShell version
$PSVersionTable.PSVersion

# Check Node.js
node --version

# Check npm
npm --version

# Check git
git --version
```

### 2. Install Netlify CLI (optional but recommended)

```powershell
npm install -g netlify-cli
netlify --version
```

### 3. Create PowerShell profile alias (optional)

Add to your PowerShell profile (`$PROFILE`):

```powershell
function pm { . ./scripts/plexm8-utils.ps1 }
```

Then you can simply type `pm` to load utilities.

## Error Handling

All functions include error checking and will:
- Report errors in red text with timestamp
- Exit early if prerequisites are missing
- Provide helpful suggestions for fixes
- Return `$true` or `$false` for success/failure status

## Security Notes

- The utilities module should only be run from the project root directory
- Environment variables for secrets are managed by Netlify
- Sensitive information is never logged to console
- Security audits are run before and after updates

## Troubleshooting

### "npm not found"
Install Node.js from https://nodejs.org/

### "netlify not found"
Run: `npm install -g netlify-cli`

### "Permission denied" on PowerShell
Try: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Build fails after update
Run: `Clear-BuildArtifacts -Full` then `npm run build`

## Related Documentation

- [Deployment Guide](../docs/deployment.md)
- [Development Setup](../docs/setup.md)
- [Architecture Overview](../docs/architecture.md)

## Support

For issues or questions about the utilities:
1. Check the function help: `Get-Help Update-Project -Full`
2. Review the function source in `scripts/plexm8-utils.ps1`
3. Run `Check-ProjectStatus` to diagnose issues
