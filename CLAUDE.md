# Verevoir Conference

A production-grade conference website powered by Verevoir, backed by GCP services (AlloyDB, GCS, Google OAuth). Full conference lifecycle — from call for papers through to live event and archive. Integrates `@verevoir/commerce` for ticketing and merchandise, `@verevoir/bookings` for capacity-managed ticket batches.

## Architecture

- **One Next.js app** — `/admin/*` routes for organisers, public routes for presenters/delegates/visitors
- **Server Actions** for all data operations (PostgresAdapter and GcsBlobStore are Node-only)
- **Blob serving** via `/api/blobs/[blobKey]` API route
- **Auth modes**: `AUTH_MODE=test` for local dev, omit for real Google OAuth
- **Standalone output** for Docker/Cloud Run deployment
- **LLM integration** — optional Anthropic API for asset alt text, copy assist, and proposal analysis (env-gated via `ANTHROPIC_API_KEY`)
- **Conference lifecycle** — state machine on the `config` singleton drives the entire event: setup → cfp → cfp-review → voting → curation → registration → pre-conference → live → archive

## Structure

- `src/blocks/` — Content model definitions (18 block types)
- `src/controls/` — Content controls (heading, paragraph, image, quote, cta) — each defines schema, editor, and renderer
- `src/access/` — Policy (organiser/presenter/delegate/viewer roles) and workflows (conference lifecycle, proposal review, talk/blog/page publishing)
- `src/server/` — Server singletons (db, blob-store, asset-manager, llm, asset-analyzer, auth, roles, require-organiser, require-authenticated, phase)
- `src/actions/` — Server Actions (documents, pages, assets, auth, roles, feedback, bookmarks, proposals, votes, phase, registration, shop)
- `src/lib/` — Serialization helpers for Server Action return values
- `src/context/` — UserContext (identity, auth, policy, workflows, lifecycle)
- `src/components/admin/` — Admin UI components (document editor, proposal review, phase dashboard, schedule builder, config editor)
- `src/components/public/` — Public site components (proposal form, voting, ticket registration, swag shop, feedback, bookmarks)
- `src/app/admin/` — Admin routes
- `src/app/` — Public routes (cfp, vote, register, shop, schedule, speakers, etc.)
- `src/app/api/` — API routes (blob serving)
- `tests/` — Vitest tests (policy, auth, require-organiser)
- `project-infra/` — Project-level Terraform (Workload Identity Federation, CI service account)
- `infra/` — Environment Terraform (Cloud Run, AlloyDB, GCS, networking, LB)
- `.github/workflows/` — CI/CD (deploy on push to main)
- `docs/deployment.md` — GCP first-deploy and update guide

## Content Models

18 block types: talk, talk-proposal, vote, speaker, track, sponsor, schedule-slot, post, page, organiser, highlight, feedback, bookmark, config, ticket-batch, ticket-booking, swag-product, swag-order.

## Conference Lifecycle

The `config` block has a `phase` field that drives the entire conference:

| Phase              | Who's active            | What happens                                                  |
| ------------------ | ----------------------- | ------------------------------------------------------------- |
| **setup**          | Organisers              | Build programme structure — tracks, sponsors, schedule        |
| **cfp**            | Organisers + Presenters | Speakers self-register, propose talks (max N per person)      |
| **cfp-review**     | Organisers              | Review proposals, LLM analysis (précis + flags)               |
| **voting**         | Everyone                | Public voting on accepted proposals                           |
| **curation**       | Organisers              | Final programme selection, promote proposals to talks         |
| **registration**   | Everyone                | Ticket batches on sale (bookings), swag shop opens (commerce) |
| **pre-conference** | Everyone                | Schedule published, personal schedule building                |
| **live**           | Everyone                | Session feedback, live schedule                               |
| **archive**        | Everyone (read-only)    | Static archive                                                |

## Roles

- **organiser** — full CRUD, advance lifecycle, review proposals, manage everything
- **presenter** — read public content, create/edit own speaker profile, submit/edit own proposals (max N)
- **delegate** — read published content, vote, buy tickets, bookmark talks, submit feedback
- **viewer** — read published content only (anonymous users)

## Pages

Pages use a versioning model — multiple documents per slug with `version` number and `status` (draft/published/archived). At most one published version per slug. Content is a polymorphic array of content blocks, each backed by a control from `src/controls/`. The public `[slug]` route serves only published pages; `?preview=<docId>` loads a specific version for preview.

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
