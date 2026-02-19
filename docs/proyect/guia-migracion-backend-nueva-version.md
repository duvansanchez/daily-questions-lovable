# Guia de migracion para la nueva version (brief para IA)

Este documento resume TODO lo acordado para reconstruir la app de Daily Questions con enfoque en organizacion y rendimiento.

## Objetivo general
Reconstruir la aplicacion desde cero, usando la base de datos actual como fuente de verdad, pero con una arquitectura moderna y limpia. Evitar cargar funcionalidades innecesarias del legacy.

Nota clave: el frontend ya construido es el de la nueva version (no el legacy). La migracion debe respetar ese alcance y no inventar features adicionales.

## Alcance funcional (modulos que SI van)
- Objetivos y subobjetivos
- Modo focus de objetivos y subobjetivos (timer + notas)
- Frases inspiracionales (categorias y subcategorias)
- Preguntas diarias + respuestas

## Alcance funcional (NO va por ahora)
- Audios
- Autenticacion y roles
- Estadisticas avanzadas / progreso

## Backend recomendado
- Lenguaje: Python
- Framework: FastAPI
- Motivo: API moderna, rapida y compatible con SPA React

## Base de datos (requisito clave)
- Motor: SQL Server (la base actual)
- La base existente es la fuente de verdad
- No crear una nueva base
- Se permiten cambios SOLO si son estrictamente necesarios
  - Preferir agregar tablas o columnas nuevas
  - No borrar datos ni romper compatibilidad
- La IA tendra acceso a credenciales y debe consultar el esquema real antes de proponer cambios

## Reglas funcionales importantes

### Objetivos y subobjetivos
- Mantener jerarquia objetivo -> subobjetivo
- Orden: no completados arriba, completados abajo
- Subobjetivos deben soportar prioridad, notas y tiempo de focus

### Modo focus
- Timer con estados: idle, running, paused
- Guardado periodico del tiempo
- Notas con autosave
- En subobjetivos: al cerrar, debe persistir tiempo y notas

### Preguntas diarias
- Tipos: text, select, checkbox, radio
- Preguntas con opciones configurables
- Campo required y active
- Respetar orden por campo order
- Guardar respuestas por fecha

### Frases
- Categorias y subcategorias activas/inactivas
- Al hacer review: incrementar review_count y last_reviewed_at

## No funcional (organizacion y rendimiento)
- API simple y rapida (sin logica innecesaria)
- Endpoints claros y consistentes
- Filtrado en endpoints para listas grandes
- Documentacion OpenAPI activa

## IDs y compatibilidad
- **Estrategia de ID**: Integer autoincrement generado por SQL Server
- No generar UUIDs en la aplicación (evita desincronización con BD)
- No mezclar int y UUID; mantener consistencia Integer en todas las relaciones
- Las relaciones usan Integer FK directo a las columnas PK existentes
- Excepción: `daily_sessions` usa VARCHAR(36) como PK (identificador de sesión)

## Paginacion y filtrado desde el inicio
- Para listas: preguntas, frases, objetivos; evitar cargas pesadas.
- Proveer parametros de paginacion en endpoints principales.

## Seed minimo
- Solo crear data si falta.
- No sobreescribir datos reales existentes.

## Principios de migracion
- No copiar arquitectura legacy
- Solo portar logica necesaria
- Respetar datos existentes
- Evitar features adicionales fuera del alcance

## Contrato base de datos y endpoints
Ver archivo: backend-contrato-fastapi.md

## Mapa BD actual -> modelos nuevos (esquema SQL Server CONFIRMADO)
Tablas existentes - mapeo directo a ORM:
- Tabla BD: **objetivos** (Integer PK autoincrement) -> Modelo: `Goal`
- Tabla BD: **categorias** (Integer PK autoincrement) -> Modelo: `PhraseCategory`
- Tabla BD: **frases** (Integer PK autoincrement) -> Modelo: `Phrase`
- Tabla BD: **subcategorias** (Integer PK autoincrement) -> Modelo: `PhraseSubcategory`
- Tabla BD: **question** (Integer PK autoincrement) -> Modelo: `Question`
- Tabla BD: **response** (Integer PK autoincrement) -> Modelo: `QuestionResponse`
- Tabla BD: **question_option** (Integer PK autoincrement) -> Modelo: `QuestionOption`
- Tabla BD: **daily_sessions** (VARCHAR(36) PK) -> Modelo: `DailyQuestionsSession`

**Regla crítica**: Todos los IDs son Integer autoincrement generados por SQL Server. NO generar UUIDs en la aplicación. Las relaciones usan Integer foreign keys directos.

## Campos obligatorios y defaults
Cuando el esquema legacy no tenga un campo necesario:
- Usar valores por defecto en el backend (no romper datos existentes)
- Preferir defaults en DB solo si es estrictamente necesario

Ejemplos:
- Question.required -> default false
- Question.active -> default true
- Question.order -> default 0 o incremental
- Phrase.review_count -> default 0
- Phrase.active -> default true
- Goal.completed -> default false
- SubGoal.completed -> default false

## Generación de IDs en la aplicación
**Patrón correcto** (sin uuid4):
```python
# ✅ CORRECTO - dejar que BD genere el ID
db_goal = Goal(
    title="Mi objetivo",
    description="Descripción",
    completed=False
)
db.add(db_goal)
db.commit()
# El ID se asigna automáticamente por SQL Server autoincrement
```

**Patrón incorrecto** (NO usar):
```python
# ❌ INCORRECTO - no generar UUIDs en la app
db_goal = Goal(
    id=str(uuid4()),  # Nunca hacer esto
    title="Mi objetivo"
)
```

## Flujos criticos de prueba (minimos)
1) Crear objetivo con subobjetivos
  - POST /api/goals
  - POST /api/goals/{goal_id}/subgoals
  - GET /api/goals

2) Sesion diaria de preguntas
  - GET /api/daily-sessions/{date}
  - POST /api/daily-sessions/{date}/responses
  - Reconsultar la sesion y verificar conteos

3) Review de frase
  - POST /api/phrases/{phrase_id}/review
  - Verificar review_count y last_reviewed_at

## Resultado esperado
- Backend minimal, organizado y rapido
- Frontend React consumiendo endpoints simples
- Datos existentes respetados y reutilizados
