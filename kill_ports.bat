@echo off
REM Mata TODOS los procesos node y limpia los puertos

echo.
echo ====================================
echo 🛑 MATANDO TODOS LOS PROCESOS NODE
echo ====================================
echo.

taskkill /F /IM node.exe 2>nul

echo 🛑 Esperando 2 segundos...
timeout /t 2 /nobreak

echo ✅ Limpieza completada

echo.
echo Verifica que los puertos estén libres:
netstat -ano | findstr "8080\|8081\|3001" || echo "Todos los puertos limpios"

pause
