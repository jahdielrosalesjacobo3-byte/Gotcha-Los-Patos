# PRD - Gotcha Los Patos La Marquesa - 3D Landing Page

## Original Problem Statement
Create an immersive 3D landing page for the paintball business "Gotcha Los Patos La Marquesa" with bilingual support (ES/EN), a booking system that saves to MongoDB and redirects to WhatsApp, an admin dashboard to manage reservations, and persuasive marketing copy. Reservation requires $300 MXN deposit, rest paid on-site.

Stack: React (CRA) + Tailwind + Framer Motion + Three.js + R3F + Drei + Lucide + FastAPI + MongoDB.

## User Personas
- **Cliente individual / pareja**: jóvenes de la CDMX que buscan adrenalina cerca de casa.
- **Familias y grupos**: organizadores de cumpleaños, despedidas o team-building.
- **Admin (dueño)**: revisa reservas, confirma anticipos, gestiona estados.

## Core Requirements
- Hero 3D inmersivo (R3F) con esferas de pintura flotantes reactivas al ratón.
- 6 paquetes (3 individuales + 3 familiares) con cards glassmorphism.
- Booking system: form → MongoDB + WhatsApp deep-link prefilled.
- Anticipo capped a $300 MXN (o el total del paquete si es menor).
- Admin dashboard con stats, filtros por estado, CRUD de reservas.
- Bilingüe ES/EN (toggle global).
- Botón flotante de WhatsApp.
- Auth JWT (cookie + Bearer fallback).

## Implemented (2025-12)
- [x] Backend FastAPI con auth JWT (login/me/logout), bookings CRUD público + admin, stats agregados.
- [x] Admin auto-seed (gotchalospatos351@gmail.com / GotchaLosPatos376) bcrypt.
- [x] Frontend completo: Navbar, Hero 3D (R3F), InfoSection, Packages, Gallery (parallax), Testimonials (5 reseñas), CTASection, Footer, WhatsApp FAB, BookingModal, AdminLogin, AdminDashboard.
- [x] LanguageContext + AuthContext + traducciones ES/EN completas.
- [x] WhatsApp prefilled link a wa.me/525560326688.
- [x] Tailwind theme custom (Anton + Montserrat, neon green/orange/magenta, dark forest bg).
- [x] Patch a visual-edits babel plugin para soportar primitives R3F.
- [x] Cap de anticipo: min(300, total) para evitar cobrar más de lo necesario.
- [x] Tests automáticos: backend 100% (23/23), frontend 100%.

## Iteration 2 (2025-12)
- [x] Logo real con imagen asset original (LOGO_URL) en vez de HTML/CSS.
- [x] Horarios sábado/domingo actualizados a 10:00 AM - 6:00 PM.
- [x] Dirección Maps actualizada a "Gotcha Los Patos, 52743 La Marquesa, Méx.".
- [x] URLs reales de redes sociales: Facebook, Instagram, TikTok @gotchalospatos.
- [x] Galería con efecto parallax: 4 fotos reales con tactical corners + tags + scan animation.
- [x] Sistema de disponibilidad: GET /api/availability + conflict check (±60 min) en POST /api/bookings (409). Frontend BookingModal usa grid de slots (4 weekday / 8 weekend) con slots ocupados marcados rojos.
- [x] Cancelled bookings no bloquean slots.
- [x] Fix: duplicate React key warning en BookingModal (movido `<style>` fuera de AnimatePresence).

## Iteration 3 (2025-12)
- [x] Embed YouTube video (rmyjE2m0Vjg) en nueva sección VideoSection con thumbnail click-to-play.
- [x] 3 fotos más en galería (total 7) con bento layout adaptativo.
- [x] Sección "Personal" con login dual: acepta email O username via campo `identifier`.
- [x] Nuevo usuario staff seeded desde .env: AdminGLP2026 / GotchaLosPatos0126 (role=admin).
- [x] Backwards compat: legacy {email, password} payload sigue funcionando.
- [x] Username lookup case-insensitive con re.escape para seguridad anti-regex injection.
- [x] Nav links nuevos: PERSONAL (con candado naranja) → /admin/login, VIDEO → #video.
- [x] AdminLogin renombrado a "PANEL DE PERSONAL" / "ACCESO PERSONAL", input texto con placeholder dual.
- [x] Tests: backend 33/33 (10 nuevos en TestDualLogin), frontend 100%.

## Backlog / Future Enhancements
### P1
- Replace native `<input type=date>` with shadcn Calendar/Popover for dark theme + locale ES.
- Brute-force protection (5-attempt lockout) en /api/auth/login.
- Pagination on /api/admin/bookings.
- URLs reales de redes sociales (Facebook/Instagram/TikTok).
- Galería de fotos reales del campo (cuando el cliente las envíe).

### P2
- Stripe / MercadoPago para cobrar el anticipo $300 desde la web (en lugar de WhatsApp manual).
- Email de confirmación automatizado.
- Calendario de disponibilidad (bloquear horarios ya reservados).
- Programa de lealtad / cupones de descuento.
- Integración con Google Maps embebido.

### P3
- Migrar de @app.on_event a FastAPI lifespan.
- Split server.py en routers (auth, bookings, admin).

## Tech / Notes
- React 18.3.1 + R3F 8.17.10 + Drei 9.114.3 + Three 0.160.1 (R3F v9+ React 19 was buggy).
- visual-edits babel plugin patched at /app/frontend/node_modules/@emergentbase/visual-edits/dist/babel-plugin/index.js to skip Three.js primitives. **If node_modules is reinstalled, this patch will be lost — re-apply.**
- Admin token stored in localStorage as Bearer fallback (cookies may not work cross-site in some setups).
