'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { submitFeedback, getMyFeedback } from '@/actions/feedback';
import btn from '@/styles/Button.module.css';
import form from '@/styles/Form.module.css';
import styles from './FeedbackForm.module.css';

export function FeedbackForm({ talkId }: { talkId: string }) {
  const { identity, isAuthenticated } = useUser();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    getMyFeedback(talkId, identity.id).then((fb) => {
      if (fb) {
        setRating((fb.data.rating as number) ?? 0);
        setComment((fb.data.comment as string) ?? '');
        setSubmitted(true);
      }
    });
  }, [isAuthenticated, identity.id, talkId]);

  if (!isAuthenticated) {
    return <p className={styles.signInHint}>Sign in to leave feedback.</p>;
  }

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) return;
    await submitFeedback(talkId, identity.id, rating, comment || undefined);
    setSubmitted(true);
  };

  return (
    <div className={styles.form}>
      <h3>Your Feedback</h3>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            className={n <= rating ? styles.starActive : styles.star}
          >
            {'\u2605'}
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comment..."
        rows={3}
        className={form.textarea}
        style={{ marginBottom: 8 }}
      />
      <div className={styles.actions}>
        <button onClick={handleSubmit} className={btn.primary}>
          {submitted ? 'Update' : 'Submit'}
        </button>
        {submitted && <span className={styles.saved}>Feedback saved</span>}
      </div>
    </div>
  );
}
