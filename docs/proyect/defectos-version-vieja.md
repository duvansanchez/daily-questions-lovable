# Defectos y limitaciones de la version vieja (para no repetir)

Este documento resume problemas detectados en el repositorio viejo (daily-questions-app) y diferencias con el frontend actual. Sirve para evitar repetirlos en la nueva version.

## Arquitectura y organizacion
- Monolito en un solo archivo grande (daily_questions_app/app.py) con rutas, modelos y acceso a DB mezclados.
- SSR con Jinja2 y templates acoplados al backend, no orientado a SPA.
- Endpoints mezclan HTML y JSON segun el tipo de request (AJAX vs navegador), lo cual complica el consumo desde React.
- No hay separacion clara de capas (dominio, datos, servicios, API).

## Configuracion y despliegue
- Secret key generado con os.urandom en cada arranque, invalida sesiones al reiniciar.
- Sesiones en filesystem (flask_session) no son escalables ni robustas para despliegue moderno.
- Conexion a DB hardcodeada (localhost, DailyQuestions), sin configuracion centralizada.
- Modo debug activo en el arranque (app.run debug=True).
- Logging reducido a ERROR y uso de print para diagnostico (sin observabilidad real).

## Base de datos y datos
- Uso de SQL inline en rutas y modelos, sin abstraccion ni repositorios.
- No hay migraciones formales; se usan scripts sueltos (update_database, add_categoria_column, etc).
- Opciones de preguntas se guardan como string y luego se parsean con reglas inconsistentes.
- Uso de eval sobre strings de opciones (riesgo de seguridad y fallos).
- Manejo de categorias con defaults en codigo ("Sin Categoria", "General") sin consistencia.

## Validaciones y seguridad
- Validaciones parciales y dispersas; muchas rutas aceptan datos sin esquema.
- Mezcla de estados de formulario y JSON, sin contratos claros.
- Dependencia fuerte de sesiones server-side; no apto para frontend SPA.
- Sin CORS ni politica de API clara para clientes externos.

## Rendimiento y mantenibilidad
- Sin paginacion ni filtros en queries grandes.
- Conexiones a DB por request sin pooling claro.
- Bloques try/except muy amplios con logica de recuperacion improvisada.
- Codebase dificil de testear (no hay tests automatizados).

## Diferencias con el frontend actual (nuevo)
- El frontend nuevo ya esta construido como SPA React con shadcn-ui y necesita API limpia.
- Nuevos modulos: objetivos/subobjetivos, frases, preguntas diarias (enfocados a productividad).
- La nueva version debe ser API-first y desacoplada del render HTML.

## Consecuencia para la migracion
La nueva version debe evitar:
- Monolito en un solo archivo
- SSR y templates
- SQL inline sin capas
- Opciones almacenadas como strings sin estructura
- Session auth como base del sistema
- Configuracion hardcodeada
- Ausencia de tests

Y debe garantizar:
- API clara y consistente para React
- Capas separadas (modelos, servicios, API)
- Esquemas de validacion (Pydantic)
- Migrations controladas
- Datos estructurados (listas, JSON)
