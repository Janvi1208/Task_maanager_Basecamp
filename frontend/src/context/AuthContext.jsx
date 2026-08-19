import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { getToken, removeToken, setToken } from "../utils/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (!getToken()) {
      setUser(null);
      return null;
    }
    try {
      const currentUser = await api.get("/auth/me");
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      if (error.status === 401) removeToken();
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const data = await api.post("/auth/login", credentials);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (details) => {
    const data = await api.post("/auth/signup", details);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      if (getToken()) await api.post("/auth/logout");
    } finally {
      removeToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
