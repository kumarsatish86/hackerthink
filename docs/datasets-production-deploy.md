# Datasets production deploy

## 1. Backup Postgres

## 2. Pull & migrate

```bash
cd /opt/hackerthink
git pull origin main
node scripts/apply-models-migrations.mjs   # applies 010_datasets_module_rebuild.sql
npm ci
npm run build
pm2 restart hackerthink   # or your process manager
```

## 3. Smoke

- `/datasets` — list + live stats
- `/datasets/<slug>` — Hero, Decision, Developer Score, Explorer, FAQ JSON-LD
- `/api/datasets/<slug>/samples` — database | huggingface | empty
- `/api/datasets/og?slug=<slug>` — SVG
- Admin: `POST /api/admin/datasets/<slug>/enrich`

## 4. Optional enrich

Call enrich on published datasets after migrate to seed ai_summary, quality, FAQs, preprocessing.
