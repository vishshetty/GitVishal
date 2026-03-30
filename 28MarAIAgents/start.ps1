$ErrorActionPreference = "Stop"

Write-Host "Starting Intelligent Test Planner Agent (Node.js + React)..." -ForegroundColor Green

# Start Backend
Write-Host "Starting Node Express Backend on port 8000..." -ForegroundColor Cyan
Set-Location -Path "backend"
Start-Process -NoNewWindow -FilePath "npm.cmd" -ArgumentList "start"

# Start Frontend
Write-Host "Starting React Frontend on port 5173..." -ForegroundColor Cyan
Set-Location -Path "..\frontend"
npm run dev
