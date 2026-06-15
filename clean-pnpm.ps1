# Clean and Optimize PNPM Script for Windows (PowerShell)
# This script releases file locks, prunes the global store, removes corrupted/old node_modules, and does a fresh install.

$ErrorActionPreference = "SilentlyContinue"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   OPTIMIZING & CLEANING PNPM WORKSPACE   " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Terminate running node processes (releases file locks)
Write-Host "[1/4] Stopping active Node processes to release locks..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force
Start-Sleep -Seconds 1
Write-Host "Done: Node processes stopped." -ForegroundColor Green

# 2. Prune global store (frees up disk space)
Write-Host "[2/4] Pruning unused packages from global store..." -ForegroundColor Yellow
pnpm store prune
Write-Host "Done: Global store pruned successfully." -ForegroundColor Green

# 3. Remove local node_modules recursively
Write-Host "[3/4] Finding and deleting local node_modules folders..." -ForegroundColor Yellow
$folders = Get-ChildItem -Path . -Filter "node_modules" -Recurse -Directory
if ($folders) {
    foreach ($folder in $folders) {
        Write-Host "Removing: $($folder.FullName)" -ForegroundColor Gray
        Remove-Item -Path $folder.FullName -Recurse -Force
    }
    Write-Host "Done: Local node_modules folders cleared." -ForegroundColor Green
} else {
    Write-Host "Done: No node_modules folders found to delete." -ForegroundColor Green
}

# 4. Perform fresh install
Write-Host "[4/4] Running clean installation..." -ForegroundColor Yellow
pnpm install
Write-Host "Done: Clean installation complete!" -ForegroundColor Green

Write-Host "=========================================" -ForegroundColor Green
Write-Host " Workspace optimized and disk space freed! " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
