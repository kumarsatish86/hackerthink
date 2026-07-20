# AI Models Module

This document describes the schema, APIs, and page architecture behind the
`/models/*` section of HackerThink (public browsing/detail/compare pages) and
the `/admin/content/models/*` section (admin CRUD + AI docs generation).

It complements the auto-generated snapshot in
[`docs/models-schema-inventory.md`](./models-schema-inventory.md) (regenerate
that file any time with `node scripts/inventory-models-schema.mjs`).

## 1. Schema map

### 1.1 Core table: `ai_models`

One row per model. Besides the original columns (name, slug, developer,
description, parameters, license, pricing, categories/tags/capabilities as
JSONB arrays, rating/download/view counters, SEO fields, etc.), the
`001_models_module_rebuild.sql` migration adds:

| Column | Type | Purpose |
| --- | --- | --- |
| `verified`, `security_badge`, `compatibility_badge` | boolean | Trust badges shown on the model card/hero |
| `task`, `framework` | varchar | Normalized HuggingFace-style task/framework, used by the docs generator |
| `input_types`, `output_types` | jsonb array | Modality metadata (e.g. `["text"]` / `["text"]`) |
| `param_count_b` | numeric | Parsed parameter count in billions, used for VRAM estimates |
| `model_size_bytes`, `trending_rank`, `likes_count`, `stars_count` | numeric/int | Popularity signals |
| `playground_config` | jsonb object | `{ demo_url, embed_url, api_url, api_key, modality, space_id }` — powers `/api/models/[slug]/playground` |
| `ai_summary` | jsonb object | `{ what, who, when_to_use, when_not_to_use, advantages[], limitations[], ideal_use_cases[], difficulty }` |
| `quick_facts` | jsonb object | Flat key/value facts panel (task, model_size, memory_usage, gpu_requirement, ...) |
| `compatibility_matrix` | jsonb object | Boolean/partial support flags per runtime (pytorch, onnx, vllm, docker, ...) |
| `overview_guidance` | jsonb object | Requirements, dependencies, strengths/weaknesses, best practices, etc. |
| `external_model_id`, `model_family`, `architecture_family` | varchar | Import/dedup metadata (e.g. HuggingFace `org/model`) |
| `evaluation_summary`, `known_biases`, `safety_results`, `ethical_risks` | text/jsonb | Safety/eval notes |

Run `node scripts/apply-models-migrations.mjs` any time to (idempotently)
apply `src/lib/migrations/sql/001_models_module_rebuild.sql` and
`002_models_backfill_from_json.sql` — see §2.

### 1.2 Satellite tables

Each satellite table has a `model_id` FK to `ai_models(id)` with
`ON DELETE CASCADE`, so deleting a model cleans up everything below.

| Table | Used for | Public read | Admin CRUD |
| --- | --- | --- | --- |
| `model_benchmarks` | Score/metric/dataset per benchmark | Benchmarks section | Docs editor → Benchmarks tab |
| `model_versions` / `model_changelog` | Release history | Changelog section | `/api/models/[slug]/changelog` |
| `model_variants` | Sibling checkpoints (sizes/quantizations) | Variants section | Docs editor → Relations tab |
| `model_training_data` | Linked training datasets | Training Data section | `/api/models/[slug]/training-data` |
| `model_usage_examples` | Runnable code snippets | Usage Examples section | Docs editor → Usage tab |
| `model_install_guides` | pip/conda/Docker/vLLM/TGI/... install snippets | Installation section | Docs editor → Install tab |
| `model_architecture_nodes` | Step-by-step architecture breakdown | Architecture section | (regenerated; relations API supports `type=architecture_nodes`) |
| `model_faqs` | Q&A pairs + `FAQPage` schema.org markup | FAQ section | Docs editor → FAQs tab |
| `model_tutorials` | Curated learning links | Tutorials section | (seeded once; relations API supports `type=tutorials`) |
| `model_papers` | Research papers (original/related/benchmark/survey) | Papers section | Docs editor → Papers tab |
| `model_use_case_cards` | Industry use-case cards | Use Cases section | (relations API supports `type=use_case_cards`) |
| `model_api_docs` | REST/cURL/JS/Python playground doc snippets | API Docs section | (relations API supports `type=api_docs`) |
| `model_security_notes` | Data privacy / bias / license / misuse notes | Security & Compliance section | Docs editor → Security tab |
| `model_comparisons` | Peer models for head-to-head comparison | Comparison section | Docs editor → Relations tab |
| `model_community_links` | Discord/Reddit/forum links | Community section | Docs editor → Relations tab |
| `model_comments`, `model_bookmarks`, `model_reports` | User engagement | Comments/bookmarks/report widgets | n/a (user-authenticated routes) |
| `model_download_daily` | Daily download rollups | Download analytics sparkline | n/a (cron/import job) |

