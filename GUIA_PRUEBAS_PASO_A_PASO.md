# 🎓 Guía de Pruebas Paso a Paso - Fase 0
## Explicación Completa para Aprender Probando

---

## 📚 ANTES DE EMPEZAR: ¿Por qué probamos?

Como desarrollador, **probar tu código es TAN importante como escribirlo**. Aquí aprenderás:
- ✅ A verificar que tu código funciona como esperas
- ✅ A usar las herramientas del navegador (DevTools)
- ✅ A identificar errores ANTES de que lleguen a producción
- ✅ A entender el flujo completo de autenticación

---

## 🎯 PASO 1: Verificar que los Servidores Están Corriendo

### ¿Por qué?
Sin servidores corriendo, ¡no hay nada que probar! Necesitas:
- **Backend (Laravel)** en http://localhost:8000 → API que procesa login
- **Frontend (Angular)** en http://localhost:4200 → Interfaz visual

### Cómo verificar:

**Opción A - Desde el navegador:**
1. Abre Google Chrome o Edge
2. Ve a: `http://localhost:4200`
   - ✅ SI VES: Pantalla de login → Frontend corriendo
   - ❌ SI VES: "No se puede acceder" → Frontend NO está corriendo

3. Abre otra pestaña: `http://localhost:8000`
   - ✅ SI VES: Página de Laravel o JSON → Backend corriendo
   - ❌ SI VES: "No se puede acceder" → Backend NO está corriendo

**Opción B - Desde VS Code:**
- Mira las terminales en la parte inferior
- Deberías ver terminales con procesos corriendo

### ¿Qué hacer si NO están corriendo?

**Para iniciar el Backend:**
```bash
cd backend
php artisan serve
```

**Para iniciar el Frontend:**
```bash
cd frontend  
npm start
```

---

## 🧪 PASO 2: Probar el Login (Prueba Más Importante)

### ¿Qué estamos probando?
- Que el usuario puede iniciar sesión
- Que el backend retorna un TOKEN (llave de acceso)
- Que el token se GUARDA en el navegador
- Que el backend retorna el ROL del usuario como TEXTO (no como número)

### Usuarios de Prueba Disponibles:

| Usuario | Contraseña | Rol | Ruta Esperada |
|---------|------------|-----|---------------|
| admin | admin123 | Admin | /admin |
| qalead | qalead123 | QA Lead | /dashboard |
| qauser | qa123456 | QA | /qa |
| analista | analista123 | Analista | /analista |
| asesor | asesor123 | Asesor | /dashboard |

### Procedimiento Detallado:

#### 2.1 Abrir las Herramientas del Desarrollador (MUY IMPORTANTE)

1. Abre Chrome/Edge
2. Ve a: `http://localhost:4200`
3. Presiona **F12** (o clic derecho → Inspeccionar)
4. Se abre un panel con varias pestañas

**📍 Familiarízate con estas pestañas:**

- **Console** → Muestra errores de JavaScript y mensajes
- **Network** → Muestra todas las peticiones HTTP (login, logout, etc.)
- **Application** → Muestra localStorage (donde se guarda el token)

#### 2.2 Realizar el Login

1. **En la pestaña Network de DevTools:**
   - Haz clic en Network
   - Asegúrate que esté grabando (círculo rojo arriba a la izquierda)
   
2. **En la pantalla de login:**
   - Usuario: `admin`
   - Contraseña: `admin123`
   - Clic en "Iniciar Sesión"

3. **Observa qué pasa:**

#### 2.3 Verificar la Petición HTTP (Aprender a leer el Network)

**En la pestaña Network, busca una petición llamada `login`:**

1. Haz clic en ella
2. Ve a la pestaña **Headers** (cabeceras)
   
   **Request (Lo que enviamos):**
   ```
   POST http://localhost:8000/api/login
   Content-Type: application/json
   
   Body:
   {
     "user": "admin",
     "password": "admin123"
   }
   ```

