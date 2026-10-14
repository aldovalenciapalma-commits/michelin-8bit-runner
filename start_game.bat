@echo off
title Michelin 8-Bit Runner - Bibendum Highway Dash
echo ============================================================
echo      MICHELIN 8-BIT RUNNER - BIBENDUM HIGHWAY DASH
echo ============================================================
echo.
echo Iniciando servidor local en http://localhost:8080 ...
echo Abriendo juego en tu navegador predeterminado...
echo.
start "" "http://localhost:8080"
python -m http.server 8080
pause

