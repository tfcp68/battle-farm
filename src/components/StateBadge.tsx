import React from 'react';

type Props = {
  label?: string;
  stateName?: string | number;
};

export default function StateBadge({ label = 'State', stateName }: Props) {
  return (
    <div className="state-badge">
      <span className="state-badge-label">{label}:</span>
      <span className="state-badge-value">{String(stateName ?? '—')}</span>
    </div>
  );
}