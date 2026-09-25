# EduTech Web

EduTech Web is the greenfield web foundation for an education workflow management system used by language institutes. Phase 0 establishes technical infrastructure only; it deliberately includes no students, teachers, classes, books, exams, authentication, or other business features.

## Stack

- **Web:** Next.js, TypeScript, and the App Router
- **API:** NestJS and TypeScript
- **Database:** PostgreSQL (local development through Docker Compose)
- **Database access:** Drizzle ORM with the PostgreSQL driver
- **Tooling:** pnpm workspaces, ESLint, Prettier, EditorConfig, and Zod-based runtime environment validation

## Repository layout

```text
apps/
  api/                  NestJS API and isolated database infrastructure
  web/                  Next.js App Router application
infrastructure/         Reserved for future local infrastructure assets
package.json            Workspace scripts
docker-compose.yml      Local PostgreSQL only
.env.example            Safe local environment template
```

The API keeps its database adapter under `src/infrastructure`. The health endpoint has a small framework-independent application operation; its Nest controller only translates `GET /health` into that operation. No domain layer is defined until the domain model is reviewed.

## Prerequisites

- Node.js 22 or newer
- pnpm 10 or newer (enable with `corepack enable` if necessary)
- Docker Engine with the Docker Compose plugin

## Setup

1. Create a local environment file and choose safe, local PostgreSQL credentials:

   ```bash
   cp .env.example .env
   ```

2. Install workspace dependencies:

   ```bash
   pnpm install
   ```

3. Start PostgreSQL:

   ```bash
   pnpm db:up
   ```

   Confirm it is healthy with `docker compose ps` or follow its logs with `pnpm db:logs`.

4. In one terminal, run the API:

   ```bash
   pnpm dev:api
   ```

5. In a second terminal, run the web app:

   ```bash
   pnpm dev:web
   ```

   Or run both processes together with `pnpm dev`.

Open [http://localhost:3000](http://localhost:3000). The intentionally minimal page calls the API health endpoint from the browser and displays its response.

## Verify the API

With PostgreSQL and the API running, execute:

```bash
curl http://localhost:3001/health
```

The response includes `status`, `version`, `environment`, and a `database` value of `connected`. A disconnected database produces a `degraded` response rather than hiding the API process failure.

## Environment configuration

`.env.example` documents all Phase 0 variables:

- `DATABASE_URL`: PostgreSQL connection string used solely by the API and Drizzle CLI.
- `NODE_ENV`: runtime environment (`development`, `test`, or `production`).
- `API_PORT`: API listening port (defaults to `3001`).
- `NEXT_PUBLIC_API_BASE_URL`: browser-visible base URL for the health-check request only.
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`: values consumed by Docker Compose for local PostgreSQL.

Do not commit `.env` files or production credentials. Values prefixed with `NEXT_PUBLIC_` are intentionally visible in browser bundles; no server secret uses that prefix.

## Database and Drizzle

Drizzle is configured in `apps/api/drizzle.config.ts`, and the database service creates a PostgreSQL-backed Drizzle client. Phase 0 intentionally declares **no tables** and has no migration to run. Once a reviewed domain model exists, add schemas in `apps/api/src/infrastructure/database/schema.ts` and generate migrations with:

```bash
pnpm db:generate
```

## Quality checks

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
```

## Git workflow

The intended branch naming is `main`, `develop`, and short-lived `feature/*` branches. Use Conventional Commit messages, for example `feat(api): add health endpoint` or `chore: configure workspace tooling`.
