'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { getTestAccounts, getAuthMode } from '@/actions/auth';
import btn from '@/styles/Button.module.css';
import styles from './AuthButton.module.css';

interface TestAccountInfo {
  token: string;
  name: string;
  email: string;
  roles: string[];
}

export function AuthButton() {
  const { identity, isAuthenticated, isLoading, signIn, signOut } = useUser();
  const [accounts, setAccounts] = useState<TestAccountInfo[]>([]);
  const [authMode, setAuthMode] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAuthMode().then(setAuthMode);
    getTestAccounts().then(setAccounts);
  }, []);

  useEffect(() => {
    if (authMode === 'google' && isAuthenticated) {
      window.google?.accounts.id.cancel();
    }
  }, [authMode, isAuthenticated]);

  useEffect(() => {
    if (authMode !== 'google' || isAuthenticated || isLoading) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    function initGis() {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId!,
        callback: (response) => {
          signIn(response.credential);
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
      });

      // Show One Tap prompt for single-click sign-in
      window.google.accounts.id.prompt();
    }

    // GIS script may already be loaded or still loading
    if (window.google?.accounts?.id) {
      initGis();
    } else {
      // Poll briefly for the script to load
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGis();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [authMode, isAuthenticated, isLoading, signIn]);

  if (authMode === null) return null;

  if (authMode === 'test') {
    if (isAuthenticated) {
      return (
        <div className={styles.row}>
          <span className={styles.userName}>
            {(identity.metadata?.name as string) || identity.id}
          </span>
          <button onClick={signOut} className={btn.subtle}>
            Sign out
          </button>
        </div>
      );
    }
    return (
      <div className={styles.column}>
        {accounts.map((a) => (
          <button
            key={a.token}
            onClick={() => signIn(a.token)}
            className={btn.subtle}
          >
            {a.name} ({a.roles.join(', ')})
          </button>
        ))}
      </div>
    );
  }

  // Google auth mode
  if (isAuthenticated) {
    return (
      <div className={styles.row}>
        <span className={styles.userName}>
          {(identity.metadata?.name as string) || identity.id}
        </span>
        <button
          onClick={() => {
            window.google?.accounts.id.disableAutoSelect();
            signOut();
          }}
          className={btn.subtle}
        >
          Sign out
        </button>
      </div>
    );
  }

  if (isLoading) return null;

  return <div ref={googleButtonRef} />;
}
