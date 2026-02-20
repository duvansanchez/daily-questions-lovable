"""
Punto de entrada de la aplicación FastAPI.
"""
import sys
import logging

# Configurar logging antes de cualquier importación
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

print("🔍 [1] Iniciando importaciones...", flush=True)

try:
    from fastapi import FastAPI
    print("✅ FastAPI importado", flush=True)
    
    from fastapi.middleware.cors import CORSMiddleware
    print("✅ CORS middleware importado", flush=True)
    
    from app.config import settings
    print("✅ Config importada", flush=True)
    
    from app.api import api_router
    print("✅ API router importado", flush=True)
    
except Exception as e:
    print(f"❌ Error en importaciones: {e}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("🔍 [2] Creando aplicación FastAPI...", flush=True)

# Crear aplicación
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="API para Daily Questions - Gestión de objetivos, frases y preguntas diarias"
)

print("🔍 [3] Configurando CORS...", flush=True)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🔍 [4] Incluyendo routers...", flush=True)

# Incluir rutas
app.include_router(api_router)

print("🔍 [5] Registrando endpoints de salud...", flush=True)

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "daily-questions-api"}


@app.get("/docs-redirect")
def docs_redirect():
    """Redirección a documentación OpenAPI."""
    return {"docs": "/docs", "redoc": "/redoc"}


print("✅ ¡Aplicación FastAPI configurada exitosamente!", flush=True)


if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*60, flush=True)
    print("🚀 INICIANDO SERVIDOR FASTAPI", flush=True)
    print("="*60, flush=True)
    print(f"📍 URL: http://0.0.0.0:3001", flush=True)
    print(f"📚 Documentación: http://localhost:3001/docs", flush=True)
    print("="*60 + "\n", flush=True)
    
    try:
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=3001,
            reload=settings.DEBUG,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n⛔ Servidor detenido por el usuario", flush=True)
    except Exception as e:
        print(f"❌ Error al ejecutar servidor: {e}", flush=True)
        import traceback
        traceback.print_exc()
        sys.exit(1)
