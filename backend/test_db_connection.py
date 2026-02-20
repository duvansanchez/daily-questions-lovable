#!/usr/bin/env python
"""Script para probar la conexión a la base de datos."""
import sys
from pathlib import Path

# Agregar el directorio actual al path
sys.path.insert(0, str(Path(__file__).parent))

try:
    print("🔍 Probando conexión a la base de datos...")
    
    from app.db.database import SessionLocal, engine
    from app.models.goal import Goal
    
    print("✅ Importación de módulos exitosa")
    
    # Intentar conectar
    print("📡 Intentando conectar a la BD...")
    db = SessionLocal()
    
    # Contar objetivos
    goal_count = db.query(Goal).count()
    print(f"✅ Conexión exitosa!")
    print(f"📊 Total de objetivos en BD: {goal_count}")
    
    # Mostrar algunos objetivos
    if goal_count > 0:
        goals = db.query(Goal).limit(3).all()
        print(f"\n📋 Primeros 3 objetivos:")
        for goal in goals:
            print(f"  - ID {goal.id}: {goal.titulo}")
    else:
        print("⚠️ No hay objetivos en la base de datos")
    
    db.close()
    
except Exception as e:
    print(f"❌ Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
