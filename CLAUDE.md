# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

HipPotion is a kombucha brewing tracker. It is a self-hosted web app for managing fermentation recipes, batches, F2 variants, botanical infusions, and a starter log.

The project is split into two parts:
- **Frontend** (`/`): React + Vite SPA
- **Backend** (`/server`): Hono API server with Drizzle ORM + PostgreSQL

## Commands

### Frontend
```sh
npm run dev        # start Vite dev server
npm run build      # production build
npm run lint       # ESLint
```

### Backend
```sh
cd server
npm run dev        # start API server with hot reload (tsx watch)
npm run build      # compile TypeScript
npm run start      # run compiled output
```

There is no test suite currently.

## Architecture

### Frontend → Backend communication
In development, Vite proxies `/api/*` to the backend (check `vite.config.ts` if added). In production (Kubernetes/Helm), nginx proxies `/api` to the API service. The frontend uses a thin `src/lib/api.ts` wrapper (`api.get/post/put/patch/delete`) over `fetch`. All data fetching is done with TanStack Query.

### Frontend structure
- `src/pages/` — one file per route; pages handle data fetching and contain most logic
- `src/components/Layout.tsx` — shared shell with nav, dark mode toggle (persisted to `localStorage`), and data export button
- `src/components/ui/` — shadcn/ui primitives, do not edit manually
- `src/lib/types.ts` — shared TypeScript interfaces mirroring the DB schema
- `src/lib/validationSchemas.ts` — Zod schemas used in forms

### Backend structure
- `server/src/index.ts` — Hono app setup; mounts all routers under `/api/`
- `server/src/schema.ts` — single source of truth for the DB schema (Drizzle)
- `server/src/db.ts` — Drizzle client, reads `DATABASE_URL` from env
- `server/src/routes/` — one file per resource: `recipes`, `batches`, `logs`, `f2-variants`, `botanicals`, `starter-log`, `statistics`, `export`

### Domain model (DB tables)
- `recipes` — brewing recipe templates
- `batches` — actual brew batches, reference a recipe, have a `BatchStatus` lifecycle
- `fermentation_log_entries` — time-series observations per batch (pH, Brix, temp, etc.)
- `f2_variant_batches` — second-fermentation bottles split from a batch
- `starter_log` — SCOBY/starter tracking
- `botanical_infusions` — ingredient infusion recipes

### Deployment
A Helm chart in `helm/brew-muse/` deploys:
- nginx frontend container
- Hono API container (env: `DATABASE_URL`, `PORT`)
- PostgreSQL StatefulSet (in-cluster, or disable and point `DATABASE_URL` elsewhere)

The frontend container receives `API_BACKEND_URL` via a ConfigMap; nginx uses it to proxy `/api` requests.
