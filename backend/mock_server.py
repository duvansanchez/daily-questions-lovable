#!/usr/bin/env python
"""Servidor FastAPI funcional sin depender de SQL Server."""
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime

app = FastAPI(title="Daily Questions API - Modo Funcional")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Datos en memoria (se reinician al reiniciar servidor)
mock_goals = []
mock_subgoals = []
next_goal_id = 1
next_subgoal_id = 1

@app.get("/health")
def health():
    return {"status": "ok", "mode": "in-memory"}

@app.get("/api/goals")
def get_goals(page: int = Query(1), page_size: int = Query(100)):
    total = len(mock_goals)
    start = (page - 1) * page_size
    end = start + page_size
    
    return {
        "data": mock_goals[start:end],
        "total": total,
        "page": page,
        "pages": (total + page_size - 1) // page_size if total > 0 else 0,
        "page_size": page_size
    }

@app.post("/api/goals")
def create_goal(goal_data: dict):
    global next_goal_id
    
    new_goal = {
        "id": next_goal_id,
        "titulo": goal_data.get("titulo", ""),
        "descripcion": goal_data.get("descripcion"),
        "categoria": goal_data.get("categoria", "general"),
        "prioridad": goal_data.get("prioridad", "medium"),
        "completado": False,
        "recurrente": goal_data.get("recurrente", False),
        "fecha_creacion": datetime.now().isoformat(),
        "fecha_completado": None,
        "user_id": 1,
        "objetivo_padre_id": None,
        "es_padre": False
    }
    
    mock_goals.append(new_goal)
    next_goal_id += 1
    
    print(f"✅ Objetivo creado: {new_goal['id']}", flush=True)
    return new_goal

@app.get("/api/goals/{goal_id}/subgoals")
def get_subgoals(goal_id: int):
    subgoals = [sg for sg in mock_subgoals if sg["objetivo_padre_id"] == goal_id]
    return {"data": subgoals}

@app.patch("/api/goals/{goal_id}")
def update_goal(goal_id: int, data: dict):
    print(f"📝 PATCH /api/goals/{goal_id} - {data}", flush=True)
    
    for goal in mock_goals:
        if goal["id"] == goal_id:
            if "completado" in data:
                goal["completado"] = data["completado"]
                goal["fecha_completado"] = datetime.now().isoformat() if data["completado"] else None
            
            print(f"✅ Objetivo {goal_id} actualizado", flush=True)
            return goal
    
    return {"error": "Not found"}

@app.delete("/api/goals/{goal_id}")
def delete_goal(goal_id: int):
    global mock_goals, mock_subgoals
    mock_goals = [g for g in mock_goals if g["id"] != goal_id]
    mock_subgoals = [sg for sg in mock_subgoals if sg["objetivo_padre_id"] != goal_id]
    print(f"🗑️  Objetivo {goal_id} eliminado", flush=True)
    return {"message": "Deleted"}

@app.patch("/api/subgoals/{subgoal_id}")
def update_subgoal(subgoal_id: int, data: dict):
    for subgoal in mock_subgoals:
        if subgoal["id"] == subgoal_id:
            if "completado" in data:
                subgoal["completado"] = data["completado"]
            if "orden" in data:
                subgoal["orden"] = data["orden"]
            
            print(f"✅ Subobjetivo {subgoal_id} actualizado", flush=True)
            return subgoal
    
    return {"error": "Not found"}

@app.post("/api/goals/{goal_id}/subgoals")
def create_subgoal(goal_id: int, data: dict):
    global next_subgoal_id
    
    new_subgoal = {
        "id": next_subgoal_id,
        "titulo": data.get("titulo", ""),
        "completado": False,
        "orden": data.get("orden", 0),
        "objetivo_padre_id": goal_id
    }
    
    mock_subgoals.append(new_subgoal)
    next_subgoal_id += 1
    
    print(f"✅ Subobjetivo creado: {new_subgoal['id']}", flush=True)
    return new_subgoal

@app.delete("/api/subgoals/{subgoal_id}")
def delete_subgoal(subgoal_id: int):
    global mock_subgoals
    mock_subgoals = [sg for sg in mock_subgoals if sg["id"] != subgoal_id]
    print(f"🗑️  Subobjetivo {subgoal_id} eliminado", flush=True)
    return {"message": "Deleted"}

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 SERVIDOR EN PUERTO 3001 (Modo In-Memory)")
    print("="*60)
    print("⚠️  Los cambios se guardan en memoria (no persisten al reiniciar)")
    print("✅ Totalmente funcional para testing")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=3001, log_level="info")
