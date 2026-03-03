'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { submitFeedback, getMyFeedback } from '@/actions/feedback';

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
    return (
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        Sign in to leave feedback.
      </p>
    );
  }

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) return;
    await submitFeedback(talkId, identity.id, rating, comment || undefined);
    setSubmitted(true);
  };

  return (
    <div style={formStyle}>
      <h3>Your Feedback</h3>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            style={{
              ...starStyle,
              color:
                n <= rating ? 'var(--color-primary)' : 'var(--color-border)',
            }}
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
        style={textareaStyle}
      />
      <button onClick={handleSubmit} style={submitBtnStyle}>
        {submitted ? 'Update' : 'Submit'}
      </button>
      {submitted && (
        <span
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
            marginLeft: 8,
          }}
        >
          Feedback saved
        </span>
      )}
    </div>
  );
}

const formStyle: React.CSSProperties = {
  padding: 'var(--space-md)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  marginTop: 'var(--space-lg)',
};

const starStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  padding: 0,
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid var(--color-border)',
  borderRadius: 4,
  fontSize: '0.875rem',
  resize: 'vertical',
  marginBottom: 8,
};

const submitBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
};
