$ErrorActionPreference = 'Stop'
$pidFile = Join-Path $PSScriptRoot '.server.pid'
if (Test-Path -LiteralPath $pidFile) {
  $serverPid = [int](Get-Content -LiteralPath $pidFile)
  $serverPath = Join-Path $PSScriptRoot 'server.js'
  $process = Get-CimInstance Win32_Process -Filter "ProcessId = $serverPid"
  if ($process -and $process.Name -eq 'node.exe' -and $process.CommandLine.Contains($serverPath)) { Stop-Process -Id $serverPid }
  Remove-Item -LiteralPath $pidFile
}
