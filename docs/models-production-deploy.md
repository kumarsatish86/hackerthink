# Production Deploy Guide — AI Models Module Rebuild

Use this checklist to ship the models-module rebuild (schema + app code + content enrichment) safely to production.

---

## 0. What you are deploying

| Area | What changes |
| --- | --- |
| **Database** | New `ai_models` columns + satellite tables (`model_faqs`, `model_install_guides`, …) via SQL migrations `001` / `002` |
| **App** | New public detail page, compare/list polish, admin editors, import auto-enrichment, APIs, OG image, sitemap fixes |
| **Content** | Optional: regenerate AI Summary / FAQs / Install docs for existing models |
| **Cron (optional)** | HuggingFace auto-sync every 6 hours (`vercel.json`) |

Migrations are **idempotent** and tracked in `schema_migrations`. Safe to re-run.

---

## 1. Pre-flight checklist

1. **Backup production Postgres** (snapshot / `pg_dump`) before migrations.
2. Confirm production env has DB credentials and app URLs (see §2).
3. Merge/push all models-module code to the branch you deploy from (`main` or release branch).
4. Schedule a short maintenance window if you prefer (migrations are usually fast; enrichment can take longer for many models).

### Recommended order

```
Backup DB → Apply migrations → Deploy app → Smoke-test → Enrich existing models → Enable cron (optional)
```

Do **not** reverse that: deploying the new UI before migrations will break pages that query new columns/tables.

---

## 2. Production environment variables

Set these on the production host (Vercel / server `.env.production` / panel). Values must point at **production** Postgres.

| Variable | Required | Notes |
| --- | --- | --- |
| `DB_HOST` | Yes | Production DB host |
| `DB_PORT` | Yes | Usually `5432` |
| `DB_USER` | Yes | |
| `DB_PASSWORD` | Yes | |
| `DB_NAME` | Yes | |
| `DB_SSL` | Often | Set `true` for managed Postgres (RDS, Neon, Supabase, etc.) |
| `NEXTAUTH_URL` | Yes | Public site URL, e.g. `https://hackerthink.com` |
| `NEXTAUTH_SECRET` | Yes | Existing secret |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URL for SEO / OG / sitemap |
| `CRON_SECRET` | If using cron | Shared secret for `/api/cron/huggingface-models` |
| HuggingFace API key | Optional | Usually stored in `import_settings` via Admin → Models → Import |

Also install the new dependency if not already on prod build:

- `next-themes` (added for models theme support)

---

## 3. Apply database migrations (production)

### Option A — CLI from a machine that can reach prod DB (recommended)

1. Checkout the same commit you will deploy.
2. Point env at **production** DB (temporary `.env.local` or export vars — do **not** commit secrets):

```bash
# Example (PowerShell)
$env:DB_HOST="your-prod-host"
$env:DB_PORT="5432"
$env:DB_USER="..."
$env:DB_PASSWORD="..."
$env:DB_NAME="hackerthink"
$env:DB_SSL="true"

node scripts/apply-models-migrations.mjs
```

```bash
# Example (bash)
export DB_HOST=... DB_PORT=5432 DB_USER=... DB_PASSWORD=... DB_NAME=hackerthink DB_SSL=true
node scripts/apply-models-migrations.mjs
```

Expected output:

```
applied 001_models_module_rebuild.sql
applied 002_models_backfill_from_json.sql
```

Or `skip …` if already applied.

3. Optional verification:

```bash
node scripts/inventory-models-schema.mjs
```

Confirm `model_faqs`, `model_install_guides`, `ai_models.ai_summary`, etc. exist.

### Option B — After app deploy, via admin API

1. Deploy the app first **only if** you accept a brief window where new pages may error until migrations run.
2. Sign in as admin on production.
3. Call:

```http
POST /api/admin/models/migrations
```

(Or check status with `GET /api/admin/models/migrations`.)

Prefer **Option A** so the schema exists before traffic hits new code.

### What the migrations do

- `001_models_module_rebuild.sql` — extensions, new columns, satellite tables, indexes, backfill from legacy `ai_model_*` tables.
- `002_models_backfill_from_json.sql` — derive `task`, `param_count_b`, seed community/tutorial/paper links from existing JSON.

---

## 4. Deploy the application

### If you use Vercel / similar

1. Push/merge to the production branch.
2. Ensure build env vars (§2) are set in the project settings.
3. Wait for successful build + deploy.
4. Confirm `vercel.json` cron is registered (HuggingFace sync every 6 hours) **only if** you want auto-import.

### If you deploy on a VPS / Docker