Legacy tables `ai_model_benchmarks` / `ai_model_versions` are kept for
backwards compatibility; `001_models_module_rebuild.sql` backfills their rows
into `model_benchmarks` / `model_versions` once and new code should read/write
the `model_*` tables going forward.

## 2. Running migrations

```bash
# Apply any pending SQL files under src/lib/migrations/sql/ (idempotent,
# tracked in the schema_migrations table so re-runs are safe no-ops)
node scripts/apply-models-migrations.mjs

# Snapshot the live schema into docs/models-schema-inventory.md
node scripts/inventory-models-schema.mjs
```

Both scripts read DB credentials from `.env.local` / `.env`
(`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL`).

The admin UI also exposes migration status/apply via
`GET/POST /api/admin/models/migrations` (see
`src/lib/migrations/runner.ts`), used by the admin content tools if you'd
rather trigger it from the browser instead of the CLI.

## 3. Documentation generation ("Regenerate AI Docs")

`src/services/enrichment/ModelDocsEnrichment.ts` is a template-driven
generator that derives `ai_summary`, `quick_facts`, `compatibility_matrix`,
`overview_guidance`, `playground_config`, FAQs, install guides, usage
examples, architecture nodes, use-case cards, API docs, and security notes
purely from the model's own row (task, parameters, license, framework, tags,
etc.) — no external API calls. `persistModelDocs()` replaces the relevant
satellite rows in a single transaction and updates the JSON columns on
`ai_models`.

Entry points:

- `POST /api/admin/models/[slug]/regenerate-docs` — regenerate everything for
  one model. Requires an authenticated admin/superadmin session.
- `POST /api/admin/models/regenerate-docs` — bulk regenerate, body
  `{ limit?: number, status?: string }` (defaults to the 50 most recently
  updated models). Used by the "Regenerate Docs" button on
  `/admin/content/models`.

The admin docs editor (`/admin/content/models/[slug]/edit`) has its own
"Regenerate AI Docs" button that calls the single-model endpoint and reloads
the page's state afterwards. Regeneration always **overwrites** the
generated satellite tables (FAQs, install guides, usage examples,
architecture nodes, use-case cards, API docs, security notes) but only seeds
`model_tutorials` if none exist yet, since those are usually hand-curated.

## 4. Admin editor architecture

| Route | Purpose |
| --- | --- |
| `/admin/content/models` | List/search/filter/bulk-publish models; links to both editors; bulk "Regenerate Docs" |
| `/admin/content/models/[slug]` | Core field editor (name, technical specs, links, licensing, metadata) |
| `/admin/content/models/[slug]/edit` | **Docs editor** — Core badges/classification, Quick Facts, Playground, AI Summary, Benchmarks, Install, Usage, FAQs, Papers, Security, Relations |
| `/admin/content/models/import` | Bulk HuggingFace import |

### API surface

