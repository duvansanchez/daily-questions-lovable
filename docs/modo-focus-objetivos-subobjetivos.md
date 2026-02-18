# Modo Focus de Objetivos y Subobjetivos (rama `rediseños-de-front`)

## Contexto
Este documento resume cómo está implementado el **Modo Focus** en el repositorio remoto:
- Repositorio: `duvansanchez/daily-questions-app`
- Rama analizada: `rediseños-de-front`

La funcionalidad está orientada a trabajar un objetivo principal y sus subobjetivos con seguimiento de tiempo y notas.

---

## Archivos clave encontrados en el repo remoto

### Frontend
- `daily_questions_app/templates/objetivos.html`
  - Integración del modal de focus del objetivo.
  - Render y acciones de subobjetivos dentro del focus.
- `daily_questions_app/static/js/focus-subobjetivos.js`
  - Lógica principal del **modo focus de subobjetivos** (timer, notas, completar, guardado periódico).
- `daily_questions_app/static/js/focus-subobjetivos-patch.js`
  - Ajustes de UX y comportamiento adicional (reordenamiento/acciones avanzadas).
- `daily_questions_app/static/js/focus-subobjetivos-simple.js`
  - Versión simplificada para pruebas/aislamiento del flujo focus.

### Pruebas / validación
- `daily_questions_app/templates/test_focus.html`
  - Página de test para validar PATCH de `tiempo_focus` y lectura de subobjetivos.

### Resumen técnico del propio repo
- `COMPLETED_SUBOBJETIVOS_IMPLEMENTATION.md`
  - Explica decisiones de ordenamiento, recarga y consistencia para subobjetivos.

---

## Flujo funcional del Modo Focus

## 1) Apertura de focus en subobjetivo
Desde la UI de objetivos (`objetivos.html`) se dispara `abrirModoFocusSubobjetivo(...)` (definida en `focus-subobjetivos.js`), que:
1. Verifica que exista un objetivo en focus.
2. Consulta subobjetivos del objetivo actual.
3. Selecciona el subobjetivo objetivo por ID.
4. Carga en el modal:
   - Título del subobjetivo
   - Objetivo padre
   - Tiempo acumulado (`tiempo_focus`)
   - Notas existentes

## 2) Trabajo en focus (timer + notas)
En `focus-subobjetivos.js` se implementa:
- Timer de subobjetivo con estados:
  - iniciar
  - pausar
  - resetear
- Persistencia periódica:
  - guardado de tiempo y notas cada 30 segundos
- Auto-guardado de notas mientras se escribe
- Editor enriquecido para notas (formato, preview, checklist, resaltados)

## 3) Completar subobjetivo desde focus
Al marcar “completar” en el modal de focus:
- Se envía `PATCH` del subobjetivo incluyendo:
  - `completado: true`
  - `tiempo_focus` final
  - `notas`
- Se cierra modal de subobjetivo.
- Se recarga lista de subobjetivos del objetivo en focus.

## 4) Cierre del modal de focus
Al cerrar el modal:
- Se pausa timer si está corriendo.
- Se intenta guardar estado final (tiempo + notas).
- Se limpia estado local del subobjetivo en focus.

---

## Persistencia (solo frontend por ahora)
No existe backend ni DB aún. Toda la persistencia debe implementarse en estado local 
(React state, Context, o similar según la arquitectura actual del proyecto). 
Los endpoints son referencia futura — no implementar llamadas HTTP en esta etapa.

## Reglas de ordenamiento de subobjetivos (observadas)

Con base en `COMPLETED_SUBOBJETIVOS_IMPLEMENTATION.md` y la integración frontend:
- Los subobjetivos **completados** se mantienen al final.
- Los no completados aparecen arriba.
- Al cambiar estado (pendiente/completado), se refresca la lista para reflejar orden consistente.

---

## Aspectos UX relevantes del Modo Focus

- Apertura directa de focus por subobjetivo desde acciones contextuales.
- Guardado robusto (manual, automático por typing y periódico por intervalo).
- Integración de checklist y edición rápida de subobjetivos dentro del contexto focus.
- Re-render después de cambios para evitar desincronización visual.

---

## Conclusión
En la rama `rediseños-de-front`, el **Modo Focus sí existe** y está implementado con una estructura clara:
- UI en `objetivos.html`
- Lógica específica en `focus-subobjetivos.js`
- Soporte de consistencia/UX en `focus-subobjetivos-patch.js`
- Endpoints REST para CRUD y seguimiento de `tiempo_focus`.

El módulo está pensado para sesiones de concentración por subobjetivo, con persistencia de progreso y notas en tiempo real.

---

