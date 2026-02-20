#!/usr/bin/env python
"""Debug script para identificar dónde se cuelga al importar."""
import sys
import traceback
import time

def log(msg, level="INFO"):
    """Log con timestamp."""
    ts = time.strftime("%H:%M:%S")
    print(f"[{ts}] {level:8} {msg}", flush=True)

log("🔍 Iniciando debug startup")

try:
    log("📝 Importando sys...")
    import sys
    
    log("📝 Importando logging...")
    import logging
    logging.basicConfig(level=logging.DEBUG)
    
    log("📝 Importando FastAPI...")
    from fastapi import FastAPI
    
    log("📝 Importando CORS middleware...")
    from fastapi.middleware.cors import CORSMiddleware
    
    log("📝 Importando app.config...")
    from app.config import settings
    log(f"✅ DATABASE_URL: {settings.DATABASE_URL[:50]}...")
    
    log("📝 Importando app.db.database...")
    from app.db.database import get_db
    log("✅ database.py importado (sin crear engine aún)")
    
    log("📝 Importando app.api (esto va a crear los routers)...")
    from app.api import api_router
    log("✅ api_router importado exitosamente")
    
    log("📝 Creando aplicación FastAPI...")
    app = FastAPI(title="Test")
    
    log("📝 Agregando CORS...")
    app.add_middleware(CORSMiddleware, allow_origins=["*"])
    
    log("📝 Incluyendo router...")
    app.include_router(api_router)
    
    log("✅✅✅ ¡TODO IMPORTÓ CORRECTAMENTE! ✅✅✅")
    log("La app está lista para ejecutar")
    
except Exception as e:
    log(f"❌ ERROR: {type(e).__name__}: {e}", "ERROR")
    log("Traceback completo:", "ERROR")
    traceback.print_exc()
    sys.exit(1)
