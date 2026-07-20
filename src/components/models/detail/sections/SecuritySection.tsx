'use client';

import { FaShieldAlt, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { Badge, Card } from '@/components/models/ui/primitives';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelSecurityNote } from '@/types/models';

const SEVERITY_TONE: Record<string, 'success' | 'warning' | 'brand' | 'neutral'> = {
  low: 'success',
  medium: 'warning',
  high: 'warning',
  critical: 'warning',
};

const SEVERITY_ICON: Record<string, React.ReactNode> = {
  low: <FaCheckCircle className="text-emerald-600" />,
  medium: <FaInfoCircle className="text-amber-600" />,
  high: <FaExclamationTriangle className="text-amber-600" />,
  critical: <FaExclamationTriangle className="text-red-600" />,
};

export function SecuritySection({ notes }: { notes: ModelSecurityNote[] }) {
  return (
    <DetailSection id="security" title="Security" description="Known risks, mitigations, and safety considerations">
      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => {
            const severity = note.severity?.toLowerCase();
            return (
              <Card key={note.id} className="p-4">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  {severity && SEVERITY_ICON[severity]}
                  <h3 className="font-semibold text-[var(--m-text)]">{note.title || note.note_type}</h3>
                  <Badge>{note.note_type}</Badge>
                  {note.severity && (
                    <Badge tone={SEVERITY_TONE[severity || ''] || 'neutral'} className="capitalize">
                      {note.severity}
                    </Badge>
                  )}
                </div>
                {note.body && <p className="text-sm text-[var(--m-text-muted)]">{note.body}</p>}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <FaShieldAlt className="mx-auto mb-3 h-8 w-8 text-[var(--m-text-muted)]" />
          <p className="text-sm text-[var(--m-text-muted)]">No security notes have been published for this model yet.</p>
        </Card>
      )}
    </DetailSection>
  );
}

export default SecuritySection;
