'use client';

import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/public/PublicShell';
import { SponsorGrid } from '@/components/public/SponsorGrid';
import { listDocuments } from '@/actions/documents';
import type { SerializedDocument } from '@/lib/serialization';
import styles from './page.module.css';

const sponsorshipTiers = [
  {
    tier: 'platinum',
    perks: [
      'Logo on main stage and all materials',
      'Keynote introduction slot',
      'Premium exhibition stand',
      'Delegate list access',
      '10 complimentary tickets',
    ],
  },
  {
    tier: 'gold',
    perks: [
      'Logo on website and signage',
      'Exhibition stand',
      'Social media promotion',
      '5 complimentary tickets',
    ],
  },
  {
    tier: 'silver',
    perks: [
      'Logo on website',
      'Shared exhibition space',
      '2 complimentary tickets',
    ],
  },
  {
    tier: 'community',
    perks: [
      'Logo on website',
      'Social media mention',
      '1 complimentary ticket',
    ],
  },
];

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<SerializedDocument[]>([]);

  useEffect(() => {
    listDocuments('sponsor').then(setSponsors);
  }, []);

  return (
    <PublicShell>
      <h1>Sponsors</h1>
      <p className={styles.intro}>
        Our sponsors make this conference possible. Their support keeps ticket
        prices accessible and helps us deliver a great experience for everyone.
      </p>

      {sponsors.length > 0 && <SponsorGrid sponsors={sponsors} />}

      <div className={styles.tiersSection}>
        <h2 className={styles.tiersHeading}>Sponsorship Tiers</h2>
        <div className={styles.tierCards}>
          {sponsorshipTiers.map((t) => (
            <div key={t.tier} className={styles.tierCard}>
              <h3>{t.tier}</h3>
              <ul className={styles.tierPerks}>
                {t.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.cta}>
        <p>
          Interested in sponsoring? We&apos;d love to hear from you. Bespoke
          packages are available for organisations with specific goals.
        </p>
        <p>
          Get in touch:{' '}
          <a href="mailto:sponsors@verevoir.io" className={styles.ctaEmail}>
            sponsors@verevoir.io
          </a>
        </p>
      </div>
    </PublicShell>
  );
}
