#!/usr/bin/env python
"""Script para iniciar el servidor FastAPI."""
import uvicorn
import sys
import os
from pathlib import Path

# Agregar el directorio actual al path
sys.path.insert(0, str(Path(__file__).parent))

if __name__ == "__main__":
    print("🚀 Iniciando servidor en puerto 3001...")
    print("📍 URL: http://localhost:3001")
    print("📚 Docs: http://localhost:3001/docs")
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=3001,
            reload=True,
            access_log=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n⛔ Servidor detenido")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
