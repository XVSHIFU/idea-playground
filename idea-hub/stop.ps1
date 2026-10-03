$ErrorActionPreference = 'Stop'
$pidFile = Join-Path $PSScriptRoot '.runtime/server.pid'
if (-not (Test-Path -LiteralPath $pidFile)) { Write-Output 'No launcher-owned server recorded. For npm start, use Ctrl+C.'; exit }
$serverProcessId = [int](Get-Content -LiteralPath $pidFile -Raw)
$serverPath = Join-Path $PSScriptRoot 'server.mjs'
$process = Get-CimInstance Win32_Process -Filter "ProcessId = $serverProcessId"
if ($process) {
  if ($process.Name -ne 'node.exe' -or -not $process.CommandLine.Contains($serverPath)) { throw 'PID now belongs to a different process; nothing was stopped.' }
  Stop-Process -Id $serverProcessId
}
Remove-Item -LiteralPath $pidFile
Write-Output 'Idea Hub and its owned project listeners stopped. Independently started projects are unchanged.'
