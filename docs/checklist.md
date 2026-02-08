# Checklist de Preparación EvaluaciónQA (Windows/XAMPP)

## 1. Instalación de Dependencias
- [ ] PHP 8.2+ (verifica con `php -v`)
- [ ] Composer (verifica con `composer -V`)
- [ ] Node.js v18+ y npm (verifica con `node -v` y `npm -v`)
- [ ] Angular CLI (`npm install -g @angular/cli`)
- [ ] XAMPP (MySQL activo)

## 2. Configuración de MySQL en XAMPP
- [ ] Iniciar XAMPP y activar MySQL
- [ ] Crear base de datos `evaluacionqa` desde phpMyAdmin

## 3. Clonado e Inicialización del Proyecto
- [ ] Crear carpeta raíz `EvaluacionQA`
- [ ] Clonar repositorio o crear carpetas:
    - backend/
    - frontend/
    - docs/
- [ ] Inicializar repositorio Git (`git init`)

## 4. Backend (Laravel)
- [ ] Entrar a carpeta `backend`
- [ ] Ejecutar `composer install` (o `composer create-project laravel/laravel . "10.*"` si es nuevo)
- [ ] Copiar `.env.example` a `.env`
- [ ] Editar `.env`:
    - DB_CONNECTION=mysql
    - DB_HOST=127.0.0.1
    - DB_PORT=3306
    - DB_DATABASE=evaluacionqa
    - DB_USERNAME=root
    - DB_PASSWORD=
- [ ] Ejecutar `php artisan key:generate`
- [ ] Ejecutar migraciones: `php artisan migrate`
- [ ] Iniciar servidor: `php artisan serve`

## 5. Frontend (Angular)
- [ ] Entrar a carpeta `frontend`
- [ ] Ejecutar `npm install`
- [ ] Iniciar servidor: `ng serve`

## 6. Documentación
- [ ] Crear carpeta `docs/`
- [ ] Agregar diagramas, casos de uso, checklist.md

## 7. Seguridad y Buenas Prácticas
- [ ] Usar contraseñas seguras en MySQL
- [ ] No exponer `.env` ni credenciales en repositorios
- [ ] Actualizar dependencias regularmente
- [ ] Usar ramas Git para cada feature
- [ ] Commits claros y frecuentes
- [ ] Documentar endpoints y decisiones técnicas

## 8. Primeros Comandos de Prueba
- [ ] Probar migraciones y seeders
- [ ] Probar endpoints de autenticación
- [ ] Probar login en frontend

---

Este checklist te guía paso a paso para preparar tu entorno y comenzar el desarrollo profesional de EvaluaciónQA en Windows/XAMPP.
