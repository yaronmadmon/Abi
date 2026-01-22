# Fix permissions on .next directory to prevent EPERM errors
# Run this if you encounter "operation not permitted" errors with Next.js

$ErrorActionPreference = "Continue"

Write-Host "Fixing permissions on .next directory..." -ForegroundColor Cyan

$username = $env:USERNAME

# Ensure the directory exists so we can grant permissions proactively.
if (!(Test-Path .next)) {
    try {
        New-Item -ItemType Directory -Path .next -Force | Out-Null
        Write-Host "Created .next directory" -ForegroundColor Green
    } catch {
        Write-Host "Failed to create .next directory (will retry when Next.js creates it)" -ForegroundColor Yellow
    }
}

if (Test-Path .next) {
    Write-Host "Granting full control to $username on .next directory..." -ForegroundColor Yellow
    
    # Grant full control recursively
    icacls .next /grant "${username}:F" /T /C 2>&1 | Out-Null
    
    # If trace file exists and is locked, try to remove it
    try {
        $tracePath = Join-Path .next "trace"
        if ([System.IO.File]::Exists($tracePath)) {
            Remove-Item $tracePath -Force -ErrorAction Stop
            Write-Host "Removed locked trace file" -ForegroundColor Green
        }
    } catch {
        # Trace file access errors are non-fatal - Next.js will work without it
        # Silently continue
    }
    
    Write-Host "Permissions fixed!" -ForegroundColor Green
}
