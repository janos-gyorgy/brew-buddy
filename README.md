# Brew Buddy

A self-hosted kombucha brewing tracker. Manage recipes, track batches through their fermentation lifecycle, log pH/Brix/temperature observations, and record second-fermentation variants and botanical infusions.

Built to run on Kubernetes via a Helm chart, with no external dependencies beyond a PostgreSQL database.

| Batch detail with fermentation log | Statistics (dark mode) |
|---|---|
| ![Batch detail with fermentation log](docs/batch-detail.png) | ![Statistics in dark mode](docs/statistics-dark.png) |

## Features

- **Recipes** — brewing recipe templates with ingredients and process notes; botanical infusions managed per recipe
- **Batches** — full lifecycle tracking (`planned → active → conditioning → finished`) referencing a recipe
- **Fermentation log** — time-series observations per batch (pH, Brix, temperature, tasting notes)
- **F2 variants** — second-fermentation bottles split from a batch, each with its own flavour profile
- **Starter log** — SCOBY and starter culture tracking
- **Statistics** — batch summary and trend views
- **Export** — full data export as JSON
- **Dark mode** — persisted to localStorage

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Vite, TypeScript, TanStack Query, shadcn/ui, Tailwind CSS |
| Backend | Hono, TypeScript, Drizzle ORM |
| Database | PostgreSQL |
| Deployment | Helm chart, nginx (frontend), Kubernetes |

## Running locally

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Start the backend (requires a running PostgreSQL instance)
export DATABASE_URL="postgresql://user:pass@localhost:5432/hippotion"
cd server && npm run dev &

# Start the frontend (proxies /api to backend via Vite config)
npm run dev
```

Open http://localhost:5173

## Deploying on Kubernetes

The Helm chart in `helm/brew-muse/` (the chart and image names predate the repo name and are kept for deployment compatibility) deploys:
- nginx frontend container
- Hono API container
- PostgreSQL StatefulSet (optional — disable and set `DATABASE_URL` to use an external database)

```bash
# Build and load images onto your node (k3s example)
docker build -t brew-muse:latest .
docker build -f Dockerfile.server -t brew-muse-api:latest .
docker save brew-muse:latest | k3s ctr images import -
docker save brew-muse-api:latest | k3s ctr images import -

# Install the Helm chart
helm install hippotion ./helm/brew-muse \
  --namespace hippotion \
  --create-namespace \
  --set postgres.password=<your-password>
```

Key values:

| Value | Default | Description |
|-------|---------|-------------|
| `postgres.password` | `""` | **Required.** PostgreSQL password |
| `postgres.enabled` | `true` | Deploy in-cluster PostgreSQL StatefulSet |
| `api.env.DATABASE_URL` | auto-constructed | Override if using an external database |
| `ingress.hosts[0].host` | `brew-muse.local` | Hostname for the ingress rule |
| `postgres.storage` | `5Gi` | PVC size for the PostgreSQL StatefulSet |

## Project structure

```
src/                    # React frontend
  pages/                # one file per route
  components/
    ui/                 # shadcn/ui primitives (do not edit manually)
    Layout.tsx          # shared shell with nav and dark mode toggle
  lib/
    api.ts              # thin fetch wrapper (api.get/post/put/patch/delete)
    types.ts            # TypeScript interfaces mirroring the DB schema
    validationSchemas.ts # Zod schemas used in forms

server/src/             # Hono backend
  index.ts              # app setup, mounts all routers under /api/
  schema.ts             # Drizzle schema — single source of truth for DB tables
  db.ts                 # Drizzle client (reads DATABASE_URL)
  routes/               # one file per resource

helm/brew-muse/         # Helm chart for Kubernetes deployment
```

## License

MIT
