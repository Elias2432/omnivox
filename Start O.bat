@echo off
title O - Omnivox launcher
cd /d "%~dp0"

if "%~1"=="admin" goto fixlan

echo ============================================
echo    O - Omnivox launcher
echo ============================================
echo    [1] Tunnel mode - works on any network
echo    [2] LAN mode     - same Wi-Fi, fastest
echo    [3] Fix LAN mode - admin network/firewall setup
echo    [4] Visualiser   - preview the app in a browser (PC)
echo ============================================
set /p CHOICE=Choose 1, 2, 3 or 4 - press Enter for 1:
if "%CHOICE%"=="" set CHOICE=1
if "%CHOICE%"=="1" goto tunnel
if "%CHOICE%"=="2" goto lan
if "%CHOICE%"=="3" goto askadmin
if "%CHOICE%"=="4" goto visualiser
echo Invalid choice.
pause
exit /b 1

:tunnel
title O - Expo Dev Server (Tunnel)
echo.
echo   Starting in TUNNEL mode...
echo   Scan the QR code with your iPhone (Expo Go).
echo   Works even if LAN/Wi-Fi is blocked.
echo.
call npx expo start --tunnel
echo.
echo Server stopped. Press any key to close...
pause >nul
exit /b 0

:lan
title O - Expo Dev Server (LAN)
echo.
echo   Starting in LAN mode...
echo   Phone and PC must be on the same Wi-Fi.
echo   If the phone cannot connect, run option 3 first.
echo.
call npx expo start
echo.
echo Server stopped. Press any key to close...
pause >nul
exit /b 0

:askadmin
echo.
echo   Requesting administrator rights for the LAN fix...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -ArgumentList 'admin' -Verb RunAs"
exit /b 0

:visualiser
title O - Visualiser (apercu PC)
echo.
echo   Starting the Expo dev server in a second window...
start "O - Metro (Visualiser)" cmd /k npx expo start
echo   Waiting for Metro on http://localhost:8081 (first start ~30 s)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok=$false; $d=(Get-Date).AddSeconds(150); while((Get-Date) -lt $d){ try{ Invoke-WebRequest -Uri 'http://localhost:8081' -UseBasicParsing -TimeoutSec 3 | Out-Null; $ok=$true; break }catch{ Start-Sleep -Seconds 2 } }; if($ok){ Write-Host 'Metro is ready.' } else { Write-Host 'Metro did not answer on port 8081 - check the second window.' }"
start "" "%~dp0Visualiser.html"
echo.
echo   The visualiser window is open. Metro keeps running in its own window.
echo   Press any key to close this launcher...
pause >nul
exit /b 0

:fixlan
title O - Enable LAN mode (Admin)
echo ============================================
echo   Setting the network profile to Private
echo   and opening the firewall for node.exe...
echo ============================================
powershell -NoProfile -Command "Get-NetConnectionProfile | Set-NetConnectionProfile -NetworkCategory Private"
netsh advfirewall firewall delete rule name="O - Expo dev server (node)" >nul 2>&1
netsh advfirewall firewall add rule name="O - Expo dev server (node)" dir=in action=allow program="%ProgramFiles%\nodejs\node.exe" enable=yes >nul 2>&1
netsh advfirewall firewall delete rule name="O - Expo dev server (node nvm4w)" >nul 2>&1
netsh advfirewall firewall add rule name="O - Expo dev server (node nvm4w)" dir=in action=allow program="C:\nvm4w\nodejs\node.exe" enable=yes >nul 2>&1
echo Done! Starting LAN mode...
echo.
call npx expo start
echo.
echo Server stopped. Press any key to close...
pause >nul
exit /b 0
