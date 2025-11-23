# PlexM8 Management Utilities
# PowerShell module for automated npm, git, and Netlify management
# 
# Usage:
#   . .\scripts\plexm8-utils.ps1
#   Update-Project
#   Deploy-ToNetlify
#   Check-ProjectStatus

# Configuration
$SCRIPT:ProjectRoot = (Get-Location).Path
$SCRIPT:PackageJsonPath = Join-Path $ProjectRoot "package.json"
$SCRIPT:DistPath = Join-Path $ProjectRoot "dist"

# Color constants for output
$SCRIPT:ColorInfo = "Cyan"
$SCRIPT:ColorSuccess = "Green"
$SCRIPT:ColorWarning = "Yellow"
$SCRIPT:ColorError = "Red"

<#
.SYNOPSIS
    Prints a colored message to the console
.PARAMETER Message
    The message to print
.PARAMETER Type
    The type of message (Info, Success, Warning, Error)
#>
function Write-Message {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("Info", "Success", "Warning", "Error")]
        [string]$Type = "Info"
    )
    
    $color = switch ($Type) {
        "Success" { $SCRIPT:ColorSuccess }
        "Warning" { $SCRIPT:ColorWarning }
        "Error" { $SCRIPT:ColorError }
        default { $SCRIPT:ColorInfo }
    }
    
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $color
}

<#
.SYNOPSIS
    Checks if a command exists in the current environment
.PARAMETER Command
    The command name to check
#>
function Test-CommandExists {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

<#
.SYNOPSIS
    Audits project security and checks for vulnerabilities
#>
function Invoke-SecurityAudit {
    Write-Message "Starting security audit..." -Type Info
    
    if (-not (Test-CommandExists "npm")) {
        Write-Message "npm not found. Please install Node.js" -Type Error
        return $false
    }
    
    Write-Message "Running npm audit..." -Type Info
    npm audit
    
    $auditStatus = $LASTEXITCODE
    if ($auditStatus -eq 0) {
        Write-Message "Security audit passed - no vulnerabilities found" -Type Success
        return $true
    }
    else {
        Write-Message "Security vulnerabilities detected. Review npm audit output above." -Type Warning
        return $false
    }
}

<#
.SYNOPSIS
    Checks for available npm package updates
#>
function Get-PackageUpdates {
    Write-Message "Checking for package updates..." -Type Info
    
    npm outdated
    
    if ($LASTEXITCODE -eq 0) {
        Write-Message "All packages are up to date" -Type Success
    }
    else {
        Write-Message "Some packages have updates available. Run 'npm update' to update." -Type Info
    }
}

<#
.SYNOPSIS
    Updates npm packages (minor and patch versions only)
#>
function Update-Packages {
    param(
        [Parameter(Mandatory = $false)]
        [switch]$Major,
        
        [Parameter(Mandatory = $false)]
        [switch]$Force
    )
    
    Write-Message "Updating npm packages..." -Type Info
    
    if ($Major) {
        Write-Message "Major version updates enabled. This may cause breaking changes." -Type Warning
        npm update --save
    }
    else {
        Write-Message "Updating minor and patch versions only (safe updates)..." -Type Info
        npm update --save
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Message "Packages updated successfully" -Type Success
        
        # Run security audit after update
        Write-Message "Running security audit after update..." -Type Info
        Invoke-SecurityAudit
        
        return $true
    }
    else {
        Write-Message "Package update failed" -Type Error
        return $false
    }
}

<#
.SYNOPSIS
    Validates the project build configuration
#>
function Test-BuildConfiguration {
    Write-Message "Validating build configuration..." -Type Info
    
    # Check for required files
    $requiredFiles = @(
        "package.json",
        "tsconfig.json",
        "vite.config.ts",
        "netlify.toml",
        ".eslintrc.cjs"
    )
    
    $allFilesExist = $true
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $ProjectRoot $file
        if (Test-Path $filePath) {
            Write-Message "  ✓ Found $file" -Type Success
        }
        else {
            Write-Message "  ✗ Missing $file" -Type Error
            $allFilesExist = $false
        }
    }
    
    if ($allFilesExist) {
        Write-Message "Build configuration is valid" -Type Success
        return $true
    }
    else {
        Write-Message "Build configuration has issues" -Type Error
        return $false
    }
}

