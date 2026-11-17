import { createContext, useContext, useMemo } from 'react';
import { useAuth as useClerkAuth, useClerk, useUser } from '@clerk/react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useClerkAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut } = useClerk();
  const value = useMemo(() => ({
    user,
    loading: !auth.isLoaded || !userLoaded,
    getToken: auth.getToken,
    logout: () => signOut(),
  }), [auth.isLoaded, auth.getToken, signOut, user, userLoaded]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
