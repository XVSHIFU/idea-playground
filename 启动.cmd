@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0idea-hub\start.ps1"
if errorlevel 1 pause