<#
.SYNOPSIS
    Builds the project
#>
function Build-Project {
    param(
        [Parameter(Mandatory = $false)]
        [ValidateSet("dev", "prod", "staging")]
        [string]$Environment = "dev"
    )
    
    Write-Message "Building project for $Environment environment..." -Type Info
    
    if (-not (Test-CommandExists "npm")) {
        Write-Message "npm not found. Please install Node.js" -Type Error
        return $false
    }
    
    # Run type checking first
    Write-Message "Running TypeScript type check..." -Type Info
    npm run type-check
    if ($LASTEXITCODE -ne 0) {
        Write-Message "Type checking failed" -Type Error
        return $false
    }
    
    # Run linting
    Write-Message "Running linter..." -Type Info
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Message "Linting failed" -Type Warning
    }
    
    # Run build
    Write-Message "Running build..." -Type Info
    if ($Environment -eq "prod") {
        npm run build:prod
    }
    elseif ($Environment -eq "staging") {
        npm run build:staging
    }
    else {
        npm run build
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Message "Build completed successfully" -Type Success
        Write-Message "Output directory: $DistPath" -Type Info
        return $true
    }
    else {
        Write-Message "Build failed" -Type Error
        return $false
    }
}

<#
.SYNOPSIS
    Checks the overall project status
#>
function Check-ProjectStatus {
    Write-Message "Checking project status..." -Type Info
    Write-Host ""
    
    # Git status
    Write-Message "Git Repository:" -Type Info
    if (Test-CommandExists "git") {
        $branch = git rev-parse --abbrev-ref HEAD
        $status = git status --porcelain
        Write-Message "  Branch: $branch" -Type Success
        if ($status) {
            Write-Message "  Status: Changes detected" -Type Warning
            Write-Host $status
        }
        else {
            Write-Message "  Status: Clean" -Type Success
        }
    }
    
    Write-Host ""
    
    # Node/npm status
    Write-Message "Node.js & npm:" -Type Info
    if (Test-CommandExists "node") {
        $nodeVersion = node --version
        Write-Message "  Node.js: $nodeVersion" -Type Success
    }
    if (Test-CommandExists "npm") {
        $npmVersion = npm --version
        Write-Message "  npm: $npmVersion" -Type Success
    }
    
    Write-Host ""
    
    # Dependencies
    Write-Message "Dependencies:" -Type Info
    Write-Message "  Checking for vulnerabilities..." -Type Info
    $auditResult = npm audit --json 2>$null | ConvertFrom-Json
    if ($auditResult.metadata.vulnerabilities.total -eq 0) {
        Write-Message "  Status: No vulnerabilities" -Type Success
    }
    else {
        Write-Message "  Status: $($auditResult.metadata.vulnerabilities.total) vulnerabilities found" -Type Warning
    }
    
    Write-Host ""
    
    # Build configuration
    Write-Message "Build Configuration:" -Type Info
    Test-BuildConfiguration | Out-Null
    
    Write-Host ""
    
    # Netlify status
    if (Test-CommandExists "netlify") {
        Write-Message "Netlify CLI:" -Type Info
        $netlifyVersion = netlify --version 2>$null
        Write-Message "  $netlifyVersion" -Type Success
    }
}

<#
.SYNOPSIS
    Deploys the project to Netlify
.PARAMETER Production
    Deploy to production site
.PARAMETER StagingOnly
    Only deploy to staging (not production)
#>
function Deploy-ToNetlify {
    param(
        [Parameter(Mandatory = $false)]
        [switch]$Production,
        
        [Parameter(Mandatory = $false)]
        [switch]$StagingOnly
    )
    
    if (-not (Test-CommandExists "netlify")) {
        Write-Message "Netlify CLI not found. Install with: npm install -g netlify-cli" -Type Error
        return $false
    }
    
    Write-Message "Preparing for Netlify deployment..." -Type Info
    
    # Check project status
    Check-ProjectStatus
    
    Write-Host ""
    
    # Build the project
    if (-not (Build-Project -Environment "prod")) {
        Write-Message "Build failed. Aborting deployment." -Type Error
        return $false
    }
    
    Write-Host ""
    Write-Message "Starting Netlify deployment..." -Type Info
    
    if ($Production) {
        Write-Message "Deploying to PRODUCTION..." -Type Warning
        netlify deploy --prod
    }
    else {
        Write-Message "Deploying to staging/preview..." -Type Info
        netlify deploy
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Message "Deployment completed successfully" -Type Success
        return $true
    }
    else {
        Write-Message "Deployment failed" -Type Error
        return $false
    }
}