## Guía para IA: implementar Modo Focus en la nueva versión (sin copiar arquitectura vieja)

Esta sección define **comportamiento funcional** para que una IA implemente el modo focus en la nueva versión de Daily Question sin depender de nombres de archivos, funciones ni estructura del proyecto legado.

## Objetivo funcional (qué debe lograr)
Implementar una experiencia de foco por subobjetivo donde el usuario pueda:
1. Entrar a una sesión de focus desde un subobjetivo.
2. Ver contexto (subobjetivo actual + objetivo padre).
3. Medir tiempo de trabajo (iniciar/pausar/reiniciar).
4. Registrar notas durante la sesión.
5. Marcar subobjetivo como completado con su tiempo final y notas.
6. Reanudar progreso previo (tiempo y notas) si vuelve a entrar.

## Reglas de comportamiento (independientes del código)

### Sesión de focus
- Debe existir un estado de sesión activa por subobjetivo.
- Si ya hay tiempo acumulado previo, el contador debe iniciar desde ese valor.
- Cerrar la vista de focus **no debe perder** tiempo ni notas ya capturadas.

### Timer
- Estados mínimos: `idle`, `running`, `paused`.
- Acciones mínimas: iniciar, pausar, reiniciar.
- Al pausar o cerrar, se debe persistir el tiempo actual.
- Debe existir guardado periódico mientras corre (ej. cada 20–30s) para reducir pérdida por cierre inesperado.

### Notas
- Deben poder editarse en la sesión de focus.
- Deben guardarse automáticamente mientras el usuario escribe (con debounce razonable).
- Debe existir guardado manual opcional (botón guardar).

### Completar subobjetivo
- Al completar, se persisten al menos: `completado`, `tiempo_focus_final`, `notas_finales`.
- Luego de completar, la lista de subobjetivos debe refrescarse para mostrar estado real.

### Orden de subobjetivos
- Regla UX requerida: no completados arriba, completados abajo.
- Esta regla debe mantenerse tras:
  - completar/descompletar
  - recargar vista
  - guardar cambios de orden manual

## Contrato mínimo de datos (modelo conceptual)
La IA puede mapear estos campos al modelo real de la nueva versión:
- `Subobjetivo.id`
- `Subobjetivo.titulo`
- `Subobjetivo.completado`
- `Subobjetivo.tiempoFocusSegundos`
- `Subobjetivo.notas`
- `Subobjetivo.objetivoPadreId`

No es obligatorio usar estos nombres literales; lo importante es conservar la semántica.

## Criterios de aceptación (Definition of Done)
1. Entrar a focus carga tiempo y notas previas del subobjetivo.
2. Iniciar timer aumenta segundos visibles en tiempo real.
3. Pausar timer persiste progreso y permite reanudar.
4. Cerrar/reabrir focus mantiene tiempo y notas.
5. Completar subobjetivo persiste datos finales y actualiza la lista.
6. Subobjetivos completados quedan al final tras cualquier actualización.
7. Si falla persistencia, se informa error sin romper la sesión local.

## Casos borde que la IA debe contemplar
- Apertura de focus sin subobjetivo válido.
- Fallos de red durante guardado periódico.
- Doble clic repetido en botones de timer/completar.
- Cierre inesperado de modal/vista.
- Conflictos de escritura si hay múltiples guardados casi simultáneos.

## Lo que la IA NO debe asumir
- No asumir rutas, endpoints o nombres del backend legacy.
- No asumir modales Bootstrap ni estructura HTML antigua.
- No copiar JS legado tal cual.
- No acoplar la implementación nueva a variables globales del proyecto viejo.

## Estrategia recomendada para IA (alto nivel)
1. Definir estados y eventos del modo focus (máquina de estados simple).
2. Separar lógica de dominio (timer/sesión/persistencia) de la vista UI.
3. Implementar persistencia resiliente (optimista + reintentos suaves).
4. Añadir pruebas funcionales sobre flujos críticos (iniciar, pausar, cerrar, completar).
5. Validar criterios de aceptación antes de dar por terminada la tarea.

## Prompt sugerido para otra IA (copiar/pegar)
"Implementa en la nueva versión de Daily Question un modo focus para subobjetivos basado en esta especificación funcional. No reutilices ni copies la arquitectura del proyecto legacy; usa la arquitectura actual del proyecto. Debes incluir: sesión de focus por subobjetivo, timer con iniciar/pausar/reiniciar, guardado periódico de tiempo, notas con auto-guardado, completar subobjetivo con persistencia de tiempo+notas, refresco de lista y regla de orden no completados arriba/completados abajo. Entrega también pruebas o checks que validen los criterios de aceptación." 