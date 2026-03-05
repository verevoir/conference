# Verevoir Conference

A delegate-first conference website powered by [Verevoir](https://github.com/adsurg/next-lake), backed by GCP services (AlloyDB, GCS, Google OAuth). Organisers manage all content through an admin interface. Delegates browse the programme, build a personal schedule, and submit talk feedback.

## What this demonstrates

This is a production-grade application showcasing all six Verevoir packages working together:

- **@verevoir/schema** — 12 content models (talks, speakers, tracks, sponsors, schedule slots, blog posts, pages, organisers, highlights, feedback, bookmarks, config)
- **@verevoir/storage** — PostgresAdapter for AlloyDB persistence
- **@verevoir/editor** — Admin content editing UI with custom field overrides
- **@verevoir/access** — Google OAuth, role-based policies (organiser/delegate/viewer), publishing workflows (talks, blog, pages)
- **@verevoir/assets** — GcsBlobStore for binary storage, AssetManager for upload/metadata/tags/attribution
- **@verevoir/media** — imgproxy URL generation, image blocks, hotspot editing

## Architecture

- **One Next.js app, two audiences** — `/admin/*` routes for organisers, public routes for delegates/visitors
- **Server Actions** for all data operations (PostgresAdapter and GcsBlobStore are Node-only)
- **Blob serving** via `/api/blobs/[blobKey]` API route
- **Auth modes** — `AUTH_MODE=test` for local dev (instant role switching), omit for real Google OAuth
- **Standalone output** for Docker/Cloud Run deployment
- **Content controls** — self-contained units in `src/controls/` (heading, paragraph, image, quote, cta), each co-locating schema, editor, and renderer
- **Page versioning** — multiple document versions per slug with publish/unpublish/archive workflow; public routes serve only the published version, with `?preview=<docId>` for draft preview

## Setup

```bash
cp .env.example .env  # configure environment variables
npm install
make run              # starts dev server (AUTH_MODE=test by default)
```

### Environment variables

See `.env.example` for the full list. Key variables:

| Variable                       | Description                                                       |
| ------------------------------ | ----------------------------------------------------------------- |
| `DATABASE_URL`                 | Postgres/AlloyDB connection string                                |
| `GCS_BUCKET`                   | Google Cloud Storage bucket for assets                            |
| `AUTH_MODE`                    | Set to `test` for local dev with test accounts                    |
| `GOOGLE_CLIENT_ID`             | Google OAuth client ID (production auth)                          |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same client ID, exposed to browser for Google Sign-In             |
| `SEED_ADMIN_ID`                | Google sub ID that gets auto-promoted to organiser on first login |

## Commands

| Command             | Description                         |
| ------------------- | ----------------------------------- |
| `make build`        | Production build                    |
| `make test`         | Lint + Vitest test suite            |
| `make lint`         | eslint + prettier check             |
| `make run`          | Start dev server (`AUTH_MODE=test`) |
| `make docker-build` | Build Docker image                  |

## Deployment

Infrastructure is defined in `infra/` as Terraform modules targeting GCP:

- **Cloud Run** — containerised Next.js app (standalone output)
- **AlloyDB** — managed Postgres for content and asset metadata (password auto-generated, stored in Secret Manager)
- **GCS** — blob storage for uploaded assets
- **HTTPS Load Balancer** — Google-managed SSL certificate
- **IAM** — service account bindings (storage, AlloyDB, Secret Manager)

See [docs/deployment.md](docs/deployment.md) for the full first-deploy walkthrough, or `infra/terraform.tfvars.example` for required configuration.