3. Ve a la pestaña **Response** (respuesta del servidor)
   
   **✅ RESPUESTA CORRECTA (Status 200):**
   ```json
   {
     "token": "1|abc123xyz...",
     "user": {
       "id": 1,
       "name": "Administrador del Sistema",
       "user": "admin",
       "email": "admin@evaluacionqa.com",
       "role": "Admin"  ← IMPORTANTE: Es texto, no número
     }
   }
   ```
   
   **❌ RESPUESTA INCORRECTA (Status 401):**
   ```json
   {
     "message": "Credenciales inválidas"
   }
   ```
   → Verifica usuario/contraseña

   **❌ RESPUESTA INCORRECTA (Status 500):**
   ```json
   {
     "message": "Server Error"
   }
   ```
   → Hay un error en el backend (revisar código)

#### 2.4 Verificar que el Token se Guardó (localStorage)

**¿Qué es localStorage?**
Es como una "memoria" del navegador donde guardamos datos que persisten aunque cierres la aplicación.

1. **En DevTools, ve a la pestaña Application**
2. En el menú izquierdo:
   - Despliega "Storage"
   - Despliega "Local Storage"
   - Haz clic en `http://localhost:4200`

3. **Deberías ver:**
   ```
   Key: token
   Value: 1|8SomAx4ypblahblah... (un texto largo)
   ```

**¿Por qué es importante?**
- Este token es tu "credencial de acceso"
- Cada vez que hagas una petición al backend, se envía automáticamente
- Si NO está guardado → no puedes acceder a rutas protegidas

#### 2.5 Verificar la Redirección

**Después del login exitoso, el navegador debe REDIRIGIRTE automáticamente.**

**Observa la barra de dirección:**
- ✅ Usuario Admin → URL cambia a: `http://localhost:4200/admin`
- ✅ Usuario QA → URL cambia a: `http://localhost:4200/qa`
- ✅ Usuario Analista → URL cambia a: `http://localhost:4200/analista`

**Si NO redirige:**
- Revisa la Console (F12) para errores
- Verifica que el rol llegue como texto "Admin" y no como número "1"

---

## 🔐 PASO 3: Probar el Interceptor de Autenticación

### ¿Qué es un Interceptor?
Es un "guardián" que AUTOMÁTICAMENTE añade el token a TODAS las peticiones HTTP que hagan al backend.

**Analogía:** Es como tener un asistente que siempre muestra tu identificación antes de entrar a cualquier lugar.

### ¿Por qué es importante?
Sin el interceptor, tendrías que añadir el token MANUALMENTE en cada petición. ¡Sería tedioso y propenso a errores!

### Cómo Probarlo:

1. **Asegúrate de estar logueado** (tienes token en localStorage)

2. **Haz una petición al backend:**
   - Navega a cualquier sección de la app
   - O abre Console (F12) y ejecuta:
   ```javascript
   fetch('http://localhost:8000/api/user', {
     headers: { 'Accept': 'application/json' }
   }).then(r => r.json()).then(console.log);
   ```

3. **Ve a Network → busca la petición → Headers**

4. **Busca en "Request Headers":**
   ```
   Authorization: Bearer 1|8SomAx4yp...
   ```

**✅ SI APARECE:** ¡El interceptor funciona! Añadió el token automáticamente.

**❌ SI NO APARECE:** El interceptor no está registrado o no funciona.

---

## 🛡️ PASO 4: Probar los Guards (Protección de Rutas)

### ¿Qué es un Guard?
Es un "guardia de seguridad" que verifica:
1. ¿Estás logueado? (AuthGuard)
2. ¿Tienes el rol correcto? (RoleGuard)

**Analogía:** Como un guardia de edificio que verifica tu ID y que tengas permiso para entrar a cierto piso.

### Prueba A: AuthGuard (Verifica que estés logueado)

1. **SIN estar logueado:**
   - Abre modo incógnito (Ctrl+Shift+N)
   - Ve a: `http://localhost:4200/admin`

2. **Resultado esperado:**
   - ✅ Te redirige a `/login`
   - No puedes ver la página de admin

### Prueba B: RoleGuard (Verifica que tengas el rol correcto)

1. **Loguéate como usuario QA:**
   - Usuario: `qauser`
   - Contraseña: `qa123456`
   - Te redirige a `/qa` (correcto)

