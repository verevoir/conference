'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { getConferencePhase, advancePhase } from '@/actions/phase';
import type { ConferencePhase } from '@/blocks/config';
import { CONFERENCE_PHASES } from '@/blocks/config';
import btn from '@/styles/Button.module.css';
import styles from './PhaseDashboard.module.css';

export function PhaseDashboard() {
  const [phase, setPhase] = useState<ConferencePhase>('setup');
  const [advancing, setAdvancing] = useState(false);
  const { identity, lifecycleWorkflow, can } = useUser();

  useEffect(() => {
    getConferencePhase().then(setPhase);
  }, []);

  const transitions = lifecycleWorkflow.availableTransitions(phase, identity);
  const nextPhase = transitions.length > 0 ? transitions[0].to : null;

  const handleAdvance = async () => {
    if (
      !confirm(
        `Advance conference to "${nextPhase}" phase? This cannot be undone.`,
      )
    )
      return;
    setAdvancing(true);
    try {
      const newPhase = await advancePhase();
      setPhase(newPhase);
    } finally {
      setAdvancing(false);
    }
  };

  if (!can('create')) return <p>Organiser access required.</p>;

  const currentIndex = CONFERENCE_PHASES.indexOf(phase);

  return (
    <div>
      <h1>Conference Lifecycle</h1>
      <div className={styles.timeline}>
        {CONFERENCE_PHASES.map((p, i) => (
          <div
            key={p}
            className={`${styles.phase} ${
              i < currentIndex
                ? styles.phaseDone
                : i === currentIndex
                  ? styles.phaseCurrent
                  : styles.phaseFuture
            }`}
          >
            <div className={styles.dot} />
            <span className={styles.phaseLabel}>{p}</span>
          </div>
        ))}
      </div>
      <div className={styles.currentPhase}>
        <strong>Current phase:</strong> {phase}
      </div>
      {nextPhase && (
        <button
          onClick={handleAdvance}
          disabled={advancing}
          className={btn.primary}
        >
          {advancing ? 'Advancing...' : `Advance to ${nextPhase}`}
        </button>
      )}
      {!nextPhase && (
        <p className={styles.archived}>
          Conference is archived. No further transitions.
        </p>
      )}
    </div>
  );
}
