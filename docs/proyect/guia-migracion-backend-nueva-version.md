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
- Si la BD actual usa IDs int, mantenerlos para no romper datos.
- No mezclar int y UUID sin plan de migracion.

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

## Mapa BD actual -> modelos nuevos (pendiente de completar con el esquema real)
Este bloque debe completarse cuando la IA tenga acceso al esquema real de SQL Server.
- Tabla legacy: question -> Modelo nuevo: Question
- Tabla legacy: response -> Modelo nuevo: QuestionResponse
- Tabla legacy: user (si existe) -> Ignorar por ahora (sin auth)
- Tablas nuevas sugeridas (si no existen): goals, subgoals, phrases, phrase_categories, phrase_subcategories, daily_sessions

Regla: si una tabla ya existe, mapear a ese nombre y columnas existentes. No crear duplicados.

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
