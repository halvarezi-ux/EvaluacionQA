# 🔍 Cómo Verificar el Authorization Header

## Paso a Paso - DevTools Network

### 1️⃣ Abrir DevTools
```
1. Presiona F12
2. Ve a la pestaña "Network" (Red)
3. Asegúrate que esté grabando (círculo rojo activo)
```

### 2️⃣ Hacer Login
```
1. Ingresa usuario y contraseña
2. Haz clic en "Ingresar al Sistema"
3. En Network verás aparecer varias peticiones
```

### 3️⃣ Buscar la Petición de Login
```
1. En la lista de peticiones, busca: "login"
2. Haz clic en ella
3. Ve a la pestaña "Headers" (Cabeceras)
```

**En "Response Headers" deberías ver:**
```
Status Code: 200 OK
Content-Type: application/json
```

**En la pestaña "Response" deberías ver:**
```json
{
  "token": "1|abcd1234...",
  "user": {
    "id": 1,
    "name": "...",
    "role": "Admin"
  }
}
```

### 4️⃣ Verificar que el Token se Envía (MUY IMPORTANTE)

**Después del login, navega o haz otra petición:**

1. Una vez logueado, haz clic en "Cerrar Sesión" (o navega)
2. En Network aparecerá la petición "logout" 
3. Haz clic en "logout"
4. Ve a la pestaña "Headers"
5. Desplázate hasta "Request Headers"

**✅ AQUÍ DEBES VER:**
```
Authorization: Bearer 1|abcd1234efgh5678...
```

**Si NO aparece → El interceptor no funciona ❌**
**Si aparece → El interceptor funciona correctamente ✅**

---

## 📸 Ejemplo Visual

```
Network Tab
├── login (POST)
│   ├── Headers
│   │   ├── Request Headers
│   │   │   └── Content-Type: application/json
│   │   └── Response Headers
│   │       └── Status: 200 OK
│   └── Response
│       └── { "token": "...", "user": {...} }
│
└── logout (POST) ← VERIFICAR ESTE
    ├── Headers
    │   ├── Request Headers ← BUSCA AQUÍ
    │   │   ├── Authorization: Bearer 1|xxx... ✅ DEBE ESTAR
    │   │   ├── Accept: application/json
    │   │   └── Content-Type: application/json
    │   └── Response Headers
    │       └── Status: 401 (normal si ya expiró)
    └── Response
```

---

## 🧪 Prueba Alternativa con Console

Si quieres verificar el interceptor de otra forma:

### Opción 1: Desde Console (F12)
```javascript
// Después de hacer login, ejecuta en Console:
fetch('http://localhost:8000/api/user', {
  headers: {
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

Luego en Network busca la petición a `/api/user` y verifica los headers.

### Opción 2: Ver el Token Manualmente
```javascript
// En Console, ejecuta:
console.log('Token:', localStorage.getItem('token'));
```

Esto te muestra el token guardado.

---

## ❓ Preguntas Frecuentes

### ¿Por qué el interceptor es importante?

Sin el interceptor, cada petición HTTP se vería así:

```typescript
// SIN INTERCEPTOR (tedioso, repetitivo)
this.http.get('http://localhost:8000/api/users', {
  headers: {
    'Authorization': `Bearer ${this.tokenService.getToken()}`,
    'Accept': 'application/json'
  }
}).subscribe(...)
```

Con el interceptor:

```typescript
// CON INTERCEPTOR (limpio, automático)
this.http.get('http://localhost:8000/api/users').subscribe(...)
// El interceptor añade el header automáticamente
```

### ¿Qué pasa si el header NO aparece?

**Posibles causas:**
1. El interceptor no está registrado en `app.config.ts`
2. El token no está en localStorage
3. El TokenService no está funcionando
4. La petición no está usando HttpClient de Angular

### ¿Es normal ver errores 401 en logout?

**SÍ**, es Normal. Explicación en la siguiente sección.

---

*Guía rápida para verificar Authorization Header*
