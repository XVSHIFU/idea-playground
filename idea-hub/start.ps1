$ErrorActionPreference = 'Stop'
$hubUrl = 'http://127.0.0.1:4200'
$runtimeDirectory = Join-Path $PSScriptRoot '.runtime'
$serverPath = Join-Path $PSScriptRoot 'server.mjs'
function Test-Hub {
  try { return (Invoke-RestMethod "$hubUrl/api/health" -TimeoutSec 2).app -eq 'idea-hub' } catch { return $false }
}
if (-not (Test-Hub)) {
  $nodePath = (Get-Command node -ErrorAction Stop).Source
  New-Item -ItemType Directory -Path $runtimeDirectory -Force | Out-Null
  $process = Start-Process -FilePath $nodePath -ArgumentList ('"' + $serverPath + '"') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $runtimeDirectory 'server.log') -RedirectStandardError (Join-Path $runtimeDirectory 'server-error.log')
  Set-Content -LiteralPath (Join-Path $runtimeDirectory 'server.pid') -Value $process.Id
  $ready = $false
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    if (Test-Hub) { $ready = $true; break }
    $process.Refresh()
    if ($process.HasExited) { break }
    Start-Sleep -Milliseconds 200
  }
  if (-not $ready) { throw "Unable to start Idea Hub. Check .runtime/server-error.log and port 4200." }
}
Start-Process $hubUrl
