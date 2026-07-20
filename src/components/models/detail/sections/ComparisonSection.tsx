'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { ComparisonTable, EmptyState, TagPill, BenchmarkCharts } from '@/components/ht-ui';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelComparisonPeer, ModelCore } from '@/types/models';
import { estimateHardware } from '@/lib/models/estimateBenchmarks';

const EMBED_CHIPS = ['MiniLM', 'BGE', 'E5', 'Jina', 'Nomic', 'Instructor'];

function peerHardware(peer: ModelComparisonPeer) {
  const paramsMatch = peer.parameters?.match(/([\d.]+)\s*B/i);
  const paramsB = paramsMatch ? Number(paramsMatch[1]) : undefined;
  const fake = { param_count_b: paramsB, memory_footprint: null } as ModelCore;
  const hw = estimateHardware(fake);
  const speed =
    paramsB != null ? (paramsB < 1 ? 'Fast' : paramsB < 7 ? 'Moderate' : 'Heavy') : 'Est. moderate';
  return {
    speed,
    ram: hw.memory || '~est.',
    vram: hw.vram || '~est.',
  };
}

export function ComparisonSection({ model, peers }: { model: ModelCore; peers: ModelComparisonPeer[] }) {
  const isEmbed = /embed|sentence|feature-extraction|similarity/i.test(
    `${model.task} ${model.model_type} ${model.name}`
  );
  const selfHw = estimateHardware(model);

  const rows = useMemo(() => {
    const self = {
      id: 'self',
      href: `/models/${model.slug}`,
      cells: {
        name: model.name,
        params: model.parameters || (model.param_count_b != null ? `${model.param_count_b}B` : '—'),
        speed: model.inference_speed || (model.param_count_b != null && model.param_count_b < 1 ? 'Fast' : 'Moderate'),
        ram: selfHw.memory || '—',
        vram: selfHw.vram || '—',
        license: model.license || '—',
      },
    };
    const peerRows = peers.map((peer) => {
      const hw = peerHardware(peer);
      return {
        id: peer.id,
        href: peer.peer_slug ? `/models/${peer.peer_slug}` : undefined,
        cells: {
          name: peer.name || 'Unknown',
          params: peer.parameters || '—',
          speed: hw.speed,
          ram: hw.ram,
          vram: hw.vram,
          license: peer.license || '—',
        },
      };
    });
    return [self, ...peerRows];
  }, [model, peers, selfHw.memory, selfHw.vram]);

  const miniChart = useMemo(
    () =>
      rows.slice(0, 5).map((r) => ({
        name: String(r.cells.name).slice(0, 12),
        value: Number(String(r.cells.params).replace(/[^\d.]/g, '')) || 1,
      })),
    [rows]
  );

  return (
    <DetailSection id="comparison" title="Comparison" description="See how this model stacks up against similar peers">
      {isEmbed ? (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {EMBED_CHIPS.map((c) => (
            <TagPill key={c} label={c} tone="info" href={`/models?q=${encodeURIComponent(c)}`} />
          ))}
        </div>
      ) : null}
      {peers.length > 0 || rows.length > 0 ? (
        <>
          <ComparisonTable
            columns={[
              { id: 'name', label: 'Model' },
              { id: 'params', label: 'Params' },
              { id: 'speed', label: 'Speed' },
              { id: 'ram', label: 'RAM' },
              { id: 'vram', label: 'VRAM' },
              { id: 'license', label: 'License' },
            ]}
            rows={rows}
            className="mb-4"
          />
          {miniChart.length > 1 ? (
            <BenchmarkCharts data={miniChart} charts={['bar']} className="mb-4" />
          ) : null}
          <Link
            href={`/models/compare?models=${model.slug}${peers[0]?.peer_slug ? `,${peers[0].peer_slug}` : ''}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ht-brand)] hover:underline"
          >
            Open full compare <FaArrowRight className="h-3 w-3" />
          </Link>
        </>
      ) : (
        <EmptyState
          title="Compare this model next"
          body="No curated peers yet. Start a side-by-side comparison or browse related embedding families."
          actions={[
            {
              id: 'compare',
              label: 'Start comparison',
              href: `/models/compare?models=${model.slug}`,
              variant: 'outline',
            },
          ]}
        />
      )}
    </DetailSection>
  );
}

export default ComparisonSection;
