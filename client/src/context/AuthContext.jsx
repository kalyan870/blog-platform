import { createContext, useContext } from 'react';
import { useAuth as useClerkAuth, useUser, useClerk } from '@clerk/react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const user = isSignedIn && clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress || 'Member',
  } : null;

  return <AuthContext.Provider value={{ user, loading: !isLoaded, getToken, logout: signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
