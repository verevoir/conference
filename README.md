# NextLake Conference

A delegate-first conference website powered by [NextLake](https://github.com/adsurg/next-lake), backed by GCP services (AlloyDB, GCS, Google OAuth). Organisers manage all content through an admin interface. Delegates browse the programme, build a personal schedule, and submit talk feedback.

## What this demonstrates

This is a production-grade application showcasing all six NextLake packages working together:

- **@nextlake/schema** — 12 content models (talks, speakers, tracks, sponsors, schedule slots, blog posts, pages, organisers, highlights, feedback, bookmarks, config)
- **@nextlake/storage** — PostgresAdapter for AlloyDB persistence
- **@nextlake/editor** — Admin content editing UI with custom field overrides (StatusField, HeroImageField)
- **@nextlake/access** — Google OAuth, role-based policies (organiser/delegate/viewer), publishing workflows
- **@nextlake/assets** — GcsBlobStore for binary storage, AssetManager for upload/metadata
- **@nextlake/media** — imgproxy URL generation, image blocks, hotspot editing

## Architecture

- **One Next.js app, two audiences** — `/admin/*` routes for organisers, public routes for delegates/visitors
- **Server Actions** for all data operations (PostgresAdapter and GcsBlobStore are Node-only)
- **Blob serving** via `/api/blobs/[blobKey]` API route
- **Auth modes** — `AUTH_MODE=test` for local dev (instant role switching), omit for real Google OAuth
- **Standalone output** for Docker/Cloud Run deployment

## Setup

```bash
cp .env.example .env  # configure environment variables
npm install
make run              # starts dev server (AUTH_MODE=test by default)
```

### Environment variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres/AlloyDB connection string |
| `GCS_BUCKET` | Google Cloud Storage bucket for assets |
| `AUTH_MODE` | Set to `test` for local dev with test accounts |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (production auth) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same client ID, exposed to browser for Google Sign-In |
| `SEED_ADMIN_ID` | Google sub ID that gets auto-promoted to organiser on first login |

## Commands

| Command | Description |
|---------|-------------|
| `make build` | Production build |
| `make test` | Lint check (eslint + prettier) |
| `make run` | Start dev server (`AUTH_MODE=test`) |
| `make docker-build` | Build Docker image |

## Deployment

Infrastructure is defined in `infra/` as Terraform modules targeting GCP:

- **Cloud Run** — containerised Next.js app (standalone output)
- **AlloyDB** — managed Postgres for content and asset metadata
- **GCS** — blob storage for uploaded assets
- **IAM** — service account bindings

See `infra/terraform.tfvars.example` for required configuration.
