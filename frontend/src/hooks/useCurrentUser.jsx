import { AuthProvider, useAuth } from "../context/AuthContext.jsx";

export const CurrentUserProvider = AuthProvider;

export function useCurrentUser() {
  const { user, loading } = useAuth();
  return {
    currentUser: user,
    currentUserId: user?.id ?? null,
    loading,
    userError: null,
  };
}
