# Contrato minimo de backend (FastAPI) para Daily Questions

Este documento define el contrato minimo de datos y endpoints para la nueva version del backend. Alcance confirmado:
- Objetivos y subobjetivos
- Frases (categorias y subcategorias)
- Preguntas diarias y respuestas
- Sin autenticacion por ahora
- Sin progreso/estadisticas por ahora

## Convenciones generales
- Base URL: /api
- JSON en requests/responses
- Fechas en ISO 8601 (YYYY-MM-DD) y timestamps en ISO 8601 con zona horaria
- IDs como UUID o string (consistente en todo el backend)

## Modelos (minimos)

### Goal
- id: string
- title: string
- description: string?
- category: "daily" | "weekly" | "monthly" | "yearly" | "general"
- priority: "high" | "medium" | "low"
- recurring: boolean
- day_part: "morning" | "afternoon" | "evening" | null
- estimated_hours: number?
- estimated_minutes: number?
- reward: string?
- is_parent: boolean
- parent_goal_id: string?
- start_date: string? (YYYY-MM-DD)
- end_date: string? (YYYY-MM-DD)
- scheduled_for: string? (YYYY-MM-DD)
- completed: boolean
- completed_at: string?
- focus_time_seconds: number?
- focus_notes: string?
- skipped: boolean
- created_at: string

### SubGoal
- id: string
- goal_id: string
- title: string
- completed: boolean
- completed_at: string?
- priority: "high" | "medium" | "low"?
- notes: string?
- focus_time_seconds: number?

### PhraseCategory
- id: string
- name: string
- description: string?
- active: boolean

### PhraseSubcategory
- id: string
- category_id: string
- name: string
- description: string?
- active: boolean

### Phrase
- id: string
- text: string
- author: string?
- category_id: string
- subcategory_id: string
- notes: string?
- active: boolean
- review_count: number
- last_reviewed_at: string?
- created_at: string

### Question
- id: string
- title: string
- description: string?
- type: "text" | "select" | "checkbox" | "radio"
- category: "personal" | "work" | "health" | "habits" | "goals" | "general"
- options: QuestionOption[]?
- required: boolean
- active: boolean
- order: number
- created_at: string
- updated_at: string?

### QuestionOption
- id: string
- question_id: string
- value: string
- label: string
- order: number

### DailyQuestionsSession
- id: string
- date: string (YYYY-MM-DD)
- responses: QuestionResponse[]
- completed_at: string?
- total_questions: number
- answered_questions: number

### QuestionResponse
- id: string
- session_id: string
- question_id: string
- response: string | string[]
- answered_at: string

## Endpoints

### Goals
- GET /api/goals
  - query: category?, completed?, scheduled_for?
- POST /api/goals
- GET /api/goals/{goal_id}
- PATCH /api/goals/{goal_id}
- DELETE /api/goals/{goal_id}

### SubGoals
- POST /api/goals/{goal_id}/subgoals
- PATCH /api/subgoals/{subgoal_id}
- DELETE /api/subgoals/{subgoal_id}

### Goal Focus (opcional, si quieres endpoint dedicado)
- PATCH /api/goals/{goal_id}/focus
  - body: focus_time_seconds, focus_notes
- PATCH /api/subgoals/{subgoal_id}/focus
  - body: focus_time_seconds, notes

### Phrase Categories
- GET /api/phrases/categories
- POST /api/phrases/categories
- PATCH /api/phrases/categories/{category_id}
- DELETE /api/phrases/categories/{category_id}

### Phrase Subcategories
- GET /api/phrases/subcategories?category_id=
- POST /api/phrases/subcategories
- PATCH /api/phrases/subcategories/{subcategory_id}
- DELETE /api/phrases/subcategories/{subcategory_id}

### Phrases
- GET /api/phrases
  - query: category_id?, subcategory_id?, active?
- POST /api/phrases
- PATCH /api/phrases/{phrase_id}
- DELETE /api/phrases/{phrase_id}
- POST /api/phrases/{phrase_id}/review
  - incrementa review_count y last_reviewed_at

### Questions
- GET /api/questions
  - query: category?, active?
- POST /api/questions
- GET /api/questions/{question_id}
- PATCH /api/questions/{question_id}
- DELETE /api/questions/{question_id}

### Daily Sessions
- GET /api/daily-sessions/{date}
  - devuelve el set de preguntas activas para el dia y estado actual
- POST /api/daily-sessions/{date}/responses
  - body: responses[]
  - actualiza/crea session y respuestas

## Notas de implementacion
- Priorizar CRUD basico y consistencia de datos.
- Orden de subobjetivos: no completados primero, completados al final.
- En preguntas diarias, respetar orden por campo order.
- Sin autenticacion por ahora, pero dejar el esquema preparado para user_id futuro.
