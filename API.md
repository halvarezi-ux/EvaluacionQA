# API Documentation - EvaluaciónQA

## Base URL

- **Development**: `http://localhost:8000/api`
- **Production**: `https://yourdomain.com/api`

## Authentication

Este sistema utiliza **Laravel Sanctum** para autenticación basada en tokens.

### Obtener Token

Todos los endpoints protegidos requieren un token Bearer en el header:

```http
Authorization: Bearer {token}
```

## Endpoints

### Authentication

#### POST /auth/register
Registrar un nuevo usuario.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "+1234567890",
  "department": "IT",
  "position": "Developer"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "department": "IT",
      "position": "Developer",
      "is_active": true,
      "created_at": "2024-02-08T10:00:00.000000Z"
    },
    "token": "1|abc123..."
  }
}
```

#### POST /auth/login
Iniciar sesión.

**Request Body:**
```json
{
  "email": "admin@evaluacionqa.com",
  "password": "password"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@evaluacionqa.com",
      "roles": [
        {
          "id": 1,
          "name": "Administrator",
          "slug": "admin",
          "permissions": [...]
        }
      ]
    },
    "token": "2|def456..."
  }
}
```

#### GET /auth/me
Obtener usuario autenticado.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@evaluacionqa.com",
    "roles": [...]
  }
}
```

#### POST /auth/logout
Cerrar sesión.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Users

#### GET /users
Listar usuarios con paginación.

**Query Parameters:**
- `per_page` (optional): Número de resultados por página (default: 15)
- `search` (optional): Búsqueda por nombre, email o departamento

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "Admin User",
        "email": "admin@evaluacionqa.com",
        "department": "Administration",
        "position": "System Administrator",
        "is_active": true,
        "roles": [...]
      }
    ],
    "total": 10,
    "per_page": 15,
    "last_page": 1
  }
}
```

#### POST /users
Crear un nuevo usuario.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "department": "QA",
  "position": "QA Analyst",
  "is_active": true,
  "roles": [1, 2]
}
```

#### GET /users/{id}
Obtener detalles de un usuario.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@evaluacionqa.com",
    "roles": [...]
  }
}
```

#### PUT /users/{id}
Actualizar un usuario.

**Request Body:** (todos los campos son opcionales)
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "is_active": false,
  "roles": [1]
}
```

#### DELETE /users/{id}
Eliminar un usuario (soft delete).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### Roles

#### GET /roles
Listar todos los roles.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Administrator",
        "slug": "admin",
        "description": "Full access to all features",
        "is_active": true,
        "permissions": [...]
      }
    ]
  }
}
```

#### POST /roles
Crear un nuevo rol.

**Request Body:**
```json
{
  "name": "Custom Role",
  "description": "Custom role description",
  "is_active": true,
  "permissions": [1, 2, 3]
}
```

#### GET /roles/{id}
Obtener detalles de un rol.

#### PUT /roles/{id}
Actualizar un rol.

#### DELETE /roles/{id}
Eliminar un rol.

---

### Forms

#### GET /forms
Listar formularios de evaluación.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Customer Service Evaluation",
        "slug": "customer-service-evaluation-123",
        "description": "Evaluation form for customer service agents",
        "version": 1,
        "is_active": true,
        "creator": {...},
        "fields": [...]
      }
    ]
  }
}
```

#### POST /forms
Crear un nuevo formulario.

**Request Body:**
```json
{
  "name": "Sales Performance",
  "description": "Evaluation form for sales team",
  "is_active": true,
  "fields": [
    {
      "label": "Communication Skills",
      "type": "select",
      "options": ["Excellent", "Good", "Average", "Poor"],
      "is_required": true,
      "weight": 20,
      "order": 1
    },
    {
      "label": "Comments",
      "type": "textarea",
      "is_required": false,
      "order": 2
    }
  ]
}
```

#### GET /forms/{id}
Obtener detalles de un formulario.

#### PUT /forms/{id}
Actualizar un formulario.

