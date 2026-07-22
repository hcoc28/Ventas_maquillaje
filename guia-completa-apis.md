# Guía completa de APIs

## 1. ¿Qué es una API?

API significa *Application Programming Interface* (interfaz de programación de aplicaciones). Es un conjunto de reglas que permite que dos programas se comuniquen entre sí, sin que uno necesite conocer los detalles internos del otro.

Ejemplo cotidiano: cuando entrás a una app del clima, la app no "sabe" el clima por sí misma. Le pide los datos a una API meteorológica, que responde con la información. La API es el intermediario que define cómo se pide y cómo se entrega esa información.

En el contexto web, una API normalmente expone datos o funcionalidad a través de internet usando el protocolo HTTP (el mismo que usa tu navegador para cargar páginas).

## 2. Cliente y servidor

Toda comunicación de una API web tiene dos partes:

- **Cliente**: quien hace la petición (un navegador, una app móvil, otro servidor, Postman, etc.)
- **Servidor**: quien recibe la petición, procesa la lógica (por ejemplo, consulta una base de datos) y devuelve una respuesta.

El flujo siempre es: el cliente envía una **request** (petición) → el servidor la procesa → el servidor devuelve una **response** (respuesta).

## 3. Endpoints y rutas

Un **endpoint** es una URL específica combinada con un método HTTP, que representa una acción concreta sobre un recurso.

Un **recurso** es la "cosa" sobre la que actúa la API: usuarios, productos, pedidos, favoritos, etc. En tu proyecto, `productos` y `pedidos` son recursos.

Ejemplos de endpoints sobre el recurso `productos`:

- `GET /api/productos` → listar todos los productos
- `GET /api/productos/labial-mate-rojo` → obtener un producto específico (nota el `[slug]` dinámico)
- `POST /api/productos` → crear un producto nuevo
- `PUT /api/productos/labial-mate-rojo` → actualizar un producto
- `DELETE /api/productos/labial-mate-rojo` → borrar un producto

La combinación **método + ruta** es lo que identifica de forma única a cada endpoint.

## 4. Métodos HTTP (verbos)

Cada método indica qué tipo de acción se quiere realizar:

| Método | Uso | ¿Modifica datos? |
|---|---|---|
| `GET` | Leer / consultar datos | No |
| `POST` | Crear un recurso nuevo | Sí |
| `PUT` | Reemplazar un recurso completo | Sí |
| `PATCH` | Actualizar parcialmente un recurso | Sí |
| `DELETE` | Eliminar un recurso | Sí |

`GET` se considera "seguro" e "idempotente" (podés repetirlo mil veces y el resultado es siempre el mismo, sin efectos secundarios). `POST` no es idempotente: si lo repetís, podrías crear el mismo recurso varias veces.

## 5. Estructura de una petición (request)

Una request HTTP tiene estas partes:

**Método y ruta** — por ejemplo `POST /api/pedidos`

**Headers (encabezados)** — metadatos sobre la petición. Los más comunes:
- `Content-Type: application/json` → le dice al servidor que el cuerpo viene en formato JSON
- `Authorization: Bearer <token>` → credenciales de autenticación

**Query params** — parámetros en la URL después del `?`, típicos para filtros o búsquedas:
- `GET /api/productos/buscar?q=labial&categoria=maquillaje`

**Path params** — parte de la ruta que varía, como el `[slug]` o `[id]` en tu proyecto:
- `GET /api/productos/labial-mate-rojo`

**Body (cuerpo)** — los datos que se envían, normalmente en `POST`, `PUT` o `PATCH`. Ejemplo:
```json
{
  "nombre": "Labial mate rojo",
  "precio": 2500
}
```

## 6. Estructura de una respuesta (response)

**Código de estado (status code)** — un número que indica el resultado (ver sección 7).

**Headers de respuesta** — por ejemplo `Content-Type: application/json`.

**Body** — los datos devueltos, normalmente en JSON:
```json
{
  "id": 42,
  "nombre": "Labial mate rojo",
  "precio": 2500
}
```

## 7. Códigos de estado HTTP

Se agrupan por el primer dígito:

- **1xx** — Informativo (poco usado en APIs comunes)
- **2xx** — Éxito
  - `200 OK` — todo salió bien
  - `201 Created` — se creó un recurso (típico de `POST`)
  - `204 No Content` — éxito, pero no hay nada que devolver (típico de `DELETE`)
- **3xx** — Redirección
- **4xx** — Error del cliente (vos pediste algo mal)
  - `400 Bad Request` — datos inválidos
  - `401 Unauthorized` — no estás autenticado
  - `403 Forbidden` — estás autenticado, pero no tenés permiso
  - `404 Not Found` — el recurso no existe
  - `429 Too Many Requests` — superaste el límite de peticiones
- **5xx** — Error del servidor
  - `500 Internal Server Error` — algo se rompió del lado del servidor

Vimos un ejemplo real de esto en tu proyecto: `src/app/api/favoritos/route.ts` devuelve `401` cuando no hay sesión.

## 8. Formatos de datos

El formato casi universal hoy es **JSON** (JavaScript Object Notation) por ser liviano y fácil de leer tanto para humanos como para máquinas. Antes se usaba mucho XML, pero es más verboso y quedó relegado a sistemas legacy o SOAP.

## 9. Tipos de arquitecturas de API

