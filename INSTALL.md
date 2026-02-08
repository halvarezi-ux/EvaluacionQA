# Guía de Instalación y Desarrollo - EvaluaciónQA

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- **PHP**: >= 8.1
- **Composer**: >= 2.0
- **Node.js**: >= 18.x
- **npm** o **yarn**
- **MySQL**: >= 8.0
- **Redis** (opcional): para caché y colas
- **Docker & Docker Compose** (recomendado)

## 🚀 Instalación Local

### Backend (Laravel 10)

1. **Navegar al directorio del backend:**
   ```bash
   cd backend
   ```

2. **Instalar dependencias de PHP:**
   ```bash
   composer install
   ```

3. **Configurar el archivo de entorno:**
   ```bash
   cp .env.example .env
   ```

4. **Editar el archivo `.env` con tu configuración:**
   ```env
   APP_NAME=EvaluacionQA
   APP_ENV=local
   APP_KEY=
   APP_DEBUG=true
   APP_URL=http://localhost:8000

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=evaluacionqa
   DB_USERNAME=root
   DB_PASSWORD=

   FRONTEND_URL=http://localhost:4200
   ```

5. **Generar la clave de aplicación:**
   ```bash
   php artisan key:generate
   ```

6. **Crear la base de datos:**
   ```sql
   CREATE DATABASE evaluacionqa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

7. **Ejecutar las migraciones y seeders:**
   ```bash
   php artisan migrate --seed
   ```

8. **Iniciar el servidor de desarrollo:**
   ```bash
   php artisan serve
   ```

   El backend estará disponible en `http://localhost:8000`

### Frontend (Angular 17)

1. **Navegar al directorio del frontend:**
   ```bash
   cd frontend
   ```

2. **Instalar dependencias de Node:**
   ```bash
   npm install
   ```

3. **Configurar el entorno:**
   
   Editar `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8000/api'
   };
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   ng serve
   ```

   O con puerto específico:
   ```bash
   ng serve --port 4200
   ```

   El frontend estará disponible en `http://localhost:4200`

## 🐳 Instalación con Docker

### Opción más sencilla y recomendada

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tuusuario/EvaluacionQA.git
   cd EvaluacionQA
   ```

2. **Configurar variables de entorno del backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Editar .env con los valores de Docker
   ```

   Configuración recomendada para Docker:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=mysql
   DB_PORT=3306
   DB_DATABASE=evaluacionqa
   DB_USERNAME=evaluacionqa_user
   DB_PASSWORD=evaluacionqa_pass
   ```

3. **Levantar los contenedores:**
   ```bash
   cd ..
   docker-compose up -d
   ```

4. **Ejecutar migraciones dentro del contenedor:**
   ```bash
   docker-compose exec backend php artisan migrate --seed
   ```

5. **Acceder a la aplicación:**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:8000
   - Base de datos MySQL: localhost:3306

6. **Detener los contenedores:**
   ```bash
   docker-compose down
   ```

## 👤 Usuarios de Prueba

Después de ejecutar los seeders, tendrás acceso a los siguientes usuarios:

| Rol | Email | Contraseña | Descripción |
|-----|-------|------------|-------------|
| **Administrator** | admin@evaluacionqa.com | password | Acceso completo al sistema |
| **Manager** | manager@evaluacionqa.com | password | Gestión de evaluaciones y reportes |
| **Evaluator** | evaluator@evaluacionqa.com | password | Realizar evaluaciones |

## 🧪 Ejecutar Tests

### Backend (PHPUnit)
```bash
cd backend
php artisan test
```

### Frontend (Jasmine/Karma)
```bash
cd frontend
npm test
```

## 🔧 Comandos Útiles

### Backend

```bash
# Limpiar caché
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Generar documentación API
php artisan l5-swagger:generate

# Ejecutar migraciones
php artisan migrate
php artisan migrate:fresh --seed

# Ejecutar colas
php artisan queue:work
```

### Frontend

```bash
# Compilar para producción
npm run build

# Análisis de bundle
npm run build -- --stats-json

# Linting
ng lint

# Formateo de código
npm run format
```

## 📚 Estructura de la Base de Datos

### Tablas Principales

- **users**: Usuarios del sistema
- **roles**: Roles de usuario
- **permissions**: Permisos del sistema
- **role_user**: Relación usuarios-roles
- **permission_role**: Relación roles-permisos
- **forms**: Formularios de evaluación
- **form_fields**: Campos de los formularios
- **evaluations**: Evaluaciones realizadas
- **evaluation_responses**: Respuestas de evaluaciones
- **feedback**: Retroalimentación
- **audit_logs**: Registro de auditoría

## 🔐 Seguridad

### Configuraciones importantes:

1. **Nunca** commits el archivo `.env` al repositorio
2. Usar contraseñas seguras en producción
3. Activar HTTPS en producción
4. Configurar rate limiting apropiado
5. Revisar permisos de archivos en el servidor

### Headers de seguridad recomendados:

```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
```

## 🚀 Despliegue en Producción

### Backend

1. Configurar servidor web (Nginx/Apache)
2. Instalar PHP 8.1+ y extensiones
3. Configurar supervisor para colas
4. Configurar certificado SSL
5. Optimizar Laravel:
   ```bash
   composer install --optimize-autoloader --no-dev
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

### Frontend

1. Compilar para producción:
   ```bash
   npm run build --configuration=production
   ```
2. Servir archivos estáticos con Nginx
3. Configurar certificado SSL
4. Configurar gzip/brotli

## 📖 Documentación API

Una vez el backend esté corriendo, la documentación de la API estará disponible en:

- Swagger UI: `http://localhost:8000/api/documentation`

## 🐛 Troubleshooting

### Error: "Class not found"
```bash
composer dump-autoload
```

### Error: "Permission denied" en storage
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### Error de CORS
Verificar configuración en `backend/config/cors.php` y asegurar que `FRONTEND_URL` está configurado correctamente.

### Angular: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📞 Soporte

Para reportar problemas o solicitar ayuda:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

## 📝 Licencia

Este proyecto es privado y confidencial.

---

**EvaluaciónQA** - Sistema Enterprise de Evaluación de Calidad © 2024
