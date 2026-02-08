# Diagrama ER y Casos de Uso

Este documento contiene el modelo entidad–relación (ER) y los casos de uso principales del sistema EvaluaciónQA.

---

## 1. Diagrama ER (Entidad–Relación)

Este modelo representa la arquitectura de datos completa del sistema **EvaluaciónQA**, diseñada para ser auditable, escalable y versionada.

### Entidades y relaciones

#### USERS
* id (PK)
* nombre
* email
* password
* role_id (FK)

#### ROLES
* id (PK)
* nombre (Admin, QA Lead, QA, Analista, Asesor)

Relación:
* Un rol tiene muchos usuarios

#### BOLETAS
* id (PK)
* nombre
* pais
* cliente
* tipo_interaccion
* estado (borrador, publicada, inactiva)

#### BOLETA_VERSIONES
* id (PK)
* boleta_id (FK)
* version
* fecha_publicacion

Relación:
* Una boleta tiene muchas versiones

#### BOLETA_SECCIONES
* id (PK)
* boleta_version_id (FK)
* nombre
* orden

#### BOLETA_PREGUNTAS
* id (PK)
* seccion_id (FK)
* texto
* tipo
* peso
* fatal (boolean)
* obligatoria (boolean)

#### BOLETA_OPCIONES
* id (PK)
* pregunta_id (FK)
* texto
* valor

Relación:
* Una versión de boleta tiene secciones
* Una sección tiene preguntas
* Una pregunta puede tener opciones

#### EVALUACIONES
* id (PK)
* asesor_id (FK users)
* qa_id (FK users)
* boleta_version_id (FK)
* puntaje_final
* tiempo_total
* estado
* created_at

#### EVALUACION_RESPUESTAS
* id (PK)
* evaluacion_id (FK)
* pregunta_id (FK)
* respuesta
* puntaje

Relación:
* Una evaluación pertenece a una versión de boleta
* Una evaluación tiene muchas respuestas

#### FEEDBACK
* id (PK)
* evaluacion_id (FK)
* comentario_qa
* comentario_asesor
* confirmado
* fecha_confirmacion

#### AUDIOS
* id (PK)
* evaluacion_id (FK)
* ruta_audio
* duracion

Relación:
* Una evaluación puede tener feedback
* Una evaluación puede tener uno o más audios

---

## 2. Casos de Uso

### UC-01 Crear Boleta QA
**Actor:** QA Lead
**Descripción:** El QA Lead crea una nueva boleta, define secciones, preguntas, pesos y reglas.
**Resultado esperado:** Boleta creada en estado *Borrador*.

### UC-02 Publicar Boleta
**Actor:** QA Lead
**Descripción:** Publica la boleta, generando una versión fija no editable.
**Resultado esperado:** Boleta disponible para evaluaciones.

### UC-03 Evaluar Asesor
**Actor:** QA
**Descripción:** Evalúa una interacción usando una boleta publicada, registrando tiempo y evidencias.
**Resultado esperado:** Evaluación guardada y auditada.

### UC-04 Cargar Feedback
**Actor:** QA
**Descripción:** Registra feedback cualitativo y evidencia de la evaluación.
**Resultado esperado:** Feedback disponible para el asesor.

### UC-05 Confirmar Feedback
**Actor:** Asesor
**Descripción:** Confirma el feedback recibido y deja comentario de compromiso.
**Resultado esperado:** Feedback confirmado y cerrado.

### UC-06 Ver Métricas
**Actor:** Analista / Admin
**Descripción:** Consulta dashboards y reportes filtrados.
**Resultado esperado:** Visualización de KPIs y métricas.

---

Este documento puede ser consultado y actualizado para mantener la trazabilidad del modelo y los casos de uso del sistema.