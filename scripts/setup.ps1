$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

npm.cmd run setup
npm.cmd run healthcheck
