@echo off
setlocal enabledelayedexpansion

set MAXWIDTH=800
set QUALITY=88
set BACKUP_DIR=_originale

cd /d "%~dp0"

echo.
echo   DFC Bilder-Optimierung
echo   Ordner:    %cd%
echo   Max. Breite: %MAXWIDTH%px, JPG Qualitaet %QUALITY%%%
echo   Seitenverhaeltnis bleibt erhalten
echo.

where magick >nul 2>nul
if %errorlevel% neq 0 (
    echo   FEHLER: ImageMagick ist nicht installiert!
    echo   Download: https://imagemagick.org/script/download.php#windows
    echo   Bei Installation "Add to system PATH" ankreuzen!
    echo.
    pause
    exit /b 1
)

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

set count=0
set skipped=0

for %%f in (*.png *.PNG *.webp *.WEBP *.bmp *.BMP *.tiff *.TIFF) do (
    if exist "%%f" call :convert "%%f"
)

for %%f in (*.jpg *.JPG *.jpeg *.JPEG) do (
    if exist "%%f" call :optimize "%%f"
)

echo.
if %count% equ 0 if %skipped% equ 0 (
    echo   Keine Bilder gefunden.
) else (
    echo   %count% Bilder optimiert
    if %skipped% gtr 0 echo   %skipped% uebersprungen
    echo   Originale in: %cd%\%BACKUP_DIR%\
)

echo.
pause
exit /b 0


:convert
set "file=%~1"
set "name=%~n1"
set "newname=%name%.jpg"

if not exist "%BACKUP_DIR%\%file%" copy "%file%" "%BACKUP_DIR%\%file%" >nul

magick "%file%" -auto-orient -resize "%MAXWIDTH%x>" -quality %QUALITY% -strip "%newname%" 2>nul

if %errorlevel% equ 0 (
    echo   OK  %file% --^> %newname%
    if /i not "%file%"=="%newname%" del "%file%"
    set /a count+=1
) else (
    echo   FEHLER  %file%
    set /a skipped+=1
)
exit /b 0


:optimize
set "file=%~1"

if not exist "%BACKUP_DIR%\%file%" copy "%file%" "%BACKUP_DIR%\%file%" >nul

magick "%file%" -auto-orient -resize "%MAXWIDTH%x>" -quality %QUALITY% -strip "%file%" 2>nul

if %errorlevel% equ 0 (
    echo   OK  %file% optimiert
    set /a count+=1
) else (
    echo   FEHLER  %file%
    set /a skipped+=1
)
exit /b 0