2. **Intenta acceder a ruta de Admin:**
   - En la barra de direcciones, escribe: `http://localhost:4200/admin`
   - Presiona Enter

3. **Resultado esperado:**
   - ❌ NO deberías poder acceder
   - Te redirige a otra parte o muestra error
   - En Console puede aparecer mensaje del guard

**¿Por qué es importante?**
Previene que usuarios sin permisos accedan a secciones restringidas. ¡Es seguridad básica!

---

## 🚪 PASO 5: Probar el Logout

### ¿Qué debe hacer el Logout?
1. **Enviar petición al backend** para invalidar el token
2. **Borrar el token de localStorage**
3. **Redirigir a /login**
4. **Prevenir acceso a rutas protegidas**

### Procedimiento:

1. **Estando logueado, busca el botón "Cerrar Sesión"**
   - Puede estar en un menú, navbar, o sidebar

2. **Antes de hacer clic:**
   - Abre DevTools → Application → localStorage
   - Confirma que el token existe

3. **Haz clic en "Cerrar Sesión"**

4. **Verifica en Network:**
   - Debe aparecer petición a `/api/logout`
   - Status: 200 OK

5. **Verifica localStorage:**
   - El token debe DESAPARECER
   - La lista debe estar vacía

6. **Verifica la URL:**
   - Debe redirigir a: `http://localhost:4200/login`

7. **Prueba Final - Intenta acceder a ruta protegida:**
   - Escribe en la barra: `http://localhost:4200/admin`
   - ✅ Debe redirigirte a login (ya no estás autenticado)

---

## 🔄 PASO 6: Probar Persistencia de Sesión

### ¿Qué significa "persistencia"?
Que tu sesión NO se pierde al refrescar la página o cerrar/abrir el navegador.

### ¿Por qué es importante?
¡Imagina tener que loguearte cada vez que refrescas la página! Sería terrible UX (experiencia de usuario).

### Cómo Probarlo:

1. **Loguéate con cualquier usuario**
   - Verifica que estés en tu ruta correcta

2. **Presiona F5** (refrescar página)
   - ✅ Sigues logueado
   - ✅ Sigues en la misma ruta
   - ✅ Token sigue en localStorage

3. **Cierra la pestaña completamente**

4. **Abre nueva pestaña y ve a:** `http://localhost:4200`
   - ✅ Te lleva directamente a tu dashboard (no a login)
   - ✅ Token sigue ahí

5. **Para perder la sesión:**
   - DEBES hacer logout manualmente
   - O borrar localStorage manualmente
   - O que el token expire en el backend

---

## 📊 TABLA RESUMEN: Matriz de Pruebas

| # | Prueba | Usuario | Acción | Resultado Esperado | Estado |
|---|--------|---------|--------|-------------------|---------|
| 1 | Login Admin | admin | Login exitoso | Token guardado, redirige a /admin | ⏳ |
| 2 | Login QA Lead | qalead | Login exitoso | Token guardado, redirige a /dashboard | ⏳ |
| 3 | Login QA | qa | Login exitoso | Token guardado, redirige a /qa | ⏳ |
| 4 | Login Analista | analista | Login exitoso | Token guardado, redirige a /analista | ⏳ |
| 5 | Login Asesor | asesor | Login exitoso | Token guardado, redirige a /dashboard | ⏳ |
| 6 | Login Incorrecto | admin | Password malo | Error 401, no se guarda token | ⏳ |
| 7 | Interceptor | cualquiera | Navegar después de login | Header Authorization presente | ⏳ |
| 8 | AuthGuard | - | Acceder sin login | Redirige a /login | ⏳ |
| 9 | RoleGuard | qa | Acceder a /admin | Bloqueado, no puede entrar | ⏳ |
| 10 | Logout | cualquiera | Cerrar sesión | Token borrado, redirige a login | ⏳ |
| 11 | Persistencia | cualquiera | Refrescar página | Sigue logueado | ⏳ |

**Leyenda:**
- ⏳ Pendiente
- ✅ Pasó
- ❌ Falló

---

## 🐛 ERRORES COMUNES Y SOLUCIONES

### Error 1: "Cannot read property 'role' of undefined"

