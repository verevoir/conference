'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Identity } from '@verevoir/access';
import { ANONYMOUS, isAnonymous } from '@verevoir/access';
import { resolveToken } from '@/actions/auth';
import { conferencePolicy } from '@/access/policy';
import { talkPublishing, blogPublishing } from '@/access/workflow';

interface UserContextValue {
  identity: Identity;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
  can: (action: string, context?: { ownerId?: string }) => boolean;
  talkWorkflow: typeof talkPublishing;
  blogWorkflow: typeof blogPublishing;
}

const UserContext = createContext<UserContextValue | null>(null);

function readCookieToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)auth-token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(readCookieToken);
  const [identity, setIdentity] = useState<Identity>(ANONYMOUS);
  const [isLoading, setIsLoading] = useState(() => readCookieToken() !== null);

  useEffect(() => {
    if (!token) return;
    resolveToken(token)
      .then((id) => {
        if (id) setIdentity(id);
      })
      .catch(() => {
        // Auth system unavailable — fall back to anonymous
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  const signIn = useCallback((t: string) => {
    document.cookie = `auth-token=${encodeURIComponent(t)}; path=/; SameSite=Lax`;
    setIsLoading(true);
    setToken(t);
  }, []);
  const signOut = useCallback(() => {
    document.cookie =
      'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setToken(null);
    setIdentity(ANONYMOUS);
  }, []);

  const can = useCallback(
    (action: string, context?: { ownerId?: string }) =>
      conferencePolicy.can(identity, action, context),
    [identity],
  );

  return (
    <UserContext.Provider
      value={{
        identity,
        isAuthenticated: !isAnonymous(identity),
        isLoading,
        signIn,
        signOut,
        can,
        talkWorkflow: talkPublishing,
        blogWorkflow: blogPublishing,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
