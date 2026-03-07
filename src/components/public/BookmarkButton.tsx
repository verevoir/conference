'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import {
  addBookmark,
  removeBookmark,
  getMyBookmarks,
} from '@/actions/bookmarks';
import styles from './BookmarkButton.module.css';

export function BookmarkButton({ talkId }: { talkId: string }) {
  const { identity, isAuthenticated } = useUser();
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    getMyBookmarks().then((bms) => {
      setBookmarked(bms.some((b) => b.data.talkId === talkId));
    });
  }, [isAuthenticated, identity.id, talkId]);

  if (!isAuthenticated) return null;

  const toggle = async () => {
    if (bookmarked) {
      await removeBookmark(talkId);
      setBookmarked(false);
    } else {
      await addBookmark(talkId);
      setBookmarked(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className={styles.button}
      title={bookmarked ? 'Remove bookmark' : 'Add to schedule'}
    >
      {bookmarked ? '\u2605' : '\u2606'}
    </button>
  );
}
