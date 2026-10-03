param([switch]$NoOpen)
$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$url = 'http://127.0.0.1:4177'
try {
  $response = Invoke-WebRequest -Uri $url -TimeoutSec 2 -UseBasicParsing
  if ($response.Content -notmatch 'id="organism"') { throw 'Port 4177 is used by another application.' }
} catch {
  if ($_.Exception.Message -like '*another application*') { throw }
  $node = (Get-Command node -ErrorAction Stop).Source
  $serverPath = Join-Path $projectRoot 'server.js'
  $server = Start-Process -FilePath $node -ArgumentList ('"' + $serverPath + '"') -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $projectRoot 'server.log') -RedirectStandardError (Join-Path $projectRoot 'server-error.log')
  $server.Id | Set-Content -LiteralPath (Join-Path $projectRoot '.server.pid')
  $ready = $false
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 250
    try { $response = Invoke-WebRequest -Uri $url -TimeoutSec 1 -UseBasicParsing; $ready = $response.StatusCode -eq 200; if ($ready) { break } } catch {}
  }
  if (-not $ready) { throw 'The local server could not start. See server-error.log.' }
}
if (-not $NoOpen) { Start-Process $url }
