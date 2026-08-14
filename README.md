# Amour Bloom

Catálogo premium de maquillaje y skincare de lujo, construido con Next.js 16 (App Router), React 19, TypeScript, Prisma ORM y SQL Server. Incluye catálogo con filtros y búsqueda en tiempo real, reseñas de producto, cupones de descuento, carrito con checkout coordinado por WhatsApp, autenticación de clientes (Auth.js) y un panel administrativo completo con roles.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict)
- **Estilos:** Tailwind CSS v4 (config CSS-first, sin `tailwind.config.js`)
- **Animación:** Framer Motion, GSAP, Swiper
- **Formularios y validación:** React Hook Form + Zod
- **Datos:** Prisma ORM 7 (generador `prisma-client` con driver adapters) + SQL Server, vía `@prisma/adapter-mssql`
- **Autenticación:** Auth.js (NextAuth v5), Credentials + JWT, bcrypt
- **HTTP cliente:** Axios
- **Imágenes:** Cloudinary (subida de archivo o por URL desde el panel administrativo)
- **Correo transaccional:** Resend (recuperación de contraseña, bienvenida, confirmación de pedido y notificación interna a la tienda)
- **Rate limiting:** Upstash Redis (con fallback en memoria si no está configurado)
- **Monitoreo y analítica:** Sentry (errores) y Google Analytics 4 — ambos opcionales, deshabilitados sin sus variables de entorno
- **Pruebas:** Vitest

## Arquitectura

```
src/
├── app/                 rutas (App Router): (site)/, admin/, api/  — frontend + endpoints
├── components/          UI reutilizable, organizada por dominio     — frontend
├── server/              código exclusivo de servidor (nunca se importa desde componentes cliente)
│   ├── repositories/    acceso a datos vía Prisma (un archivo por agregado)
│   └── services/        lógica de negocio sobre los repositorios
├── validators/           esquemas Zod compartidos entre cliente y servidor
├── lib/                  utilidades (prisma client, auth, rate-limit, json-ld, cn/formatearMoneda, etc.)
├── config/               configuración del sitio
└── types/                tipos compartidos
prisma/
├── schema.prisma
├── seed.ts
└── seed-data.ts
```

## Requisitos previos

- Node.js 22+
- Una instancia de SQL Server accesible (local o remota)
- Docker (opcional, solo para el despliegue containerizado)

## Configuración

1. Clona el repositorio e instala dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env` y completa los valores:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL`: cadena usada por la CLI de Prisma (migraciones). Puede usar autenticación de Windows si migras localmente.
   - `DB_SERVER`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: credenciales SQL usadas en tiempo de ejecución por el driver adapter (`@prisma/adapter-mssql`, vía Tedious, requiere login SQL — no Windows Auth).
   - `AUTH_SECRET`: genera uno con `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`: número (con código de país, sin `+`) usado para el checkout por WhatsApp.
   - Variables de `CLOUDINARY_*`: necesarias para subir archivos de imagen desde el panel administrativo. Sin ellas, los campos de imagen siguen aceptando una URL directa, pero el botón "Subir" fallará.

3. Aplica las migraciones y siembra datos de ejemplo:

   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

   Esto crea los roles, un usuario administrador (`admin@eclatmaquillaje.com` / `Admin#2026!`) y un catálogo de ejemplo.

   > **Producción:** el seed rechaza correr sin la variable `SEED_ADMIN_PASSWORD` cuando `NODE_ENV=production` — nunca debe quedar en producción un Administrador con la contraseña de demo de este README.

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Verificación de tipos |
| `npm test` | Ejecuta la suite de pruebas (Vitest) una sola vez |
| `npm run test:watch` | Ejecuta la suite de pruebas en modo watch |
| `npm run db:migrate` | Aplica migraciones pendientes (`prisma migrate deploy`) |
| `npm run db:seed` | Siembra datos de ejemplo |

## Panel administrativo

Accede en `/admin` con una cuenta de rol `Administrador` o `Empleado`. Incluye:

- Dashboard con KPIs (ingresos, pedidos, pedidos pendientes, stock crítico), reportes de ventas por día/categoría/método de pago, productos más vendidos, cupones más usados y últimos mensajes de contacto.
- CRUD completo de productos (con imágenes e inventario), categorías, marcas, promociones, cupones y banners — con filtro para ocultar inactivos por defecto y activar/desactivar sin pasar por "eliminar".
- Gestión de pedidos (cambio de estado, notificación al cliente por WhatsApp) y de usuarios (activar/desactivar; el rol solo se asigna al crear la cuenta y no se puede reasignar después).
- Moderación de opiniones de producto.
- Mensajes de contacto (marcar como leído) y suscriptores del newsletter (activar/desactivar, exportar a CSV).

## Despliegue con Docker

La aplicación usa `output: "standalone"` de Next.js, por lo que la imagen final no requiere `node_modules` completo. La base de datos SQL Server se asume externa al stack de contenedores (no se incluye un contenedor de SQL Server).

```bash
docker compose up --build
```

Esto levanta:

- **app**: la aplicación Next.js (puerto 3000 interno)
- **nginx**: reverse proxy con cache de assets estáticos y compresión gzip (puerto 80)

> **Nota:** en Docker Desktop (Windows/Mac), `host.docker.internal` resuelve a la máquina anfitriona, donde normalmente corre tu instancia real de SQL Server. En Linux, ajusta `DB_SERVER` a la IP del host o agrega `extra_hosts: ["host.docker.internal:host-gateway"]` en `docker-compose.yml`.

## Integración continua

`.github/workflows/ci.yml` ejecuta en cada push/PR a `main`: instalación, lint, verificación de tipos, migraciones contra un contenedor efímero de SQL Server, seed y build completo.

## Seguridad

- Cabeceras de seguridad (CSP, HSTS, X-Frame-Options, etc.) configuradas en `next.config.ts`.
- Rate limiting sobre endpoints sensibles (login, registro, newsletter, contacto, pedidos, favoritos) — vía Upstash Redis si está configurado, con fallback en memoria; ver `src/lib/rate-limit.ts` y `src/proxy.ts`.
- Registro de actividad (`activity_logs`) y auditoría (`audit_logs`) sobre acciones críticas y mutaciones del panel administrativo.
