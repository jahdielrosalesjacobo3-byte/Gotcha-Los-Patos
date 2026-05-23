# Desplegar pagos Mercado Pago

## 1. Migración SQL

```bash
cd supabase/scripts
POSTGRES_URL_NON_POOLING="tu-connection-string" node apply-migration.mjs
# Ejecuta también 002 manualmente si apply-migration solo corre 001:
# psql o pegar supabase/migrations/002_mercadopago_payments.sql en SQL Editor
```

O en Supabase Dashboard → SQL → pegar `migrations/002_mercadopago_payments.sql`.

## 2. Secrets (Supabase → Edge Functions → Secrets)

| Secret | Descripción |
|--------|-------------|
| `MERCADOPAGO_ACCESS_TOKEN` | Token de producción o `TEST-...` |
| `SITE_URL` | `https://gotchalospatos.vercel.app` |
| `RESEND_API_KEY` | API key de Resend |
| `RESEND_FROM_EMAIL` | Remitente verificado |

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` se inyectan automáticamente.

## 3. Desplegar funciones

```bash
npx supabase login
npx supabase link --project-ref yemwpnifbjlbrlvkkztl
npx supabase functions deploy create-booking-checkout --no-verify-jwt
npx supabase functions deploy mercadopago-webhook --no-verify-jwt
```

## 4. Mercado Pago

1. [developers.mercadopago.com](https://www.mercadopago.com.mx/developers) → tu app → Credenciales
2. Webhooks → URL: `https://yemwpnifbjlbrlvkkztl.supabase.co/functions/v1/mercadopago-webhook`
3. Eventos: **Pagos** (`payment`)
4. Cuenta de retiro → BBVA

## 5. Vercel

Solo necesitas `REACT_APP_SUPABASE_*` (el pago corre en Edge Functions).
