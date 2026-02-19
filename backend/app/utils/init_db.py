"""
Script para inicializar la base de datos con datos de prueba.
"""

try:
    import pyodbc
    HAS_PYODBC = True
except ImportError:
    HAS_PYODBC = False

def init_database():
    """Crear usuario dummy si no existe."""
    if not HAS_PYODBC:
        print("⚠️  pyodbc no disponible, omitiendo inicialización de BD")
        return
    
    try:
        # Conectar directamente a SQL Server
        conn = pyodbc.connect(
            'Driver={ODBC Driver 17 for SQL Server};'
            'Server=localhost;'
            'Database=DailyQuestions;'
            'Trusted_Connection=yes;'
        )
        cursor = conn.cursor()
        
        # Verificar si existe usuario con ID 1
        try:
            cursor.execute("SELECT COUNT(*) FROM [dbo].[user] WHERE id = 1;")
            count = cursor.fetchone()[0]
            
            if count == 0:
                print("📝 Usuario con ID 1 no existe. Intentando crear...")
                try:
                    cursor.execute("INSERT INTO [dbo].[user] (id) VALUES (1);")
                    conn.commit()
                    print("✅ Usuario dummy creado con ID 1")
                except pyodbc.IntegrityError as insert_err:
                    # Podría ser que exista pero con otro constraint
                    print(f"⚠️  No se pudo insertar usuario: {str(insert_err)[:100]}")
            else:
                print("✅ Usuario con ID 1 ya existe")
                
        except pyodbc.ProgrammingError:
            # Tabla [user] no existe o no se puede acceder
            print("⚠️  No se pudo verificar tabla [user]")
        
        conn.close()
        
    except pyodbc.OperationalError as e:
        print(f"⚠️  No se pudo conectar a SQL Server: {str(e)[:100]}")
    except Exception as e:
        print(f"⚠️  Error en inicialización de BD: {str(e)[:100]}")

if __name__ == "__main__":
    init_database()
