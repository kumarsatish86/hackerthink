'use client';

import {
  FaBrain, FaCheckCircle, FaShieldAlt, FaPlug, FaDownload, FaHeart, FaStar,
  FaEye, FaFire,
} from 'react-icons/fa';
import { Badge } from '@/components/models/ui/primitives';
import type { ModelCore } from '@/types/models';
import { formatCompactNumber, formatRating } from './utils';
import { ModelVisualBadges } from './ModelVisualBadges';
import { resolveModelDescription } from '@/lib/models/generateModelSummary';

function MetricPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 backdrop-blur-sm">
      <span className="text-white/80">{icon}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
      <span className="hidden text-xs text-white/70 sm:inline">{label}</span>
    </div>
  );
}

export function ModelHero({ model }: { model: ModelCore }) {
  const blurb = resolveModelDescription(model);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[var(--m-brand)] to-[var(--m-brand-hover)] text-white">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-start gap-4">
          {model.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={model.logo_url}
              alt={`${model.name} logo`}
              className="h-12 w-12 flex-shrink-0 rounded-lg bg-white/10 object-contain p-1 shadow-md sm:h-14 sm:w-14"
            />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white/15 shadow-md sm:h-14 sm:w-14">
              <FaBrain className="h-6 w-6 text-white sm:h-7 sm:w-7" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">{model.name}</h1>
              {model.verified && (
                <Badge tone="success" className="!bg-white/20 !text-white">
                  <FaCheckCircle className="mr-1 inline h-3 w-3" /> Verified
                </Badge>
              )}
              {model.security_badge && (
                <Badge tone="neutral" className="!bg-white/20 !text-white">
                  <FaShieldAlt className="mr-1 inline h-3 w-3" /> Security
                </Badge>
              )}
              {model.compatibility_badge && (
                <Badge tone="neutral" className="!bg-white/20 !text-white">
                  <FaPlug className="mr-1 inline h-3 w-3" /> Compatible
                </Badge>
              )}
              {model.trending_rank != null && model.trending_rank > 0 && (
                <Badge tone="warning" className="!bg-white/20 !text-white">
                  <FaFire className="mr-1 inline h-3 w-3" /> #{model.trending_rank}
                </Badge>
              )}
            </div>

            {model.developer && <p className="mt-0.5 text-sm text-white/90">by {model.developer}</p>}

            <p className="mt-1.5 max-w-3xl line-clamp-2 text-sm text-white/85">{blurb}</p>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <MetricPill icon={<FaDownload className="h-3 w-3" />} label="downloads" value={formatCompactNumber(model.download_count)} />
              <MetricPill icon={<FaHeart className="h-3 w-3" />} label="likes" value={formatCompactNumber(model.likes_count)} />
              <MetricPill icon={<FaStar className="h-3 w-3" />} label="stars" value={formatCompactNumber(model.stars_count)} />
              <MetricPill icon={<FaEye className="h-3 w-3" />} label="views" value={formatCompactNumber(model.view_count)} />
              <MetricPill
                icon={<FaStar className="h-3 w-3 text-yellow-300" />}
                label={`(${model.rating_count || 0})`}
                value={formatRating(model.rating)}
              />
            </div>

            <div className="mt-2.5 [&_span]:!bg-white/15 [&_span]:!text-white">
              <ModelVisualBadges model={model} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelHero;