#### DELETE /forms/{id}
Eliminar un formulario.

---

### Evaluations

#### GET /evaluations
Listar evaluaciones.

**Query Parameters:**
- `status` (optional): pending, in_progress, completed, cancelled
- `evaluator_id` (optional): ID del evaluador
- `evaluated_user_id` (optional): ID del usuario evaluado

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "form": {...},
        "evaluator": {...},
        "evaluated_user": {...},
        "status": "completed",
        "score": 85.5,
        "comments": "Good performance overall",
        "started_at": "2024-02-08T10:00:00Z",
        "completed_at": "2024-02-08T11:00:00Z"
      }
    ]
  }
}
```

#### POST /evaluations
Crear una nueva evaluación.

**Request Body:**
```json
{
  "form_id": 1,
  "evaluated_user_id": 5,
  "comments": "Initial evaluation"
}
```

#### GET /evaluations/{id}
Obtener detalles de una evaluación.

#### PUT /evaluations/{id}
Actualizar una evaluación.

#### POST /evaluations/{id}/responses
Guardar respuestas de evaluación.

**Request Body:**
```json
{
  "responses": [
    {
      "form_field_id": 1,
      "response": "Excellent",
      "score": 20
    },
    {
      "form_field_id": 2,
      "response": "Great communication skills"
    }
  ]
}
```

#### POST /evaluations/{id}/submit
Enviar evaluación completada.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Evaluation submitted successfully",
  "data": {
    "id": 1,
    "status": "completed",
    "score": 85.5
  }
}
```

---

### Feedback

#### GET /feedback
Listar feedback.

**Query Parameters:**
- `type` (optional): positive, constructive, improvement
- `is_read` (optional): true, false

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "evaluation": {...},
        "from_user": {...},
        "to_user": {...},
        "message": "Great job on this evaluation!",
        "type": "positive",
        "is_read": false,
        "created_at": "2024-02-08T10:00:00Z"
      }
    ]
  }
}
```

#### POST /feedback
Crear nuevo feedback.

**Request Body:**
```json
{
  "evaluation_id": 1,
  "to_user_id": 5,
  "message": "Consider improving response time",
  "type": "constructive"
}
```

#### PATCH /feedback/{id}/read
Marcar feedback como leído.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Feedback marked as read"
}
```

---

### Metrics

#### GET /metrics/dashboard
Obtener métricas del dashboard.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_users": 50,
    "active_evaluations": 12,
    "completed_evaluations": 150,
    "average_score": 82.5,
    "pending_feedback": 8,
    "recent_activity": [...]
  }
}
```

#### GET /metrics/users
Métricas de usuarios.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "by_department": {...},
    "by_role": {...},
    "activity_timeline": [...]
  }
}
```

#### GET /metrics/evaluations
Métricas de evaluaciones.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "by_status": {...},
    "average_scores_by_form": {...},
    "completion_rate": 85.2,
    "trends": [...]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request",
  "errors": {...}
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "success": false,
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

- **Public endpoints**: 60 requests per minute
- **Authenticated endpoints**: 120 requests per minute

Headers de respuesta:
- `X-RateLimit-Limit`: Límite de solicitudes
- `X-RateLimit-Remaining`: Solicitudes restantes
- `X-RateLimit-Reset`: Timestamp de reinicio

---

## Best Practices

1. **Siempre** incluir el token de autorización en requests protegidos
2. **Validar** datos en el cliente antes de enviar
3. **Manejar** errores apropiadamente
4. **Respetar** límites de rate limiting
5. **Usar** HTTPS en producción
6. **No almacenar** tokens en localStorage si hay riesgo XSS (considerar httpOnly cookies)

---

## Changelog

### Version 1.0.0 (2024-02-08)
- Initial API release
- Authentication endpoints
- User management
- Role management
- Form management
- Evaluation system
- Feedback system
- Metrics endpoints

---

**EvaluaciónQA API** © 2024
