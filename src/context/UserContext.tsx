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

  useEffect(() => {
    resolveToken(token).then((id) => {
      if (id) setIdentity(id);
    });
  }, [token]);

  const signIn = useCallback((t: string) => setToken(t), []);
  const signOut = useCallback(() => {
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
