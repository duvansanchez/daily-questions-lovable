"""
Script para inicializar la base de datos con datos de prueba.
"""

import pyodbc
from app.config import settings

def init_database():
    """Crear usuario dummy si no existe."""
    try:
        # Extraer connection string de settings
        db_url = settings.DATABASE_URL
        
        if "mssql" in db_url or "Driver=" in db_url:
            # SQL Server
            try:
                conn = pyodbc.connect(
                    'Driver={ODBC Driver 17 for SQL Server};'
                    'Server=localhost;'
                    'Database=DailyQuestions;'
                    'Trusted_Connection=yes;'
                )
                cursor = conn.cursor()
                
                # Verificar si existe usuario con ID 1
                cursor.execute("SELECT COUNT(*) FROM [user] WHERE id = 1;")
                count = cursor.fetchone()[0]
                
                if count == 0:
                    print("Creando usuario dummy con ID 1...")
                    try:
                        # Intentar insertar solo el ID
                        cursor.execute("INSERT INTO [user] (id) VALUES (1);")
                        conn.commit()
                        print("✅ Usuario dummy creado")
                    except Exception as insert_err:
                        print(f"⚠️  Aún no se pudo crear usuario: {insert_err}")
                        print("\n   Para resolver esto manualmente, ejecuta en SQL Server:")
                        print('   INSERT INTO [user] (id) VALUES (1);')
                
                conn.close()
            except Exception as sql_err:
                print(f"⚠️  No se pudo conectar a SQL Server: {sql_err}")
                print("   Asegúrate de que SQL Server esté disponible")
        else:
            print("Base de datos no es MSSQL, omitiendo inicialización")
            
    except Exception as e:
        print(f"Error en inicialización: {e}")

if __name__ == "__main__":
    init_database()
