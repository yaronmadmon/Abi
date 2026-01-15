@echo off
powershell -ExecutionPolicy Bypass -File fix-next-permissions.ps1
if %ERRORLEVEL% EQU 0 (
    next dev
) else (
    echo Failed to fix permissions, starting Next.js anyway...
    next dev
)