- `GET /api/admin/models/[slug]` — returns `{ model, faqs, install_guides, usage_examples, papers, security_notes, benchmarks, variants, comparisons, community_links, architecture_nodes, use_case_cards, api_docs, tutorials }` in one call, so the docs editor can hydrate every tab from a single request.
- `PUT /api/admin/models/[slug]` — updates `ai_models`. Only whitelisted columns that actually exist in the DB are written (guards against partially-migrated environments). Accepts the new classification/documentation columns listed in §1.1 in addition to the original core fields. **Always send the full model object back** (the docs editor keeps the fetched row in state and PUTs it wholesale) — the route does not do partial merges, so omitted keys would otherwise be nulled.
- `GET/POST/PUT/DELETE /api/admin/models/[slug]/relations?type=<type>` — generic CRUD for every satellite table. `type` is one of: `faqs`, `install_guides`, `usage_examples`, `papers`, `security_notes`, `benchmarks`, `variants`, `comparisons`, `community_links`, `architecture_nodes`, `use_case_cards`, `api_docs`, `tutorials`. `POST`/`PUT` accept the table's editable columns as the JSON body (`PUT` also requires `id`); `DELETE` takes `id` as a query param. For `comparisons`, pass `peer_slug` and the route resolves `peer_model_id` for you. This single endpoint backs the RelationsManager component used across the Benchmarks/Install/Usage/FAQs/Papers/Security/Relations tabs.
- `POST /api/admin/models/[slug]/regenerate-docs` / `POST /api/admin/models/regenerate-docs` — see §3.
- `POST /api/admin/models/refresh-facets` — re-derives `tags`/`categories`/`task` from HuggingFace taxonomy without a full re-import.

### Key components

- `src/components/admin/models/RelationsManager.tsx` — reusable list + inline add/edit form for a single relation `type`, driven entirely by a `fields` config (label/type/options per column). Used by every satellite-table tab in the docs editor.
- `src/app/admin/content/models/[slug]/edit/page.tsx` — the docs editor page; owns the raw model row + parsed `quick_facts`/`playground_config`/`ai_summary` objects in state, and renders one `RelationsManager` per satellite-table tab.

## 5. Public detail page architecture

- `src/lib/models/getModelDetail.ts` — `getModelDetailBySlug(slug)` fetches the `ai_models` row plus every satellite table in parallel (`Promise.all`), computes download analytics (`model_download_daily` rollups) and related items (peer models + datasets by task/tags), and returns a single `ModelDetailPayload` (typed in `src/types/models.ts`).
- `src/app/models/[slug]/page.tsx` — server component; builds SEO metadata + `SoftwareApplication`/`FAQPage`/`BreadcrumbList` JSON-LD, wraps everything in `ModelsThemeProvider`, and renders `ModelDetailView` with the payload as `initialData`.
- `src/components/models/detail/ModelDetailView.tsx` + `src/components/models/detail/sections/*` — one section component per tab (Overview, Installation, Usage, Architecture, Benchmarks, Playground, Examples, Tutorials, Comparison, FAQ, Changelog, Community, Related), navigated via `StickySectionNav`.
- `src/app/api/models/[slug]/route.ts` — public JSON API for the same payload (published models only), with backward-compatible flat aliases (`benchmarks_list`, `variants`, `faqs`, ...) for older client code.

## 6. Listing, comparison & discovery pages

- `src/app/models/page.tsx` → `ModelsListClient` — HuggingFace-style filterable/sortable grid. Wrapped in `ModelsThemeProvider` + the `.models-scope` CSS scope (see `src/styles/models.css`) with a `ThemeToggle` (next-themes, `ht-models-theme` storage key) in the hero.
- `src/app/models/compare/page.tsx` — free-form "pick 2-5 models" comparator. Also wrapped in `ModelsThemeProvider`/`.models-scope`; the detailed property table uses the shared `src/components/models/ComparisonTable.tsx` component (generic `fields[]` config with per-field `render`, plus automatic winner highlighting via `compare: 'higher' | 'lower' | 'equal'`).
- `src/app/models/compare/[modelA]-vs-[modelB]/page.tsx` — static, SEO-friendly "A vs B" URL (canonical + rich OpenGraph/Twitter metadata) that renders `StaticComparisonClient`, which calls `GET /api/models/compare?slugs=a,b` directly.
- `src/app/models/category/[category]/page.tsx`, `.../org/[organization]`, `.../use-cases/[useCase]`, `.../leaderboard`, `.../timeline` — additional discovery surfaces, all included in the sitemap (see §7).

