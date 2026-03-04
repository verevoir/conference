'use client';

import { useEffect, useState } from 'react';
import { listDocuments } from '@/actions/documents';
import { getFeedbackForTalk } from '@/actions/feedback';
import card from '@/styles/Card.module.css';
import styles from './FeedbackView.module.css';

interface TalkFeedback {
  talkId: string;
  talkTitle: string;
  avgRating: number;
  count: number;
  comments: string[];
}

export function FeedbackView() {
  const [feedbackByTalk, setFeedbackByTalk] = useState<TalkFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const talks = await listDocuments('talk');
      const results: TalkFeedback[] = [];

      for (const talk of talks) {
        const feedback = await getFeedbackForTalk(talk.id);
        if (feedback.length === 0) continue;

        const ratings = feedback.map((f) => (f.data.rating as number) ?? 0);
        const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        const comments = feedback
          .map((f) => f.data.comment as string)
          .filter(Boolean);

        results.push({
          talkId: talk.id,
          talkTitle: (talk.data.title as string) ?? talk.id,
          avgRating: Math.round(avg * 10) / 10,
          count: feedback.length,
          comments,
        });
      }

      setFeedbackByTalk(results);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p>Loading feedback...</p>;

  return (
    <div>
      <h1>Talk Feedback</h1>
      {feedbackByTalk.length === 0 ? (
        <p className={styles.empty}>No feedback yet.</p>
      ) : (
        feedbackByTalk.map((tf) => (
          <div key={tf.talkId} className={card.card}>
            <h3>{tf.talkTitle}</h3>
            <p>
              Average: <strong>{tf.avgRating}/5</strong> ({tf.count}{' '}
              {tf.count === 1 ? 'rating' : 'ratings'})
            </p>
            {tf.comments.length > 0 && (
              <div>
                <strong>Comments:</strong>
                <ul>
                  {tf.comments.map((c, i) => (
                    <li key={i} className={styles.comment}>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
