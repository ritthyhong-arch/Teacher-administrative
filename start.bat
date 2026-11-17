@echo off
title ប្រព័ន្ធត្រួតពិនិត្យរដ្ឋបាលគ្រូប្រចាំថ្ងៃ - សាលាបញ្ញាសាស្រ្តអន្តរជាតិ (PSIS)
cd /d "%~dp0"

echo ========================================================
echo   សាលាបញ្ញាសាស្រ្តអន្តរជាតិ (PSIS)
echo   ប្រព័ន្ធត្រួតពិនិត្យរដ្ឋបាលគ្រូប្រចាំថ្ងៃ
echo   Daily Teacher Administration Monitoring System
echo ========================================================
echo.
echo កំពុងបើកដំណើរការកម្មវិធី... (Starting web application...)
echo.

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python run_server.py
) else (
    echo Python មិនត្រូវបានរកឃើញទេ កំពុងបើកឯកសារ index.html តាម Browser...
    start "" index.html
)

pause
