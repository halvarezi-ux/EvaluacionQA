# EvaluaciónQA

Plataforma web enterprise para la gestión integral de evaluaciones de calidad (QA).

## Tecnologías
- Backend: Laravel 10 (API REST)
- Frontend: Angular 17
- Base de datos: MySQL (XAMPP)
- Auth: Sanctum / JWT

## Estructura de Carpetas
- backend/
  - app/Models
  - app/Http/Controllers
  - app/Services
  - app/Policies
  - app/Requests
  - app/Resources
- frontend/
  - src/app/auth
  - src/app/dashboard
  - src/app/boletas
  - src/app/evaluaciones
  - src/app/feedback
  - src/app/metricas
  - src/app/usuarios
  - src/app/shared
- docs/
  - diagramas/
  - casos_uso/
  - checklist.md

## Instalación y Uso

### Backend (Laravel)
1. Entrar a `backend/`
2. Ejecutar `composer install`
3. Copiar `.env.example` a `.env` y configurar conexión MySQL
4. Ejecutar `php artisan key:generate`
5. Ejecutar migraciones: `php artisan migrate`
6. Iniciar servidor: `php artisan serve`

### Frontend (Angular)
1. Entrar a `frontend/`
2. Ejecutar `npm install`
3. Iniciar servidor: `ng serve`

## Buenas Prácticas
- Usar ramas Git para cada feature
- Commits claros y frecuentes
- Documentar endpoints y decisiones técnicas
- No exponer `.env` ni credenciales

---

Este README resume la estructura, tecnologías y pasos iniciales para el desarrollo profesional de EvaluaciónQA en Windows/XAMPP.
