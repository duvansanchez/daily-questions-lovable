@echo off
REM Script para limpiar puertos 8080 y 8081

echo 🔍 Buscando procesos en puerto 8080 y 8081...

REM Usar netstat para encontrar procesos
for /f "tokens=5" %%A in ('netstat -ano ^| find ":8080"') do (
    echo 🛑 Matando proceso PID %%A en puerto 8080...
    taskkill /F /PID %%A >nul 2>&1
)

for /f "tokens=5" %%A in ('netstat -ano ^| find ":8081"') do (
    echo 🛑 Matando proceso PID %%A en puerto 8081...
    taskkill /F /PID %%A >nul 2>&1
)

echo ✅ Puertos limpiados
echo.
echo 🚀 Iniciando frontend en puerto 8080...
call npm run dev
