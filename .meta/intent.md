# Intent — Verevoir Conference

## Purpose

Provide a production-grade conference website that showcases all six Verevoir packages working together in a real-world scenario. The platform serves two audiences: organisers who manage content through an admin interface, and delegates who browse the programme, build personal schedules, and provide talk feedback.

## Goals

- Demonstrate every Verevoir package in a realistic, non-trivial application context
- Provide a delegate-first experience with personal schedule bookmarking and post-talk feedback
- Support two deployment modes: local development (test accounts, in-memory) and production (GCP services)
- Be open-sourceable as a standalone conference platform
- Prove that Verevoir works with production databases and cloud storage

## Non-goals

- Call for papers (CFP) flow — talks are curated by organisers
- Public voting — replaced by post-talk feedback (rating + comment)
- Multi-tenancy — one deployment per conference
- Real-time features — standard request/response patterns only
- Custom CMS for content modelling — uses Verevoir's schema engine directly

## Key design decisions

- **One Next.js app, two audiences.** Admin routes under `/admin/*` and public routes at the top level. This avoids the overhead of two separate deployments while keeping the concerns cleanly separated via route layouts.
- **Server Actions for all mutations.** PostgresAdapter and GcsBlobStore are Node-only. Server Actions keep database and blob operations on the server while providing a clean client API.
- **Blob serving via API route.** GCS blobs are served through `/api/blobs/[blobKey]` with aggressive caching headers, avoiding the need for signed URLs or a separate CDN for MVP.
- **AUTH_MODE switch.** Test accounts for local development with instant role switching. Google OAuth for production with role store for persistent role assignments. Default role for authenticated Google users is `delegate`.
- **Feedback, not voting.** Delegates rate talks 1-5 and optionally comment after attending. One submission per delegate per talk. Organisers see aggregate feedback. This is more actionable than pre-talk popularity voting.
- **Personal schedule via bookmarks.** Delegates bookmark talks they want to attend. The `/my-schedule` page filters the full schedule to their selections. Simple, stateless, no sync conflicts.

## Constraints

- Must build and deploy as a standalone Next.js application
- All database operations go through `@verevoir/storage` StorageAdapter interface
- All binary operations go through `@verevoir/assets` BlobStore interface
- Must work with `AUTH_MODE=test` for local development with no external dependencies beyond Postgres
- Content models defined using `@verevoir/schema` — no ad-hoc data shapes
