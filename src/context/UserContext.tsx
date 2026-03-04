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

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [identity, setIdentity] = useState<Identity>(ANONYMOUS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)auth-token=([^;]*)/);
    const saved = match ? decodeURIComponent(match[1]) : null;
    if (saved) {
      setToken(saved);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    resolveToken(token).then((id) => {
      if (id) setIdentity(id);
      setIsLoading(false);
    });
  }, [token]);

  const signIn = useCallback((t: string) => {
    document.cookie = `auth-token=${encodeURIComponent(t)}; path=/; SameSite=Lax`;
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
