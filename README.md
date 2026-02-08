# EvaluaciónQA - Sistema Enterprise de Evaluación de Calidad

Sistema profesional de evaluación QA con arquitectura modular, escalable y auditable.

## 🏗️ Arquitectura

### Backend
- **Framework**: Laravel 10 (API REST)
- **Base de Datos**: MySQL 8.0
- **Cache**: Redis
- **Autenticación**: Laravel Sanctum
- **Principios**: SOLID, Clean Architecture

### Frontend
- **Framework**: Angular 17
- **Estilo**: SCSS
- **UI**: Material Design
- **State Management**: RxJS

## 📁 Estructura del Proyecto

```
EvaluacionQA/
├── backend/          # Laravel 10 API REST
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/
│   │   │   │   │   ├── Auth/
│   │   │   │   │   ├── Users/
│   │   │   │   │   ├── Roles/
│   │   │   │   │   ├── Forms/
│   │   │   │   │   ├── Evaluations/
│   │   │   │   │   ├── Feedback/
│   │   │   │   │   └── Metrics/
│   │   ├── Models/
│   │   ├── Services/
│   │   ├── Repositories/
│   │   └── Traits/
│   └── database/
│       └── migrations/
├── frontend/         # Angular 17 SPA
│   └── src/
│       ├── app/
│       │   ├── core/
│       │   ├── shared/
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   ├── dashboard/
│       │   │   ├── users/
│       │   │   ├── roles/
│       │   │   ├── forms/
│       │   │   ├── evaluations/
│       │   │   └── feedback/
│       │   └── services/
└── docker-compose.yml
```

## 🚀 Características Principales

### 1. Gestión de Usuarios y Roles (RBAC)
- Roles dinámicos con permisos granulares
- Autenticación segura con tokens
- Auditoría de acciones

### 2. Formularios Dinámicos (Boletas)
- Constructor de formularios drag & drop
- Campos personalizables
- Validaciones dinámicas
- Versionado de formularios

### 3. Evaluaciones QA
- Asignación de evaluaciones
- Proceso de evaluación guiado
- Scoring automático
- Historial de evaluaciones

### 4. Sistema de Feedback
- Feedback bidireccional
- Comentarios y observaciones
- Planes de mejora
- Seguimiento de acciones

### 5. Métricas y Dashboard
- Métricas en tiempo real
- Gráficos interactivos
- Reportes exportables
- KPIs personalizables

### 6. Inteligencia Artificial
- Análisis predictivo
- Detección de patrones
- Recomendaciones automáticas
- NLP para análisis de texto

## 🔧 Instalación

### Prerrequisitos
- PHP 8.1+
- Composer
- Node.js 18+
- MySQL 8.0
- Redis (opcional)

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend (Angular)

```bash
cd frontend
npm install
ng serve
```

### Docker (Recomendado)

```bash
docker-compose up -d
```

## 🔐 Seguridad

- ✅ Protección CSRF
- ✅ Protección XSS
- ✅ SQL Injection Prevention
- ✅ Rate Limiting
- ✅ Input Validation
- ✅ Output Sanitization
- ✅ Encrypted Connections
- ✅ Secure Headers

## 📊 Módulos del Sistema

### Backend Modules

1. **Auth Module**: Autenticación y autorización
2. **Users Module**: Gestión de usuarios
3. **Roles Module**: Gestión de roles y permisos
4. **Forms Module**: Constructor de formularios dinámicos
5. **Evaluations Module**: Proceso de evaluación QA
6. **Feedback Module**: Sistema de retroalimentación
7. **Metrics Module**: Métricas y analíticas
8. **Audit Module**: Auditoría de acciones
9. **AI Module**: Inteligencia artificial y ML

### Frontend Features

1. **Authentication**: Login, registro, recuperación
2. **Dashboard**: Panel principal con métricas
3. **User Management**: CRUD de usuarios
4. **Role Management**: CRUD de roles y permisos
5. **Form Builder**: Constructor visual de formularios
6. **Evaluations**: Interface de evaluación
7. **Feedback System**: Gestión de feedback
8. **Reports**: Reportes y exportación
9. **AI Insights**: Insights generados por IA

## 🧪 Testing

```bash
# Backend Tests
cd backend
php artisan test

# Frontend Tests
cd frontend
npm test
```

## 📝 API Documentation

La documentación completa de la API estará disponible en:
- Swagger UI: `http://localhost:8000/api/documentation`
- Postman Collection: `docs/postman/`

## 🌐 Endpoints Principales

### Authentication
- POST `/api/auth/login` - Login
- POST `/api/auth/register` - Registro
- POST `/api/auth/logout` - Logout
- GET `/api/auth/me` - Usuario actual

### Users
- GET `/api/users` - Lista de usuarios
- POST `/api/users` - Crear usuario
- GET `/api/users/{id}` - Detalle de usuario
- PUT `/api/users/{id}` - Actualizar usuario
- DELETE `/api/users/{id}` - Eliminar usuario

### Roles
- GET `/api/roles` - Lista de roles
- POST `/api/roles` - Crear rol
- GET `/api/roles/{id}` - Detalle de rol
- PUT `/api/roles/{id}` - Actualizar rol
- DELETE `/api/roles/{id}` - Eliminar rol

### Forms
- GET `/api/forms` - Lista de formularios
- POST `/api/forms` - Crear formulario
- GET `/api/forms/{id}` - Detalle de formulario
- PUT `/api/forms/{id}` - Actualizar formulario
- DELETE `/api/forms/{id}` - Eliminar formulario

### Evaluations
- GET `/api/evaluations` - Lista de evaluaciones
- POST `/api/evaluations` - Crear evaluación
- GET `/api/evaluations/{id}` - Detalle de evaluación
- PUT `/api/evaluations/{id}` - Actualizar evaluación
- POST `/api/evaluations/{id}/submit` - Enviar evaluación

### Feedback
- GET `/api/feedback` - Lista de feedback
- POST `/api/feedback` - Crear feedback
- GET `/api/feedback/{id}` - Detalle de feedback

### Metrics
- GET `/api/metrics/dashboard` - Métricas del dashboard
- GET `/api/metrics/users` - Métricas de usuarios
- GET `/api/metrics/evaluations` - Métricas de evaluaciones

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

- **Arquitecto**: Sistema modular y escalable
- **Backend**: API REST con Laravel 10
- **Frontend**: SPA con Angular 17
- **DevOps**: Docker, CI/CD

## 📞 Soporte

Para soporte y consultas, contactar al equipo de desarrollo.

---

**EvaluaciónQA** - Sistema Enterprise de Evaluación de Calidad © 2024
