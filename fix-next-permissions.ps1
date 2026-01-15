# Fix permissions on .next directory to prevent EPERM errors
# Run this if you encounter "operation not permitted" errors with Next.js

$ErrorActionPreference = "Continue"

Write-Host "Fixing permissions on .next directory..." -ForegroundColor Cyan

if (Test-Path .next) {
    $username = $env:USERNAME
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
} else {
    Write-Host ".next directory does not exist yet (will be created on first run)" -ForegroundColor Gray
}
