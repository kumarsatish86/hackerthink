# AI Datasets Module

Schema-driven Dataset Intelligence Platform under `/datasets/*`, mirroring Models (`DatasetDetailView` registry, derive helpers, `ht-ui`).

## Architecture

- Types: [`src/types/datasets.ts`](../src/types/datasets.ts)
- Payload: [`src/lib/datasets/getDatasetDetail.ts`](../src/lib/datasets/getDatasetDetail.ts)
- Detail UI: [`src/components/datasets/detail/DatasetDetailView.tsx`](../src/components/datasets/detail/DatasetDetailView.tsx)
- Migration: [`src/lib/migrations/sql/010_datasets_module_rebuild.sql`](../src/lib/migrations/sql/010_datasets_module_rebuild.sql)
- Theme: `DatasetsThemeProvider` + `ht-tokens.css`

## Section contract

Force-visible (generators when empty): Overview, Explorer, Samples, Statistics, Quality, Download, Structure, Preprocessing, Annotations, Benchmarks, Models, Tutorials, Comparison, Security, FAQ, Community.

Optional hide: Papers (no URL), Related (empty), Changelog (no versions).

Never show “No data available” — use `DatasetEmptyState` / estimated badges.

## Hybrid explorer

`GET /api/datasets/[slug]/samples`: database samples → legacy `sample_data` JSON → Hugging Face datasets-server proxy (capped) → empty CTAs.

## Caching

- `getDatasetDetailBySlug` keeps a 60s in-memory cache; view bumps stay outside the cached payload.
- Admin enrich calls `invalidateDatasetDetailCache(slug)`.
- HF samples proxy uses `fetch(..., { next: { revalidate: 3600 } })`.

## Accessibility & performance

- Detail: skip link, StickyTOC keyboard/hash navigation, focus rings via `--ht-*`.
- Charts/explorer: respect `prefers-reduced-motion` in CSS tokens; lazy-load Explorer/Samples/Assistant.
- Lighthouse checklist: max-w-7xl layout, lazy media in SampleViewer, short TTL cache, OG SVG endpoint.

## Derive helpers

| Helper | Role |
| --- | --- |
| `buildQuickStats` | Quick stat cards |
| `generateDatasetSummary` / `buildFallbackAiSummary` | AI summary |
| `deriveDecisionAssistant` | Recommended / Avoid |
| `deriveDeveloperScore` | X.X/10 axes |
| `deriveQualityHealth` / `estimateStatistics` | Quality + charts |
| `generatePreprocessingSnippets` | Code packs |
| `generatePeopleAlsoAsk` | FAQ + JSON-LD |
| `estimateStorageRam` / freshness / popularity / commercial | Hero signals |

## APIs

| Route | Purpose |
| --- | --- |
| `GET /api/datasets` | List + filters + `facetCounts` |
| `GET /api/datasets/stats` | Hub aggregates |
| `GET /api/datasets/[slug]` | Detail (+ payload) |
| `GET /api/datasets/[slug]/samples` | Hybrid preview |
| `GET /api/datasets/compare` | Compare (+ storage/quality fields) |
| `GET /api/datasets/og` | OG SVG |
| `POST .../rate`, `comments`, `bookmark`, `report` | Engagement |
| `POST /api/admin/datasets/[slug]/enrich` | Seed AI docs / quality / FAQs |
| `POST /api/admin/import/datasets/huggingface` | Single upsert (`external_dataset_id`) |
| `POST /api/admin/import/datasets/huggingface/bulk` | Bulk upsert (max 50) |
| `GET /api/admin/datasets/analytics` | Live SQL aggregates |
| `GET /api/admin/taxonomy/dataset-categories` | Live facets |

## Smoke checklist

1. `/datasets` live counts
2. Published slug: hero, decision, score, explorer, FAQ schema
3. Samples API source header
4. Compare page max-width
5. Admin enrich returns ok
6. Models Using links when `related_dataset_slug` / name match

## Deploy

[datasets-production-deploy.md](./datasets-production-deploy.md)