```bash
git pull origin main   # or your release branch
npm ci
npm run build
# restart process manager (pm2 / systemd / docker compose)
```

Ensure the running process uses production env (not `.env.local` from a laptop).

### New packages

From this rebuild, make sure `package-lock.json` is deployed and `npm ci` runs so `next-themes` is installed.

---

## 5. Post-deploy smoke tests

On production (replace with your domain):

| Check | URL / action | Expect |
| --- | --- | --- |
| Models list | `/models` | Loads, filters work, no dark-mode moon in hero |
| Model detail | `/models/<published-slug>` | Hero text readable, Overview / Install / FAQ sections |
| Compare | `/models/compare?models=a,b` | No flickering Compare button; buttons top-right |
| OG image | `/api/models/og?slug=<slug>` | SVG returns |
| Sitemap | `/sitemaps/ai-models.xml` | Categories use `/models/category/...` |
| Admin list | `/admin/content/models` | List + Regenerate Docs |
| Admin edit | `/admin/content/models/<slug>` | Tabs: AI Summary, Overview Guidance, Install, FAQs… |
| Admin docs | `/admin/content/models/<slug>/edit` | Full docs editor |
| Import | `/admin/content/models/import` | Single/bulk with enrichment checkbox |

---

## 6. Fill AI docs for models already in production

New imports auto-fill AI Summary / Install / FAQs when enrichment is enabled.

**Existing** rows imported before this change may still have empty `ai_summary`.

### Via Admin UI

1. Go to `/admin/content/models`
2. Click **Regenerate Docs** (bulk), or open a model → **Regenerate AI Docs**

### Via CLI (against production DB)

```bash
# All models with empty AI Summary
npx tsx scripts/enrich-empty-model-docs.ts

# One model
npx tsx scripts/enrich-one-model.ts your-model-slug

# Or regenerate many published models
npx tsx scripts/regenerate-model-docs.ts
```

Point `DB_*` at production the same way as migrations.

**Warning:** Regenerate **overwrites** generated FAQs / install guides / usage examples / AI Summary templates. Hand-edited satellite content in those tables will be replaced. Prefer regenerate only for models still empty or still on template text.

---

## 7. Optional: HuggingFace auto-sync cron

Already defined in `vercel.json`:

```json
{ "path": "/api/cron/huggingface-models", "schedule": "0 */6 * * *" }
```

1. Set `CRON_SECRET` in production.
2. In Admin → Models → Import → **Auto Sync**, enable sync and save filters (limit, pipeline tag, enrichment on).
3. Vercel Cron will call the endpoint with the platform secret; the route also accepts:

```http
Authorization: Bearer <CRON_SECRET>
```

4. Test manually once:

```bash
curl -X POST "https://YOUR_DOMAIN/api/cron/huggingface-models" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

If you are **not** on Vercel, schedule the same HTTP call with your own cron (systemd / GitHub Actions / cloud scheduler).

---

## 8. Rollback notes

| Layer | Rollback |
| --- | --- |
| **App** | Redeploy previous git commit / Vercel promotion |
| **DB** | Prefer restore from backup taken in §1. New tables/columns are additive; old app versions generally ignore them, but a full restore is safest if something went wrong mid-migration |
| **Content** | No automatic undo for regenerated docs — restore DB backup or re-edit in admin |

There is no “down” migration script. Treat DB backup as the rollback path.

---

## 9. Quick copy-paste sequence (typical Vercel + managed Postgres)

```bash
# 1) On a secure machine with prod DB access + this repo at the release commit
export DB_HOST=... DB_PORT=5432 DB_USER=... DB_PASSWORD=... DB_NAME=... DB_SSL=true
node scripts/apply-models-migrations.mjs
node scripts/inventory-models-schema.mjs   # optional verify

# 2) Deploy app (git push / Vercel promote)

# 3) After deploy, fill empty docs (optional but recommended)
npx tsx scripts/enrich-empty-model-docs.ts

# 4) Smoke-test /models and /admin/content/models
```

---

## 10. Admin cheat sheet after go-live

| Task | Where |
| --- | --- |
| Edit What/Who/Advantages | Edit model → **AI Summary** |
| Edit Strengths / Best practices | Edit model → **Overview Guidance** |
| Edit Docker / ONNX snippets | Edit model → **Install** |
| Edit FAQs / Papers / Security | Same page tabs or **Full Docs Editor** |
| Re-import / bulk | Admin → Models → **Import** (keep auto-fill checkbox on) |
| Refresh filter tags | Admin → Models → **Refresh Filter Tags** (if button present) |

More detail: [`docs/models-module.md`](./models-module.md).
