'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { getTestAccounts, getAuthMode } from '@/actions/auth';

interface TestAccountInfo {
  token: string;
  name: string;
  email: string;
  roles: string[];
}

export function AuthButton() {
  const { identity, isAuthenticated, isLoading, signIn, signOut } = useUser();
  const [accounts, setAccounts] = useState<TestAccountInfo[]>([]);
  const [authMode, setAuthMode] = useState<string>('google');
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
    if (authMode !== 'google' || isAuthenticated) return;

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
  }, [authMode, isAuthenticated, signIn]);

  if (authMode === 'test') {
    if (isAuthenticated) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.875rem' }}>
            {(identity.metadata?.name as string) || identity.id}
          </span>
          <button onClick={signOut} style={btnStyle}>
            Sign out
          </button>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {accounts.map((a) => (
          <button
            key={a.token}
            onClick={() => signIn(a.token)}
            style={btnStyle}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.875rem' }}>
          {(identity.metadata?.name as string) || identity.id}
        </span>
        <button
          onClick={() => {
            window.google?.accounts.id.disableAutoSelect();
            signOut();
          }}
          style={btnStyle}
        >
          Sign out
        </button>
      </div>
    );
  }

  if (isLoading) return null;

  return <div ref={googleButtonRef} />;
}

const btnStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: '0.8125rem',
  border: '1px solid var(--color-border)',
  borderRadius: 4,
  background: 'var(--color-surface)',
  cursor: 'pointer',
};
