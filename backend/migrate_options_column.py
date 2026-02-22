"""
Migración: Ampliar columna options en tabla question a VARCHAR(MAX).
Ejecutar una sola vez desde la carpeta backend/:
    python migrate_options_column.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.db.database import get_engine
from sqlalchemy import text

def run():
    engine = get_engine()
    with engine.connect() as conn:
        # Verificar tipo actual
        result = conn.execute(text("""
            SELECT DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'question' AND COLUMN_NAME = 'options'
        """)).fetchone()

        if result:
            print(f"Tipo actual: {result[0]}({result[1]})")
        else:
            print("Columna 'options' no encontrada.")
            return

        # Alterar columna
        conn.execute(text("ALTER TABLE question ALTER COLUMN options VARCHAR(MAX)"))
        conn.commit()
        print("✅ Columna 'options' ampliada a VARCHAR(MAX) exitosamente.")

        # Verificar cambio
        result = conn.execute(text("""
            SELECT DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'question' AND COLUMN_NAME = 'options'
        """)).fetchone()
        print(f"Tipo nuevo: {result[0]}({result[1]})")

if __name__ == "__main__":
    run()
