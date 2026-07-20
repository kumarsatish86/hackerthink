# HackerThink Design System

Platform UI kit under `src/components/ht-ui/`. Components are **JSON-configurable** via TypeScript props (the contract), support **light/dark** through `--ht-*` tokens, and are **responsive** by default.

## Tokens

- Canonical CSS: [`src/styles/ht-tokens.css`](../src/styles/ht-tokens.css)
- Models alias: [`src/styles/models.css`](../src/styles/models.css) imports ht-tokens; `--m-*` maps to `--ht-*`
- Scope classes: `.ht-scope` or `.models-scope`
- Theme: `HtThemeProvider` / `ModelsThemeProvider` (`next-themes`, class strategy)

## Expansion policy

1. **Additive only** — new optional props with defaults; never rename/remove without a major version note in this doc.
2. **No hardcoded page content** — pass data via props / mappers from payload.
3. **Variants via props** (`variant`, `density`, `tone`) — do not fork components per page.
4. Import barrel: `@/components/ht-ui`.

## Inventory

| Component | Props export | Notes |
| --- | --- | --- |
| MetricCard | `MetricCardProps` | label, value, hint, estimated |
| TagPill | `TagPillProps` | tone, href, icon |
| Callout / Info / Warning / Success / Danger | `CalloutProps` | `variant` enum |
| EmptyState | `EmptyStateProps` | title, body, actions[], related[] |
| Skeleton | `SkeletonProps` | shape, size |
| Spinner | `SpinnerProps` | size, label |
| ErrorState | `ErrorStateProps` | message, retry |
| RatingCard | `RatingCardProps` | score, max, axes[] |
| ShareCard | `ShareCardProps` | url, title, channels[] |
| BookmarkCard | `BookmarkCardProps` | bookmarked, count, onToggle |
| HeroBanner | `HeroBannerProps` | title, badges, metrics, actions |
| StickyTOC | `StickyTOCProps` | sections[{id,label}] |
| Timeline | `TimelineProps` | events[] |
| QuickStats | `QuickStatsProps` | items[] |
| DecisionCard | `DecisionCardProps` | recommended, notRecommended, alternatives |
| DeveloperScore | `DeveloperScoreProps` | overall, axes |
| AISummary | `AISummaryProps` | paragraph, bullets |
| ProsCons | `ProsConsProps` | pros, cons, expandable |
| Capabilities | `CapabilitiesProps` | groups[] |
| InstallationBlocks | `InstallationBlocksProps` | meta, steps |
| CodeViewer | `CodeViewerProps` | wraps models CodeBlock |
| ArchitectureDiagram | `ArchitectureDiagramProps` | nodes[] |
| FAQAccordion | `FAQAccordionProps` | items[{q,a}] |
| RelatedResources | `RelatedResourcesProps` | groups by type |
| BenchmarkCards | `BenchmarkCardsProps` | source confidence |
| BenchmarkCharts | `BenchmarkChartsProps` | bar / radar / line |
| Playground | `PlaygroundProps` | modality + embedding demo |
| ComparisonTable | `ComparisonTableProps` | columns + rows |
| DeploymentGeneratorUI | `DeploymentGeneratorProps` | targets[] |
| AIAssistant | `AIAssistantProps` | actions with promptTemplate |
| CommunitySectionUI | `CommunitySectionProps` | tabs/blocks |

## Light / dark

Use token variables only (`var(--ht-surface)`, etc.). Avoid hardcoded hex in components except inside `ht-tokens.css`.

## Do / Don't

- Do map API/payload → props in `src/lib/models/*`
- Do keep interactive heavy charts dynamically imported at page level
- Don't put business heuristics inside ht-ui (keep presentational)
- Don't say “No data available” — use `EmptyState` with helpful CTAs
