"""
Script para crear la tabla 'phrase_feedback'.
Ejecutar una sola vez para actualizar el esquema de la base de datos.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.db.database import get_engine
from sqlalchemy import text


def add_phrase_feedback_table():
    engine = get_engine()
    with engine.connect() as conn:
        exists = conn.execute(text("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_NAME = 'phrase_feedback'
        """)).scalar()

        if exists:
            print("La tabla 'phrase_feedback' ya existe.")
            return

        print("Creando tabla 'phrase_feedback'...")
        conn.execute(text("""
            CREATE TABLE phrase_feedback (
                id INT IDENTITY(1,1) PRIMARY KEY,
                phrase_id INT NOT NULL,
                fecha NVARCHAR(10) NOT NULL,
                texto NVARCHAR(MAX) NOT NULL,
                fecha_creacion DATETIME NULL,
                fecha_actualizacion DATETIME NULL,
                CONSTRAINT FK_phrase_feedback_phrase FOREIGN KEY (phrase_id) REFERENCES frases(id),
                CONSTRAINT UQ_phrase_feedback_phrase_date UNIQUE (phrase_id, fecha)
            )
        """))
        conn.commit()
        print("Tabla 'phrase_feedback' creada exitosamente.")


if __name__ == "__main__":
    print("Iniciando migracion: tabla 'phrase_feedback'...")
    try:
      add_phrase_feedback_table()
      print("Migracion completada.")
    except Exception as e:
      print(f"Error en la migracion: {e}")
      sys.exit(1)
