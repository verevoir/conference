import type { SerializedDocument } from '@/lib/serialization';
import styles from './SponsorGrid.module.css';

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
          <div key={group.tier} className={styles.tierSection}>
            <h2 className={styles.tierHeading}>{group.tier}</h2>
            <div className={styles.grid}>
              {group.items.map((s) => (
                <a
                  key={s.id}
                  href={String(s.data.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
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