- **REST** — la más común. Organiza todo alrededor de recursos y métodos HTTP, como venimos viendo. Es la que usa tu proyecto.
- **GraphQL** — el cliente pide exactamente los campos que necesita en una sola consulta, en vez de tener múltiples endpoints fijos. Útil cuando las pantallas necesitan combinaciones de datos muy variables.
- **gRPC** — usa un formato binario (Protocol Buffers) en vez de JSON, mucho más rápido. Común en comunicación interna entre microservicios, no tanto para APIs públicas.
- **SOAP** — un estándar más antiguo y rígido basado en XML, todavía presente en sistemas bancarios o gubernamentales.

## 10. Autenticación y autorización

Son dos conceptos distintos:

- **Autenticación** — verificar quién sos (login).
- **Autorización** — verificar qué tenés permitido hacer, una vez que ya se sabe quién sos.

Mecanismos comunes:

- **API Keys** — una clave fija que identifica a la aplicación que llama (común en APIs públicas como las de clima o mapas).
- **JWT (JSON Web Token)** — un token firmado que contiene información del usuario (como su ID). El cliente lo manda en el header `Authorization: Bearer <token>` en cada petición.
- **OAuth2** — un protocolo más complejo para delegar acceso sin compartir contraseñas (por ejemplo, "iniciar sesión con Google").
- **Sesiones basadas en cookies** — el servidor guarda el estado de sesión y el cliente solo manda una cookie identificadora.

Tu proyecto usa **NextAuth**, que maneja sesiones y tokens por vos — por eso en `favoritos/route.ts` alcanza con llamar a `auth()` para saber si hay un usuario logueado.

## 11. Validación de datos

Nunca hay que confiar en los datos que llegan del cliente. Por eso las APIs validan el `body` o los `params` antes de procesarlos: tipos correctos, campos obligatorios, rangos válidos, etc.

En tu proyecto esto se hace con **Zod** (lo ves en `src/validators/`), que define un "esquema" de cómo debe verse un dato válido y rechaza automáticamente lo que no cumple.

## 12. CORS (Cross-Origin Resource Sharing)

Por seguridad, los navegadores bloquean por defecto que una página en `dominioA.com` haga peticiones a una API en `dominioB.com`, a menos que el servidor lo permita explícitamente mediante headers CORS (`Access-Control-Allow-Origin`, etc.). Esto no aplica cuando el frontend y la API viven en el mismo dominio, como en tu proyecto Next.js (el frontend y `/api/*` son la misma aplicación).

## 13. Rate limiting

Es limitar cuántas peticiones puede hacer un mismo cliente en un período de tiempo, para evitar abuso o sobrecarga. Tu proyecto ya tiene esto implementado en `src/lib/rate-limit.ts` usando Upstash Redis.

## 14. Versionado de APIs

Cuando una API cambia de forma que rompe compatibilidad con clientes existentes, se suele versionar, por ejemplo `/api/v1/productos` vs `/api/v2/productos`. Así los clientes viejos siguen funcionando mientras los nuevos usan la versión actualizada.

## 15. Documentación

Las APIs bien diseñadas se documentan para que otros desarrolladores (o vos mismo en el futuro) sepan qué endpoints existen, qué reciben y qué devuelven. El estándar más usado es **OpenAPI** (antes llamado Swagger), que describe la API en un archivo y puede generar documentación interactiva automáticamente.

## 16. Cómo probar una API

- **curl** — línea de comandos, rápido para pruebas simples:
  ```bash
  curl -X POST http://localhost:3000/api/pedidos \
    -H "Content-Type: application/json" \
    -d '{"producto_id": 42, "cantidad": 2}'
  ```
- **Postman / Insomnia** — herramientas con interfaz gráfica para armar y guardar colecciones de peticiones.
- **Tests automatizados** — código que verifica que los endpoints respondan correctamente (ejemplo: Jest, Vitest).

## 17. Buenas prácticas de diseño REST

Usar sustantivos en plural para los recursos (`/productos`, no `/getProductos`). Dejar que el método HTTP indique la acción, no el nombre de la ruta. Devolver códigos de estado correctos y consistentes. Validar siempre la entrada. No exponer información sensible en las respuestas (contraseñas, tokens internos). Usar HTTPS siempre, nunca HTTP plano, para que los datos viajen cifrados.

## 18. Seguridad básica

Además de HTTPS y autenticación, es importante: sanitizar entradas para evitar inyección SQL (Prisma, que usa tu proyecto, ya protege contra esto automáticamente), no confiar nunca en datos del cliente sin validar, usar rate limiting para evitar ataques de fuerza bruta, y mantener las dependencias actualizadas.

## 19. Resumen aplicado a tu proyecto

Tu proyecto es una API REST construida con las convenciones de Next.js (App Router):

- Cada carpeta en `src/app/api/` es una ruta, y cada `route.ts` exporta funciones (`GET`, `POST`, etc.) que son los endpoints.
- Las carpetas entre corchetes (`[id]`, `[slug]`) son parámetros dinámicos de ruta.
- `NextAuth` maneja autenticación y sesiones.
- `Zod` valida los datos de entrada.
- `Prisma` es el intermediario con la base de datos SQL Server (evita SQL injection y estructura las consultas).
- `Upstash` implementa rate limiting.
- La lógica de negocio vive separada en `src/server/services/` y `src/server/repositories/`, para que los `route.ts` se mantengan simples y solo coordinen la petición y la respuesta.

Con estos 19 puntos ya tenés el mapa completo: qué es una API, cómo se estructura una petición y una respuesta, cómo se autentica, cómo se valida, cómo se documenta y prueba, y cómo se aplica todo esto concretamente en tu propio código.
