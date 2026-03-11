'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import {
  listTicketBatches,
  checkAvailability,
  registerForTicket,
  getMyTicket,
} from '@/actions/registration';
import type { SerializedDocument } from '@/lib/serialization';
import btn from '@/styles/Button.module.css';
import styles from './TicketRegistration.module.css';

export function TicketRegistration() {
  const [batches, setBatches] = useState<SerializedDocument[]>([]);
  const [availability, setAvailability] = useState<
    Map<string, { available: number; total: number }>
  >(new Map());
  const [myTicket, setMyTicket] = useState<SerializedDocument | null>(null);
  const [registering, setRegistering] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { isAuthenticated } = useUser();

  const refresh = () => {
    listTicketBatches().then((b) => {
      setBatches(b);
      b.forEach((batch) => {
        checkAvailability(batch.id).then((a) => {
          setAvailability((prev) => new Map(prev).set(batch.id, a));
        });
      });
    });
    if (isAuthenticated) {
      getMyTicket()
        .then(setMyTicket)
        .catch(() => {});
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleRegister = async (batchId: string) => {
    setRegistering(batchId);
    setMessage(null);
    try {
      const result = await registerForTicket(batchId);
      setMyTicket(result.booking);
      setMessage(
        `Registered! Order total: ${result.order.total.currency} ${result.order.total.amount}`,
      );
      refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setRegistering(null);
    }
  };

  if (myTicket) {
    const data = myTicket.data as Record<string, unknown>;
    return (
      <div className={styles.container}>
        <div className={styles.ticketConfirmed}>
          <h3>You&apos;re registered!</h3>
          <p>
            Booking confirmed on{' '}
            {new Date(String(data.confirmedAt)).toLocaleDateString()}.
          </p>
          <p>
            Ticket: {String(data.currency)} {String(data.price)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {message && <div className={styles.message}>{message}</div>}
      {!isAuthenticated && <p>Sign in to register for the conference.</p>}
      {batches.length === 0 ? (
        <p>No ticket batches available yet.</p>
      ) : (
        <div className={styles.batchList}>
          {batches.map((batch) => {
            const data = batch.data as Record<string, unknown>;
            const avail = availability.get(batch.id);
            const now = new Date();
            const opens = new Date(String(data.opensAt));
            const closes = new Date(String(data.closesAt));
            const isOpen = now >= opens && now <= closes;
            const soldOut = avail ? avail.available <= 0 : false;

            return (
              <div key={batch.id} className={styles.batchCard}>
                <h3>{String(data.label)}</h3>
                <div className={styles.batchMeta}>
                  <span>
                    {String(data.currency)} {String(data.price)}
                  </span>
                  {avail && (
                    <span>
                      {avail.available} / {avail.total} available
                    </span>
                  )}
                </div>
                <div className={styles.batchDates}>
                  Opens: {opens.toLocaleDateString()} — Closes:{' '}
                  {closes.toLocaleDateString()}
                </div>
                {isAuthenticated && isOpen && !soldOut && (
                  <button
                    onClick={() => handleRegister(batch.id)}
                    disabled={registering === batch.id}
                    className={btn.primary}
                  >
                    {registering === batch.id ? 'Registering...' : 'Register'}
                  </button>
                )}
                {soldOut && <span className={styles.soldOut}>Sold Out</span>}
                {!isOpen && now < opens && (
                  <span className={styles.notYet}>
                    Opens {opens.toLocaleDateString()}
                  </span>
                )}
                {!isOpen && now > closes && (
                  <span className={styles.closed}>Closed</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
