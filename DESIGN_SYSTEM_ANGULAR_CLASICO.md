# EvaluaciónQA — Enterprise SaaS Design System 2026 (Angular Clásico)

## 1. Filosofía

EvaluaciónQA es un SaaS Enterprise de Gestión de Calidad.

Debe transmitir:

- **Confianza**
- **Seguridad**
- **Control**
- **Profesionalismo**
- **Modernidad técnica**

**Estilo:**  
Minimal, Premium, Sobrio.  
Modo principal: Dark.

---

## 2. Sistema de Colores (CSS Variables)

Estas variables deben declararse en `styles.scss` dentro de `:root`.

```css
:root {
  /* Brand */
  --primary-600: #2563EB;
  --primary-700: #1E40AF;

  /* Backgrounds */
  --bg-base: #0B1220;
  --bg-card: #111827;
  --bg-section: #0F172A;

  /* Borders */
  --border-soft: rgba(255,255,255,0.06);

  /* Text */
  --text-primary: #E5E7EB;
  --text-secondary: #9CA3AF;
  --text-muted: #6B7280;

  /* States */
  --danger: #EF4444;
  --success: #22C55E;
}
```

**No usar colores hardcoded fuera de estas variables.**

---

## 3. Tipografía

Fuente global:
```css
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
```

**Jerarquía:**
- Título login: 28px / 700
- Subtítulo: 14px / 400
- Inputs: 14–15px
- Footer: 12px
- Line-height: 1.6

---

## 4. Elevación

Las tarjetas deben tener profundidad.

Shadow permitido:
```css
0 25px 60px rgba(0,0,0,0.55)
```

**No flat UI.**

---

## 5. Motion

Transiciones suaves:
- 200ms–300ms
- ease-in-out

**Permitido:**
- hover brightness
- translateY pequeño
- scale 0.98 en active

**Prohibido:**
- bounce
- shake
- animaciones exageradas

---

**Last Updated:** February 15, 2026  
**Owner:** EvaluaciónQA Development Team
