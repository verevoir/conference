'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import {
  addBookmark,
  removeBookmark,
  getMyBookmarks,
} from '@/actions/bookmarks';

export function BookmarkButton({ talkId }: { talkId: string }) {
  const { identity, isAuthenticated } = useUser();
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    getMyBookmarks(identity.id).then((bms) => {
      setBookmarked(bms.some((b) => b.data.talkId === talkId));
    });
  }, [isAuthenticated, identity.id, talkId]);

  if (!isAuthenticated) return null;

  const toggle = async () => {
    if (bookmarked) {
      await removeBookmark(talkId, identity.id);
      setBookmarked(false);
    } else {
      await addBookmark(talkId, identity.id);
      setBookmarked(true);
    }
  };

  return (
    <button
      onClick={toggle}
      style={btnStyle}
      title={bookmarked ? 'Remove bookmark' : 'Add to schedule'}
    >
      {bookmarked ? '\u2605' : '\u2606'}
    </button>
  );
}

const btnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '1.25rem',
  cursor: 'pointer',
  padding: 4,
  color: 'var(--color-primary)',
};
