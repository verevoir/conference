# Verevoir Conference

A delegate-first conference website powered by Verevoir, backed by GCP services (AlloyDB, GCS, Google OAuth). Organisers manage all content through an admin interface. Delegates use the public site to browse the programme, build a personal schedule, and submit talk feedback.

## Architecture

- **One Next.js app** — `/admin/*` routes for organisers, public routes for delegates/visitors
- **Server Actions** for all data operations (PostgresAdapter and GcsBlobStore are Node-only)
- **Blob serving** via `/api/blobs/[blobKey]` API route
- **Auth modes**: `AUTH_MODE=test` for local dev, omit for real Google OAuth
- **Standalone output** for Docker/Cloud Run deployment
- **LLM integration** — optional Anthropic API for auto-generating asset alt text and tags on upload (env-gated via `ANTHROPIC_API_KEY`)

## Structure

- `src/blocks/` — Content model definitions (talk, speaker, track, sponsor, schedule-slot, post, page, organiser, highlight, feedback, bookmark, config)
- `src/controls/` — Content controls (heading, paragraph, image, quote, cta) — each defines schema, editor, and renderer
- `src/access/` — Policy (organiser/delegate/viewer roles) and workflows (talk, blog, and page publishing)
- `src/server/` — Server singletons (db, blob-store, asset-manager, llm, asset-analyzer, auth, roles, require-organiser)
- `src/actions/` — Server Actions (documents, pages, assets, auth, roles, feedback, bookmarks)
- `src/lib/` — Serialization helpers for Server Action return values
- `src/context/` — UserContext (identity, auth, policy, workflows)
- `src/components/admin/` — Admin UI components
- `src/components/public/` — Public site components
- `src/app/admin/` — Admin routes
- `src/app/` — Public routes
- `src/app/api/` — API routes (blob serving)
- `tests/` — Vitest tests (policy, auth, require-organiser)
- `project-infra/` — Project-level Terraform (Workload Identity Federation, CI service account)
- `infra/` — Environment Terraform (Cloud Run, AlloyDB, GCS, networking, LB)
- `.github/workflows/` — CI/CD (deploy on push to main)
- `docs/deployment.md` — GCP first-deploy and update guide

## Content Models

12 block types: talk, speaker, track, sponsor, schedule-slot, post, page, organiser, highlight, feedback, bookmark, config.

## Pages

Pages use a versioning model — multiple documents per slug with `version` number and `status` (draft/published/archived). At most one published version per slug. Content is a polymorphic array of content blocks, each backed by a control from `src/controls/`. The public `[slug]` route serves only published pages; `?preview=<docId>` loads a specific version for preview.

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