## 7. Sitemap

`src/app/sitemaps/ai-models.xml/route.ts` uses the shared `query()` helper
from `@/lib/db` (not an ad-hoc `pg.Pool`) and emits:

- Static hub pages: `/models`, `/models/compare`, `/models/leaderboard`, `/models/timeline`
- Category pages at `/models/category/<category>` (not `/models/<category>`)
- Use-case pages at `/models/use-cases/<useCase>`
- One `<url>` per published model at `/models/<slug>` with `<lastmod>`
- One `<url>` per distinct developer at `/models/org/<developer-slug>`

It's linked from the main sitemap index and respects the `seo_settings`
table's `generate_sitemap` / `include_in_sitemap` / `sitemap_change_frequency`
/ `sitemap_priority` toggles.

## 8. Detail page evolution contract

The public detail shell is [`ModelDetailView`](../src/components/models/detail/ModelDetailView.tsx).

### Schema-driven sections

Sections are registered with `{ id, label, isEmpty, render }`. Empty sections
are omitted from both the page body and sticky nav. Adding a new model never
requires UI changes — populate satellite tables / JSON columns and the page
renders what exists.

### Derived UX layers (no DB required)

| Helper | Purpose |
| --- | --- |
| `generateModelSummary` | 100–150 word fallback when description is empty |
| `deriveModelScores` | Trending / popularity / production / friendliness |
| `deriveProductionReadiness` | Stars + labels + docs/deploy scores |
| `deriveDecisionAssistant` | Recommended / Not Recommended + alternatives |
| `deriveDeveloperScore` | Nine-axis developer score (X.X/10) |
| `estimateBenchmarks` | Estimated benchmarks when DB empty |
| `generateTieredExamples` | Tiered multi-lang code packs |
| `generatePeopleAlsoAsk` | PAA FAQ fallback + schema |
| `groupModelCapabilities` | Frameworks / tasks / I/O / hardware groups |
| `buildQuickStats` | Professional quick-stat cards (incl. Memory/VRAM) |

### Enrichment

`enrichModelDocsBySlug` persists `ai_summary`, `quick_facts` (including install
meta), and backfills empty `description` from `ai_summary.what` when missing.

### Collections

- Client localStorage via `CollectionsMenu` (always available)
- Server API `GET/POST/PUT /api/models/collections` for signed-in users
  (`model_collections` table created lazily)

### Keyboard shortcuts (sticky nav)

- `g` then letter — jump to section by id/label prefix
- `1`–`9` — jump by section index
- `c` — Comparison · `p` — Playground

## 7. Design system (`ht-ui`)

Platform components live in `src/components/ht-ui/` with tokens in
`src/styles/ht-tokens.css` (`--ht-*`; `--m-*` aliases for the models scope).

Model detail composes these via mappers in `src/lib/models/*`:

| Helper | Feeds |
| --- | --- |
| `deriveDeveloperScore` | Developer Score card (9 axes → X.X/10) |
| `deriveDecisionAssistant` | Recommended / Not Recommended + alternatives with WHY |
| `estimateBenchmarks` / `estimateHardware` | Never-empty benchmarks + VRAM/RAM estimates |
| `generateTieredExamples` | Multi-language example packs when DB empty |
| `generatePeopleAlsoAsk` | FAQ section + FAQPage JSON-LD when FAQs empty |

Contracts and expansion rules: [`docs/design-system.md`](./design-system.md).

