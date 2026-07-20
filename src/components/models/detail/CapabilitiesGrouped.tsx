'use client';

import { Capabilities } from '@/components/ht-ui';
import type { CapabilityGroup } from '@/lib/models/capabilityGroups';

/** @deprecated Prefer Capabilities from ht-ui; kept for existing imports. */
export function CapabilitiesSection({ groups }: { groups: CapabilityGroup[] }) {
  return <Capabilities groups={groups} />;
}

/** Alias matching OverviewSection import. */
export const CapabilitiesGrouped = CapabilitiesSection;

export default CapabilitiesSection;
