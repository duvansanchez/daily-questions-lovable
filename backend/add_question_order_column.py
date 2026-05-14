"""
Script para agregar la columna 'orden' a la tabla question.
Ejecutar una sola vez para actualizar el esquema de la base de datos.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.db.database import get_engine
from sqlalchemy import text


def add_question_order_column():
    engine = get_engine()
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'question'
            AND COLUMN_NAME = 'orden'
        """))
        column_exists = result.scalar()

        if not column_exists:
            print("Agregando columna 'orden' a la tabla 'question'...")
            conn.execute(text("""
                ALTER TABLE question
                ADD orden INT NOT NULL CONSTRAINT DF_question_orden DEFAULT 0
            """))
            conn.commit()
            print("Columna 'orden' agregada exitosamente.")
        else:
            print("La columna 'orden' ya existe en la tabla 'question'.")

        print("Inicializando orden actual por fecha de creación...")
        conn.execute(text("""
            WITH ordered_questions AS (
                SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS new_order
                FROM question
            )
            UPDATE q
            SET orden = ordered_questions.new_order
            FROM question q
            INNER JOIN ordered_questions ON ordered_questions.id = q.id
        """))
        conn.commit()
        print("Orden inicial actualizado.")


if __name__ == "__main__":
    print("Iniciando migracion: columna 'orden' en question...")
    try:
        add_question_order_column()
        print("Migracion completada.")
    except Exception as e:
        print(f"Error en la migracion: {e}")
        sys.exit(1)
