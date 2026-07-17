import React from 'react';

interface Props { score: number | null }

export default function TrustBadge({ score }: Props) {
  if (score === null || score === undefined) return <span className="trust-badge unknown">No Trust</span>;
  const s = Number(score);
  let tier = 'bronze';
  if (s >= 90) tier = 'platinum';
  else if (s >= 80) tier = 'gold';
  else if (s >= 70) tier = 'silver';
  else tier = 'bronze';

  return <span className={`trust-badge ${tier}`}>{tier.toUpperCase()} • {s}</span>;
}
