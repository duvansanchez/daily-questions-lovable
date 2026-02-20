"""
Script para agregar la columna 'icono' a la tabla objetivos.
Ejecutar una sola vez para actualizar el esquema de la base de datos.
"""

import pyodbc
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def add_icono_column():
    """Agregar columna icono a la tabla objetivos."""
    
    # Configuración de la conexión desde variables de entorno
    connection_string = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={os.getenv('DB_SERVER')};"
        f"DATABASE={os.getenv('DB_NAME')};"
        f"UID={os.getenv('DB_USER')};"
        f"PWD={os.getenv('DB_PASSWORD')};"
    )
    
    try:
        # Conectar a la base de datos
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()
        
        print("✅ Conexión exitosa a la base de datos")
        
        # Verificar si la columna ya existe
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'objetivos' 
            AND COLUMN_NAME = 'icono'
        """)
        
        column_exists = cursor.fetchone()[0]
        
        if column_exists:
            print("⚠️  La columna 'icono' ya existe en la tabla 'objetivos'")
        else:
            # Agregar la columna icono
            print("📝 Agregando columna 'icono' a la tabla 'objetivos'...")
            cursor.execute("""
                ALTER TABLE objetivos
                ADD icono NVARCHAR(10) NULL
            """)
            conn.commit()
            print("✅ Columna 'icono' agregada exitosamente")
        
        # Verificar la estructura actualizada
        cursor.execute("""
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'objetivos' 
            AND COLUMN_NAME IN ('titulo', 'icono', 'descripcion')
            ORDER BY ORDINAL_POSITION
        """)
        
        print("\n📋 Columnas relacionadas en la tabla 'objetivos':")
        for row in cursor.fetchall():
            print(f"  - {row.COLUMN_NAME}: {row.DATA_TYPE}({row.CHARACTER_MAXIMUM_LENGTH or 'MAX'}) {'NULL' if row.IS_NULLABLE == 'YES' else 'NOT NULL'}")
        
        cursor.close()
        conn.close()
        print("\n✅ Script completado exitosamente")
        
    except pyodbc.Error as e:
        print(f"❌ Error de base de datos: {e}")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Iniciando script de migración...")
    add_icono_column()
