#!/bin/bash
# Script para limpiar puertos 8080 y 8081

echo "🔍 Buscando procesos en puerto 8080 y 8081..."

# En Windows Git Bash, usar netstat de Windows
if command -v netstat &> /dev/null; then
    # Buscar procesos en puerto 8080
    PIDS_8080=$(netstat -ano 2>/dev/null | grep ":8080 " | awk '{print $5}' | cut -d: -f2)
    for PID in $PIDS_8080; do
        if [ ! -z "$PID" ]; then
            echo "🛑 Matando proceso PID $PID en puerto 8080..."
            taskkill /F /PID $PID > /dev/null 2>&1
        fi
    done
    
    # Buscar procesos en puerto 8081
    PIDS_8081=$(netstat -ano 2>/dev/null | grep ":8081 " | awk '{print $5}' | cut -d: -f2)
    for PID in $PIDS_8081; do
        if [ ! -z "$PID" ]; then
            echo "🛑 Matando proceso PID $PID en puerto 8081..."
            taskkill /F /PID $PID > /dev/null 2>&1
        fi
    done
    
    echo "✅ Puertos limpiados"
fi

echo ""
echo "🚀 Iniciando frontend en puerto 8080..."
echo ""

npm run dev
