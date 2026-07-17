import React, { useEffect, useState } from 'react';
import TrustBadge from './TrustBadge';

interface TrustShape {
  score: number;
  riskLevel: string;
  completedTransactions: number;
  averageRating: number | null;
}

export default function UserProfile({ userId = 'u1' }: { userId?: string }) {
  const [trust, setTrust] = useState<TrustShape | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (!res.ok) return;
        const body = await res.json();
        setTrust(body.trust ?? null);
      } catch (e) {
        // ignore
      }
    })();
  }, [userId]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div className="user-avatar small">SC</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 700 }}>Sarah Chen</div>
        <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>
          {trust ? <TrustBadge score={trust.score} /> : <span>Loading trust…</span>}
        </div>
      </div>
    </div>
  );
}
