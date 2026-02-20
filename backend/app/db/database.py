"""
Configuración de conexión a base de datos con SQLAlchemy.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings
from typing import Generator
import logging

logger = logging.getLogger(__name__)

# Base para los modelos ORM
Base = declarative_base()

# Lazy initialization de engine
_engine = None
_SessionLocal = None


def get_engine():
    """Obtener o crear el engine de SQLAlchemy de forma lazy."""
    global _engine
    if _engine is None:
        logger.info(f"🔌 Creando engine para: {settings.DATABASE_URL[:50]}...")
        _engine = create_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
            connect_args={
                "check_same_thread": False
            } if "sqlite" in settings.DATABASE_URL else {},
            pool_pre_ping=True,  # Verificar conexión antes de usar
            pool_recycle=3600,   # Reciclar conexiones cada hora
        )
        logger.info("✅ Engine creado exitosamente")
    return _engine


def get_session_factory():
    """Obtener la factory de sesiones."""
    global _SessionLocal
    if _SessionLocal is None:
        logger.info("📦 Creando SessionLocal factory...")
        _SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=get_engine()
        )
        logger.info("✅ SessionLocal factory creada")
    return _SessionLocal


# Para compatibilidad con código existente
engine = None  # Placeholder
SessionLocal = None  # Placeholder


def get_db() -> Generator:
    """
    Dependencia para inyectar sesión de BD en los endpoints.
    Se inicializa lazily la primera vez que se usa.
    """
    try:
        session_factory = get_session_factory()
        db = session_factory()
        yield db
    except Exception as e:
        logger.error(f"❌ Error al obtener sesión de BD: {e}")
        raise
    finally:
        try:
            db.close()
        except:
            pass


def init_db():
    """
    Crea todas las tablas definidas en los modelos.
    """
    Base.metadata.create_all(bind=engine)
