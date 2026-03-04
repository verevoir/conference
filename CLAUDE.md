# NextLake Conference

A delegate-first conference website powered by NextLake, backed by GCP services (AlloyDB, GCS, Google OAuth). Organisers manage all content through an admin interface. Delegates use the public site to browse the programme, build a personal schedule, and submit talk feedback.

## Architecture

- **One Next.js app** — `/admin/*` routes for organisers, public routes for delegates/visitors
- **Server Actions** for all data operations (PostgresAdapter and GcsBlobStore are Node-only)
- **Blob serving** via `/api/blobs/[blobKey]` API route
- **Auth modes**: `AUTH_MODE=test` for local dev, omit for real Google OAuth
- **Standalone output** for Docker/Cloud Run deployment

## Structure

- `src/blocks/` — Content model definitions (talk, speaker, track, sponsor, schedule-slot, post, page, organiser, highlight, feedback, bookmark, config)
- `src/access/` — Policy (organiser/delegate/viewer roles) and workflows (talk + blog publishing)
- `src/server/` — Server singletons (db, blob-store, asset-manager, auth, roles, require-organiser)
- `src/actions/` — Server Actions (documents, assets, auth, roles, feedback, bookmarks)
- `src/lib/` — Serialization helpers for Server Action return values
- `src/context/` — UserContext (identity, auth, policy, workflows)
- `src/components/admin/` — Admin UI components
- `src/components/public/` — Public site components
- `src/app/admin/` — Admin routes
- `src/app/` — Public routes
- `src/app/api/` — API routes (blob serving)
- `tests/` — Vitest tests (policy, auth, require-organiser)
- `infra/` — Terraform for GCP deployment
- `docs/deployment.md` — GCP first-deploy and update guide

## Content Models

12 block types: talk, speaker, track, sponsor, schedule-slot, post, page, organiser, highlight, feedback, bookmark, config.

## Roles

- **organiser** — full CRUD, publish talks, manage schedule/sponsors/team/highlights/roles, view feedback
- **delegate** — read published content, bookmark talks (own), submit feedback (own)
- **viewer** — read published content only (anonymous users)

## Setup

```bash
cp .env.example .env  # configure environment
npm install
make run              # starts dev server with AUTH_MODE=test
```

## Commands

- `make build` — production build
- `make test` — lint + vitest
- `make lint` — eslint + prettier check
- `make run` — start dev server (AUTH_MODE=test)
- `make docker-build` — build Docker image
