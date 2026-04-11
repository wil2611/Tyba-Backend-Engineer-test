# Tyba Backend 

La API esta implementada en NestJS y vive dentro de la carpeta `api/`.

## Objetivo de la prueba

Implementar una API REST con:

- Registro de usuario
- Login de usuario
- Logout de usuario
- Endpoint protegido para buscar restaurantes por ciudad o coordenadas
- Endpoint protegido para consultar el historial de acciones del usuario

Acciones auditadas:

- `SIGNUP`
- `LOGIN`
- `LOGOUT`
- `RESTAURANTS_SEARCH`

## Stack que use

- Node.js + NestJS
- Prisma + PostgreSQL
- JWT para autenticacion
- Swagger para documentacion
- Jest + Supertest para pruebas e2e
- Docker + Docker Compose (bonus)

## Estructura del proyecto

```txt
api/
  src/
    modules/
      auth/
      users/
      user-actions/
      restaurants/
      prisma/
    config/
    common/
  prisma/
    migrations/
  test/
  Dockerfile
  docker-compose.yml
```

## Variables de entorno

Archivo: `api/.env`

Puedes partir de `api/.env.example`.

Variables usadas por la API:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `RESTAURANTS_API_KEY`
- `RESTAURANTS_BASE_URL`
- `GEOCODING_BASE_URL`
- `HTTP_TIMEOUT_MS`

Ejemplo rapido:
Usa db en lugar de localhost si corres con Docker.
```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/mi_base?schema=public
JWT_SECRET=un_secreto_largo
JWT_EXPIRES_IN=1d
RESTAURANTS_API_KEY=tu_api_key_geoapify
RESTAURANTS_BASE_URL=https://api.geoapify.com/v2/places
GEOCODING_BASE_URL=https://api.geoapify.com/v1/geocode/search
HTTP_TIMEOUT_MS=8000
```

## Como correr local (sin Docker)

Desde la raiz del repo:

```bash
cd api
npm install
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

La API queda en:

- `http://localhost:3000`

Swagger:

- `http://localhost:3000/docs`

## Como correr con Docker (bonus)

Desde `api/`:

```bash
docker compose up --build
```

Esto levanta:

- `tyba-postgres`
- `tyba-api`

Para parar:

```bash
docker compose down
```

Para limpiar volumen de base de datos:

```bash
docker compose down -v
```

## Endpoints implementados

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout` (requiere bearer token)

### Restaurants

- `GET /restaurants/nearby?city=Bogota` (requiere bearer token)
- `GET /restaurants/nearby?lat=4.7110&lng=-74.0721` (requiere bearer token)

### User actions

- `GET /user-actions/me?page=1&limit=20` (requiere bearer token)

## Flujo rapido para probar en Swagger

1. Crear usuario en `POST /auth/signup`.
2. Copiar `accessToken` de la respuesta.
3. Ir al boton `Authorize` y pegar el token.
4. Probar `GET /restaurants/nearby`.
5. Probar `GET /user-actions/me` y validar acciones registradas.

## Pruebas automatizadas

Desde `api/`:

```bash
npm run test:e2e
```

Actualmente la suite e2e valida:

- signup exitoso y signup duplicado
- validacion de email/password invalido
- login exitoso e invalido
- rutas protegidas sin token (401)
- historial del usuario autenticado
- logout y registro de accion en historial
- busqueda de restaurantes con ciudad y con coordenadas

Nota: los casos de restaurantes dependen de un api externo (Geoapify), por eso pueden ser mas lentos o fallar si hay timeout.

## Decisiones tecnicas que tome

- Passwords con `bcrypt` (nunca se guarda password plano).
- Email normalizado para evitar duplicados por mayusculas/minusculas.
- JWT stateless para proteger endpoints.
- `logout` registra el evento, no invalida token en servidor (tradeoff simple para esta prueba).
- Auditoria en tabla `UserAction` con metadata, ip y user-agent.
- Validaciones de entrada con DTO + `ValidationPipe` global.
- Configuracion por `.env`.


## Mejoras que haria con mas tiempo

- Separar tests e2e de integracion externa.
- Agregar rate limiting a endpoints de auth.
- Pipeline CI (lint + tests + build).
