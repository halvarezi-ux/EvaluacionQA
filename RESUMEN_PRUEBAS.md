# 🚀 RESUMEN RÁPIDO - Cómo Probar (Guía de Referencia)

## 🎯 Usuarios de Prueba (ACTUALIZADOS)

```
admin     / admin123     → /admin
qalead    / qalead123    → /dashboard  
qauser    / qa123456     → /qa         ⚠️ ACTUALIZADO
analista  / analista123  → /analista
asesor    / asesor123    → /dashboard
```

**⚠️ IMPORTANTE:** El usuario QA cambió de `qa` (2 chars) a `qauser` (6 chars) para cumplir con validación mínima de 4 caracteres.

## ✅ Checklist de Pruebas

### 1️⃣ PREPARACIÓN (2 minutos)
- [ ] Abre Chrome/Edge
- [ ] Presiona **F12** para abrir DevTools
- [ ] Ve a `http://localhost:4200`
- [ ] Haz clic en pestaña **Network** en DevTools

### 2️⃣ PRUEBA DE LOGIN (5 minutos)
- [ ] Ingresa: `admin` / `admin123`
- [ ] Clic "Iniciar Sesión"
- [ ] **En Network:** Busca petición `login` → Status debe ser **200**
- [ ] **En Application → Local Storage:** Verifica que existe `token`
- [ ] **En URL:** Debe cambiar a `/admin`

### 3️⃣ PRUEBA DE INTERCEPTOR (1 minuto)
- [ ] En **Console** (F12) pega y ejecuta:
```javascript
fetch('http://localhost:8000/api/user').then(r=>r.json()).then(console.log)
```
- [ ] En **Network** → Headers → Busca: `Authorization: Bearer ...`
- [ ] ✅ Si aparece = Interceptor funciona

### 4️⃣ PRUEBA DE GUARDS (3 minutos)
- [ ] Loguéate como `qauser`
- [ ] En barra de direcciones escribe: `http://localhost:4200/admin`
- [ ] ✅ NO debes poder acceder (guard bloqueando)

### 5️⃣ PRUEBA DE LOGOUT (2 minutos)
- [ ] Clic en "Cerrar Sesión"
- [ ] **En Network:** Petición a `/logout` → Status **200**
- [ ] **En Application:** Token desaparece de localStorage
- [ ] **En URL:** Redirige a `/login`

### 6️⃣ PRUEBA DE PERSISTENCIA (1 minuto)
- [ ] Loguéate con cualquier usuario
- [ ] Presiona **F5** (refrescar)
- [ ] ✅ Sigues logueado y en tu ruta

## 🔍 ¿Qué buscar en DevTools?

### Pestaña NETWORK
```
✅ POST /api/login      → Status: 200
✅ POST /api/logout     → Status: 200  
✅ GET  /api/cualquiera → Header: Authorization: Bearer xxx
```

### Pestaña APPLICATION
```
✅ Local Storage → token → valor largo (JWT)
```

### Pestaña CONSOLE
```
❌ NO debe haber errores rojos
✅ Si hay warnings amarillos, ignóralos por ahora
```

## ⚠️ Errores Comunes

| Error | Solución Rápida |
|-------|-----------------|
| "Cannot read property 'role'" | Backend no retorna el rol correctamente |
| Status 401 en login | Usuario/contraseña incorrectos |
| Status 500 | Error en backend - revisar `php artisan serve` |
| No redirige después de login | Verificar rol llega como string, no número |
| Token no se guarda | Revisar TokenService.saveToken() |

## 📊 Resultado Final

**✅ FASE 0 COMPLETA cuando:**
- Los 5 usuarios pueden loguearse
- Cada uno va a su ruta correcta
- El token se guarda y se envía automáticamente
- El logout limpia todo
- No hay errores en consola

## 📚 Para más detalles:
Lee: `GUIA_PRUEBAS_PASO_A_PASO.md`

---

**Tiempo total de pruebas: ~15 minutos**
