$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  Write-Host '.env created from .env.example'
}

npm.cmd run healthcheck
npm.cmd run dev:plan
npm.cmd run dev:once
