'use client';

import {
  FaBrain, FaCheckCircle, FaShieldAlt, FaPlug, FaDownload, FaHeart, FaStar,
  FaEye, FaFire, FaCodeBranch, FaMicrochip, FaBalanceScale, FaLayerGroup,
  FaCalendarAlt, FaClock, FaLanguage,
} from 'react-icons/fa';
import { Badge } from '@/components/models/ui/primitives';
import type { ModelCore } from '@/types/models';
import { formatCompactNumber, formatDate, formatRating, toStringArray } from './utils';

function MetricPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 backdrop-blur-sm">
      <span className="text-white/80">{icon}</span>
      <span className="font-semibold text-white">{value}</span>
      <span className="hidden text-white/70 sm:inline">{label}</span>
    </div>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm text-white">
      <span className="mt-0.5 flex-shrink-0 text-white/90">{icon}</span>
      <span className="min-w-0">
        <span className="text-white/70">{label}: </span>
        <span className="font-medium text-white break-words">{value}</span>
      </span>
    </div>
  );
}

export function ModelHero({ model }: { model: ModelCore }) {
  const languages = toStringArray(model.languages);

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
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-wrap items-start gap-5">
          {model.logo_url ? (
            <img
              src={model.logo_url}
              alt={`${model.name} logo`}
              className="h-16 w-16 flex-shrink-0 rounded-xl bg-white/10 object-contain p-1.5 shadow-lg sm:h-20 sm:w-20"
            />
          ) : (
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-lg sm:h-20 sm:w-20">
              <FaBrain className="h-8 w-8 text-white sm:h-10 sm:w-10" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{model.name}</h1>
              {model.verified && (
                <Badge tone="success" className="!bg-white/20 !text-white">
                  <FaCheckCircle className="mr-1 inline h-3 w-3" /> Verified
                </Badge>
              )}
              {model.security_badge && (
                <Badge tone="neutral" className="!bg-white/20 !text-white">
                  <FaShieldAlt className="mr-1 inline h-3 w-3" /> Security Reviewed
                </Badge>
              )}
              {model.compatibility_badge && (
                <Badge tone="neutral" className="!bg-white/20 !text-white">
                  <FaPlug className="mr-1 inline h-3 w-3" /> Compatibility Tested
                </Badge>
              )}
              {model.trending_rank != null && model.trending_rank > 0 && (
                <Badge tone="warning" className="!bg-white/20 !text-white">
                  <FaFire className="mr-1 inline h-3 w-3" /> Trending #{model.trending_rank}
                </Badge>
              )}
            </div>

            {model.developer && <p className="mt-1 text-base text-white/90 sm:text-lg">by {model.developer}</p>}

            {model.description && (
              <p className="mt-2 max-w-3xl text-sm text-white/85 sm:text-base">{model.description}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <MetricPill icon={<FaDownload className="h-3.5 w-3.5" />} label="downloads" value={formatCompactNumber(model.download_count)} />
              <MetricPill icon={<FaHeart className="h-3.5 w-3.5" />} label="likes" value={formatCompactNumber(model.likes_count)} />
              <MetricPill icon={<FaStar className="h-3.5 w-3.5" />} label="stars" value={formatCompactNumber(model.stars_count)} />
              <MetricPill icon={<FaEye className="h-3.5 w-3.5" />} label="views" value={formatCompactNumber(model.view_count)} />
              <MetricPill
                icon={<FaStar className="h-3.5 w-3.5 text-yellow-300" />}
                label={`(${model.rating_count || 0})`}
                value={formatRating(model.rating)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2.5 rounded-xl bg-white/10 p-4 backdrop-blur-sm sm:grid-cols-3 lg:grid-cols-4">
          <MetaItem icon={<FaCodeBranch className="h-3.5 w-3.5" />} label="Version" value={model.version} />
          <MetaItem icon={<FaLayerGroup className="h-3.5 w-3.5" />} label="Task" value={model.task} />
          <MetaItem icon={<FaMicrochip className="h-3.5 w-3.5" />} label="Architecture" value={model.architecture} />
          <MetaItem icon={<FaMicrochip className="h-3.5 w-3.5" />} label="Params" value={model.parameters} />
          <MetaItem icon={<FaBalanceScale className="h-3.5 w-3.5" />} label="License" value={model.license} />
          <MetaItem icon={<FaLayerGroup className="h-3.5 w-3.5" />} label="Framework" value={model.framework} />
          {languages.length > 0 && (
            <MetaItem icon={<FaLanguage className="h-3.5 w-3.5" />} label="Languages" value={languages.slice(0, 3).join(', ')} />
          )}
          <MetaItem icon={<FaCalendarAlt className="h-3.5 w-3.5" />} label="Released" value={formatDate(model.release_date)} />
          <MetaItem icon={<FaClock className="h-3.5 w-3.5" />} label="Updated" value={formatDate(model.last_updated)} />
        </div>
      </div>
    </div>
  );
}

export default ModelHero;
