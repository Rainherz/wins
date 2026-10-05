import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { container } from '@/composition/container';
import type { Session } from '../domain/session';

type AuthState = { status: 'loading' } | { status: 'signedOut' } | { status: 'signedIn'; session: Session };

const AuthContext = createContext<AuthState>({ status: 'loading' });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(
    () =>
      container.onSessionChange((session) =>
        setState(session ? { status: 'signedIn', session } : { status: 'signedOut' }),
      ),
    [],
  );

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