**Causa:** El backend no está retornando el objeto user correctamente.

**Solución:**
1. Revisa `AuthController.php` línea ~40
2. Debe tener: `->with('role')` para eager loading
3. Verifica que User.php tenga la relación `role()`

### Error 2: "Token not found in localStorage"

**Causa:** El token no se guardó después del login.

**Solución:**
1. Revisa `login.component.ts`
2. Después del login exitoso debe llamar: `this.tokenService.saveToken(response.token)`
3. Verifica en Console si hay errores

### Error 3: "Authorization header not sent"

**Causa:** El interceptor no está registrado.

**Solución:**
1. Revisa `app.config.ts`
2. Debe tener: `withInterceptors([authInterceptor])`
3. Verifica que authInterceptor esté importado

### Error 4: "Role is a number (1, 2, 3) instead of string"

**Causa:** El backend está retornando role_id en vez del objeto role.

**Solución:**
1. Revisa `AuthController.php`
2. Debe retornar: `'role' => $user->role->nombre`
3. NO debe retornar: `'role_id' => $user->role_id`

### Error 5: "Page redirects to /dashboard for all users"

**Causa:** La función `redirectByRole()` no está evaluando correctamente el rol.

**Solución:**
1. Revisa `login.component.ts` método `redirectByRole()`
2. Verifica que el switch evalúe `userData.role` (string)
3. Los case deben ser exactos: 'Admin', 'QA', 'Analista', etc.

---

## 🎯 CRITERIOS DE ÉXITO - ¿Cuándo está completa la Fase 0?

✅ **Todos estos deben pasar:**

1. [ ] Los 5 usuarios pueden hacer login correctamente
2. [ ] Cada usuario redirige a su ruta según su rol
3. [ ] El token se guarda en localStorage
4. [ ] El interceptor añade el token automáticamente
5. [ ] Los guards bloquean acceso no autorizado
6. [ ] El logout limpia la sesión completamente
7. [ ] La sesión persiste al refrescar la página
8. [ ] No hay errores en la Console del navegador
9. [ ] Las peticiones HTTP tienen status 200 (éxito)
10. [ ] El rol llega como TEXTO, no como ID

---

## 📝 REPORTE DE PRUEBAS

**Completa esto después de probar:**

### Fecha de Prueba: __________

### Ambiente:
- Backend: Puerto ____
- Frontend: Puerto ____
- Navegador: __________

### Resultados:

**Pruebas que PASARON:**
- 
- 

**Pruebas que FALLARON:**
-
-

**Errores Encontrados:**
-
-

**Observaciones:**
-
-

---

## 💡 CONSEJOS PARA APRENDER MÁS

1. **No solo pruebes lo que funciona:**
   - Intenta romper la aplicación
   - Prueba credenciales incorrectas
   - Intenta inyección SQL: `' OR 1=1--`
   - Modifica el token manualmente en localStorage

2. **Lee los errores completos:**
   - Los errores de console son informativos
   - No los ignores, entiéndelos

3. **Usa console.log() para debugging:**
   ```javascript
   console.log('Usuario recibido:', userData);
   console.log('Token guardado:', this.tokenService.getToken());
   ```

4. **Compara request vs response:**
   - ¿Enviaste lo que querías?
   - ¿Recibiste lo que esperabas?

---

## 🚀 SIGUIENTE PASO: Fase 1

Una vez que todas las pruebas pasen, estarás listo para:
- Implementar CRUD de Usuarios
- Implementar CRUD de Roles
- Añadir validaciones con Form Requests
- Formatear respuestas con API Resources
- Crear dashboards específicos por rol

---

**¿Tienes dudas o encontraste un error?**
¡Ese es el momento de aprender! 🎓

Analiza:
1. ¿Qué esperabas que pasara?
2. ¿Qué pasó realmente?
3. ¿Dónde puede estar el problema? (frontend, backend, comunicación)
4. ¿Cómo puedes verificar cada parte?

---

*Guía creada: 14 de Febrero, 2026*
*Proyecto: EvaluaciónQA - Sistema Enterprise de Evaluación QA*
*Stack: Laravel 10 + Angular 17 + MySQL*