<#
.SYNOPSIS
    Performs a complete project update with security checks
#>
function Update-Project {
    param(
        [Parameter(Mandatory = $false)]
        [switch]$Major,
        
        [Parameter(Mandatory = $false)]
        [switch]$SkipAudit
    )
    
    Write-Message "=== PlexM8 Project Update ===" -Type Info
    Write-Host ""
    
    # Check current status
    Check-ProjectStatus
    
    Write-Host ""
    Write-Message "=== Updating Dependencies ===" -Type Info
    Write-Host ""
    
    # Update packages
    if (-not (Update-Packages -Major:$Major)) {
        Write-Message "Update failed. Please check the errors above." -Type Error
        return $false
    }
    
    Write-Host ""
    
    # Commit changes
    if (Test-CommandExists "git") {
        Write-Message "Committing package changes to git..." -Type Info
        git add package.json package-lock.json 2>$null
        git commit -m "chore: update dependencies" 2>$null
        Write-Message "Changes committed" -Type Success
    }
    
    Write-Host ""
    Write-Message "=== Update Complete ===" -Type Success
    Write-Message "Next steps:" -Type Info
    Write-Message "  1. Test locally: npm run dev" -Type Info
    Write-Message "  2. Review changes: git log" -Type Info
    Write-Message "  3. Deploy: Deploy-ToNetlify -Production" -Type Info
}

<#
.SYNOPSIS
    Clean build artifacts and node_modules (careful!)
.PARAMETER Full
    Also remove node_modules and reinstall
#>
function Clear-BuildArtifacts {
    param(
        [Parameter(Mandatory = $false)]
        [switch]$Full
    )
    
    Write-Message "Cleaning build artifacts..." -Type Warning
    
    # Remove dist
    if (Test-Path $DistPath) {
        Remove-Item -Path $DistPath -Recurse -Force
        Write-Message "  ✓ Removed dist/" -Type Success
    }
    
    # Remove generated files
    Get-ChildItem -Path (Join-Path $ProjectRoot "src") -Include "*.js", "*.d.ts", "*.js.map", "*.d.ts.map" -Recurse | Remove-Item -Force
    Write-Message "  ✓ Removed generated TypeScript files" -Type Success
    
    if ($Full) {
        Write-Message "Removing node_modules (this may take a moment)..." -Type Warning
        if (Test-Path (Join-Path $ProjectRoot "node_modules")) {
            Remove-Item -Path (Join-Path $ProjectRoot "node_modules") -Recurse -Force
            Write-Message "  ✓ Removed node_modules/" -Type Success
        }
        
        Write-Message "Reinstalling dependencies..." -Type Info
        npm install
        Write-Message "  ✓ Dependencies reinstalled" -Type Success
    }
    
    Write-Message "Clean complete" -Type Success
}

<#
.SYNOPSIS
    Export public functions
#>
Export-ModuleMember -Function @(
    "Write-Message",
    "Test-CommandExists",
    "Invoke-SecurityAudit",
    "Get-PackageUpdates",
    "Update-Packages",
    "Test-BuildConfiguration",
    "Build-Project",
    "Check-ProjectStatus",
    "Deploy-ToNetlify",
    "Update-Project",
    "Clear-BuildArtifacts"
)

# Print help message when module is loaded
Write-Host ""
Write-Message "PlexM8 Management Utilities loaded. Available functions:" -Type Success
Write-Host "  • Update-Project                - Complete dependency update with checks"
Write-Host "  • Deploy-ToNetlify [-Production] - Deploy to Netlify"
Write-Host "  • Check-ProjectStatus           - Show project health status"
Write-Host "  • Build-Project [-Environment]  - Build for dev/staging/prod"
Write-Host "  • Update-Packages               - Update npm dependencies"
Write-Host "  • Invoke-SecurityAudit          - Run security audit"
Write-Host "  • Get-PackageUpdates            - Check for available updates"
Write-Host "  • Clear-BuildArtifacts [-Full]  - Clean build files"
Write-Host ""
