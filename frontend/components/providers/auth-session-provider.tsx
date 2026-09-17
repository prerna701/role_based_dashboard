'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  AUTH_SESSION_CHANGED_EVENT,
  getStoredAuthSession,
  type AuthSession,
} from '@/lib/analytics-api';
import {
  canAccessRegion,
  resolveRegionForRole,
  roles,
} from '@/lib/dashboard-data';
import type { RoleKey } from '@/types/dashboard';

import type { AuthSessionContextValue } from '@/types/components';
const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [isReady, setIsReady] = useState(false);

  const syncStoredSession = useCallback(() => {
    const storedSession = getStoredAuthSession();

    setSession(storedSession);
    if (storedSession) {
      setSelectedRegion(resolveRegionForRole(storedSession.roleKey, 'all'));
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    syncStoredSession();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, syncStoredSession);

    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, syncStoredSession);
    };
  }, [syncStoredSession]);

  const roleKey = session?.roleKey ?? 'admin';
  const role = roles[roleKey];
  const scopedRegion = resolveRegionForRole(roleKey, selectedRegion);

  useEffect(() => {
    setSelectedRegion((current) => resolveRegionForRole(roleKey, current));
  }, [roleKey]);

  const changeRegion = useCallback(
    (region: string) => {
      if (canAccessRegion(roleKey, region)) {
        setSelectedRegion(region);
      }
    },
    [roleKey],
  );

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      session,
      token: session?.token ?? null,
      roleKey,
      role,
      selectedRegion,
      scopedRegion,
      isReady,
      isAuthenticated: Boolean(session?.token),
      changeRegion,
    }),
    [changeRegion, isReady, role, roleKey, scopedRegion, selectedRegion, session],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession({ requireAuth = true } = {}) {
  const context = useContext(AuthSessionContext);
  const router = useRouter();

  if (!context) {
    throw new Error('useAuthSession must be used inside AuthSessionProvider.');
  }

  useEffect(() => {
    if (requireAuth && context.isReady && !context.isAuthenticated) {
      router.replace('/login');
    }
  }, [context.isAuthenticated, context.isReady, requireAuth, router]);

  return context;
}
