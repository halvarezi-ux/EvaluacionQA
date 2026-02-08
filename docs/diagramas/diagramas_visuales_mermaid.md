# Diagrama ER Visual (Mermaid)

```mermaid
erDiagram
  USERS ||--o{ ROLES : "role_id"
  BOLETAS ||--o{ BOLETA_VERSIONES : "boleta_id"
  BOLETA_VERSIONES ||--o{ BOLETA_SECCIONES : "boleta_version_id"
  BOLETA_SECCIONES ||--o{ BOLETA_PREGUNTAS : "seccion_id"
  BOLETA_PREGUNTAS ||--o{ BOLETA_OPCIONES : "pregunta_id"
  BOLETA_VERSIONES ||--o{ EVALUACIONES : "boleta_version_id"
  USERS ||--o{ EVALUACIONES : "asesor_id"
  USERS ||--o{ EVALUACIONES : "qa_id"
  EVALUACIONES ||--o{ EVALUACION_RESPUESTAS : "evaluacion_id"
  BOLETA_PREGUNTAS ||--o{ EVALUACION_RESPUESTAS : "pregunta_id"
  EVALUACIONES ||--o{ FEEDBACK : "evaluacion_id"
  EVALUACIONES ||--o{ AUDIOS : "evaluacion_id"
```

# Diagrama de Casos de Uso

```mermaid
flowchart TD
  QA_Lead((QA Lead))
  QA((QA))
  Asesor((Asesor))
  Analista((Analista))
  Admin((Admin))

  QA_Lead -->|Crea| Boleta[Boleta QA]
  QA_Lead -->|Publica| Boleta
  QA -->|Evalúa| Evaluacion[Evaluación]
  QA -->|Carga| Feedback[Feedback]
  Asesor -->|Confirma| Feedback
  Analista -->|Consulta| Dashboard[Dashboard/Métricas]
  Admin -->|Administra| Sistema[Sistema]

  Boleta -->|Versiona| BoletaVersion[Boleta Versión]
  Evaluacion -->|Genera| Métricas[Métricas]
  Evaluacion -->|Asocia| Audio[Audio/Evidencia]
  Feedback -->|Registra| Confirmacion[Confirmación]
```

# Diagrama de Arquitectura General

```mermaid
flowchart TD
  subgraph Backend (Laravel)
    A1[API REST]
    A2[Autenticación JWT/Sanctum]
    A3[Servicios y Controladores]
    A4[Base de datos MySQL]
  end
  subgraph Frontend (Angular)
    B1[Login]
    B2[Dashboard]
    B3[Boletas]
    B4[Evaluaciones]
    B5[Feedback]
    B6[Métricas]
    B7[Usuarios]
  end
  B1 -->|API| A1
  B2 -->|API| A1
  B3 -->|API| A1
  B4 -->|API| A1
  B5 -->|API| A1
  B6 -->|API| A1
  B7 -->|API| A1
  A1 -->|DB| A4
  B1 -->|Guards| B7
  B2 -->|Guards| B7
```

# Diagrama de Flujo de Evaluación QA

```mermaid
flowchart TD
  subgraph Flujo Evaluación QA
    QA_Lead((QA Lead))
    QA((QA))
    Asesor((Asesor))
    Boleta[Boleta QA]
    Version[Versión]
    Evaluacion[Evaluación]
    Feedback[Feedback]
    Audio[Audio]
    Métricas[Métricas]
    QA_Lead -->|Crea| Boleta
    QA_Lead -->|Publica| Version
    QA -->|Evalúa| Evaluacion
    QA -->|Carga| Feedback
    QA -->|Asocia| Audio
    Asesor -->|Confirma| Feedback
    Evaluacion -->|Genera| Métricas
  end
```

# Diagrama de Seguridad y Roles

```mermaid
flowchart TD
  subgraph Seguridad y Roles
    Admin((Admin))
    QA_Lead((QA Lead))
    QA((QA))
    Analista((Analista))
    Asesor((Asesor))
    Permisos[Permisos]
    Auditoria[Auditoría]
    Admin -->|Gestiona| Permisos
    QA_Lead -->|Diseña| Boletas
    QA -->|Evalúa| Interacciones
    Analista -->|Consulta| Métricas
    Asesor -->|Consulta| Feedback
    Todos[Todos los roles] -->|Acciones| Auditoria
  end
```
