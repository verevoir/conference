import type { SerializedDocument } from '@/lib/serialization';

const tierOrder = ['platinum', 'gold', 'silver', 'community'];

export function SponsorGrid({ sponsors }: { sponsors: SerializedDocument[] }) {
  const byTier = tierOrder.map((tier) => ({
    tier,
    items: sponsors.filter((s) => s.data.tier === tier),
  }));

  return (
    <div>
      {byTier
        .filter((g) => g.items.length > 0)
        .map((group) => (
          <div key={group.tier} style={{ marginBottom: 'var(--space-xl)' }}>
            <h2 style={{ textTransform: 'capitalize' }}>{group.tier}</h2>
            <div style={gridStyle}>
              {group.items.map((s) => (
                <a
                  key={s.id}
                  href={String(s.data.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={cardStyle}
                >
                  <strong>{String(s.data.name)}</strong>
                </a>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 'var(--space-md)',
};

const cardStyle: React.CSSProperties = {
  padding: 'var(--space-lg)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  textDecoration: 'none',
  color: 'inherit',
  textAlign: 'center',
};
