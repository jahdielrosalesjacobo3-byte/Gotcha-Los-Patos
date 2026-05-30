# WhatsApp Cloud API — Gotcha Los Patos

Guía paso a paso para activar el bot con **Meta WhatsApp Cloud API** y tu stack actual (Vercel + Supabase).

---

## Qué hace el bot (ya implementado en el código)

| Función | Cuándo |
|---------|--------|
| **Menú / FAQ** | Cliente escribe hola, horarios, precios, ubicación, reservar |
| **Consulta de reservas** | Cliente escribe *estado* (busca por su número de WhatsApp) |
| **Notificación en proceso** | Al crear reserva + link de pago Mercado Pago |
| **Notificación confirmada** | Cuando Mercado Pago aprueba el pago |
| **Aviso al admin** | Nueva reserva y pago recibido (al número configurado) |

**Webhook:** `https://www.gotchalospatos.xyz/api/whatsapp-webhook`

---

## Paso 1 — Meta Business

1. Entra a [business.facebook.com](https://business.facebook.com) y crea o usa tu **Portfolio comercial**.
2. Verifica tu negocio si Meta lo solicita.

---

## Paso 2 — App de desarrollador

1. [developers.facebook.com](https://developers.facebook.com) → **Crear app**.
2. Tipo: **Otro** → **Business**.
3. Nombre sugerido: `Gotcha Los Patos`.
4. En el panel de la app, agrega el producto **WhatsApp**.

---

## Paso 3 — Número de WhatsApp

Tienes dos caminos:

### A) Número de prueba (rápido, solo desarrollo)
- WhatsApp → **API Setup** → Meta te da un número de prueba.
- Agrega **tu celular** como destinatario de prueba (hasta 5 números).

### B) Tu número real `+52 55 3124 7211` (producción)
- WhatsApp → **Phone numbers** → **Add phone number**.
- Migra el número a WhatsApp Business API (deja de funcionar en la app normal de WhatsApp en ese teléfono).
- Completa verificación con Meta.

---

## Paso 4 — Credenciales

En **WhatsApp → API Setup** copia:

| Dato | Variable Vercel |
|------|-----------------|
| **Phone number ID** | `WHATSAPP_PHONE_NUMBER_ID` |
| **Temporary access token** (luego permanente) | `WHATSAPP_ACCESS_TOKEN` |

Token permanente (recomendado):
1. **Business Settings → System users** → crear usuario sistema.
2. Asignar activos WhatsApp con permiso **Manage**.
3. Generar token con permiso `whatsapp_business_messaging`.

---

## Paso 5 — Webhook en Meta

1. WhatsApp → **Configuration** → **Webhook**.
2. **Callback URL:**  
   `https://www.gotchalospatos.xyz/api/whatsapp-webhook`
3. **Verify token:** inventa una clave (ej. `gotcha_wa_verify_2026`) → guárdala como `WHATSAPP_VERIFY_TOKEN` en Vercel.
4. Pulsa **Verify and save**.
5. Suscríbete al campo **`messages`**.

---

## Paso 6 — Variables en Vercel

En **Vercel → gotchalospatos → Settings → Environment Variables** (Production):

| Variable | Ejemplo |
|----------|---------|
| `WHATSAPP_ACCESS_TOKEN` | Token de Meta |
| `WHATSAPP_PHONE_NUMBER_ID` | ID numérico del teléfono |
| `WHATSAPP_VERIFY_TOKEN` | La clave que pusiste en el webhook |
| `WHATSAPP_ADMIN_PHONE` | `525531247211` (avisos al dueño) |
| `SITE_URL` | `https://www.gotchalospatos.xyz` |

Redeploy después de guardar.

---

## Paso 7 — Probar

1. Envía **hola** al número de WhatsApp configurado → debe responder el menú.
2. Escribe **horarios**, **precios**, **ubicacion**, **reservar**, **estado**.
3. Haz una reserva en la web con un teléfono que también tenga WhatsApp → debe llegar mensaje de “en proceso”.
4. Completa el pago → mensaje “CONFIRMADA” al cliente y aviso al admin.

---

## Comandos del bot (palabras clave)

- `hola` / `menu` — Menú principal  
- `horarios` — 10am–6pm todos los días  
- `precios` — Lista de paquetes  
- `ubicacion` — Dirección + Maps  
- `reservar` — Link a la web  
- `estado` — Tus reservas (por número de WhatsApp)  

---

## Límites de WhatsApp

- **Ventana 24 h:** respuestas libres solo si el cliente escribió en las últimas 24 h.
- **Plantillas:** para mensajes proactivos fuera de esa ventana (recordatorios) hay que crear plantillas en Meta y aprobarlas (fase futura).
- Las notificaciones de reserva funcionan porque el cliente inició contacto vía web con su teléfono o porque respondió en WhatsApp.

---

## Archivos en el repo

```
api/whatsapp-webhook.js      ← Webhook Meta (GET verify + POST mensajes)
api/lib/whatsapp.js          ← Enviar mensajes (Graph API)
api/lib/whatsapp-bot.js      ← FAQ y consulta de reservas
api/lib/whatsapp-notify.js   ← Notificaciones de reserva/pago
```

---

## Webhook Mercado Pago (recordatorio)

URL: `https://www.gotchalospatos.xyz/api/mercadopago-webhook`

Al aprobar un pago, además del correo, se envía WhatsApp al cliente.
