# 🔐 Login Blueprint — Angular Clásico

## Layout

- Centrado absoluto vertical y horizontal
- Sin split screen
- Fondo oscuro uniforme

---

## Background

En contenedor principal:
```css
background: var(--bg-base);
```

**Overlay radial sutil:**
- Desde top-left
- `var(--primary-600)` con 12% opacidad
- Desvanecer a transparente
- Debe ser muy sutil.

---

## Auth Card

```css
width: 420px;
padding: 40px;
border-radius: 20px;
background: rgba(17,24,39,0.75);
border: 1px solid var(--border-soft);
backdrop-filter: blur(16px);
box-shadow: 0 25px 60px rgba(0,0,0,0.55);
```

Centrada perfectamente.

---

## Header

**Título:**
- 28px
- 700
- var(--text-primary)

**Subtítulo:**
- 14px
- var(--text-secondary)
- margin-bottom: 32px

---

## Form

Spacing vertical entre elementos: 20px.

**Orden:**
1. Email
2. Password
3. Row auxiliar
4. Botón
5. Footer

---

## Inputs

```css
height: 50px;
border-radius: 14px;
padding: 0 16px;
background: rgba(255,255,255,0.03);
border: 1px solid var(--border-soft);
transition: all 200ms;
```

**Focus:**
- Border → `var(--primary-600)`
- Box-shadow ring azul

**Error:**
- Border → `var(--danger)`
- Mensaje debajo 12px

---

## Auxiliary Row

**Izquierda:**  
Checkbox "Recordarme"

**Derecha:**  
Link "¿Olvidaste tu contraseña?"
- var(--text-secondary)
- Hover → var(--primary-600)
- Subrayado solo en hover

---

## Primary Button

```css
width: 100%;
height: 50px;
border-radius: 14px;
background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
box-shadow: 0 8px 20px rgba(37,99,235,0.35);
```

**Hover:**
- brightness(1.1)
- translateY(-1px)

**Active:**
- scale(0.98)

**Loading:**
- Spinner dentro
- No cambiar tamaño
- Texto con opacity 0.9

---

## Footer

```css
font-size: 12px;
color: var(--text-muted);
margin-top: 24px;
text-align: center;
```

---

## Debe sentirse:

✅ Enterprise  
✅ Controlado  
✅ Profesional  
✅ Premium

❌ No creativo  
❌ No juguetón

---

**Last Updated:** February 15, 2026  
**Owner:** EvaluaciónQA Development Team
