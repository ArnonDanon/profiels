<#
  dev.ps1 — helper to run the local development servers for this repo

  What it does:
  - Copies .env.local.example -> .env.local (backs up existing .env.local if present)
  - Starts the .NET minimal API in a new PowerShell window (dotnet run) bound to http://localhost:5001
  - Starts the Next.js dev server in a new PowerShell window (npm run dev)

  Usage (PowerShell):
    .\dev.ps1

  Notes:
  - This script is intended for local development on Windows. It opens two separate PowerShell windows so logs are separate.
  - If you want a single-terminal solution, run the two commands manually in separate terminals.
#>

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$exampleEnv = Join-Path $scriptRoot ".env.local.example"
$destEnv = Join-Path $scriptRoot ".env.local"

Write-Host "[dev.ps1] repo root: $scriptRoot"

if (Test-Path $exampleEnv) {
    if (Test-Path $destEnv) {
        $time = Get-Date -Format "yyyyMMddHHmmss"
        $backup = "$destEnv.bak.$time"
        Write-Host "[dev.ps1] Backing up existing .env.local -> $backup"
        Move-Item -Path $destEnv -Destination $backup -Force
    }
    Write-Host "[dev.ps1] Copying .env.local.example -> .env.local"
    Copy-Item -Path $exampleEnv -Destination $destEnv -Force
} else {
    Write-Host "[dev.ps1] Warning: .env.local.example not found at $exampleEnv. You may need to create .env.local manually."
}

# Path to dotnet-api project
$dotnetProject = Join-Path $scriptRoot "dotnet-api"
if (-Not (Test-Path $dotnetProject)) {
    Write-Host "[dev.ps1] Warning: dotnet-api folder not found at $dotnetProject"
}

# Start .NET API in new PowerShell window
$dotnetCmd = "Set-Location -LiteralPath '$dotnetProject'; dotnet run --urls 'http://localhost:5001'"
Write-Host "[dev.ps1] Starting .NET API in new window..."
Start-Process -FilePath "powershell.exe" -ArgumentList '-NoExit','-Command',$dotnetCmd -WindowStyle Normal

# Start Next.js dev server in new PowerShell window
$nextCmd = "Set-Location -LiteralPath '$scriptRoot'; npm install; npm run dev"
Write-Host "[dev.ps1] Starting Next.js dev server in new window..."
Start-Process -FilePath "powershell.exe" -ArgumentList '-NoExit','-Command',$nextCmd -WindowStyle Normal

Write-Host "[dev.ps1] Launched both processes. Close the new windows to stop the servers."
