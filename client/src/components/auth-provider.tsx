import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

type User = ReturnType<typeof useAuth>["user"];

interface AuthContextType {
  user: User;
  isLoading: boolean;
  login: ReturnType<typeof useAuth>["login"];
  logout: ReturnType<typeof useAuth>["logout"];
  register: ReturnType<typeof useAuth>["register"];
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!auth.isLoading) {
      setIsInitialized(true);
    }
  }, [auth.isLoading]);

  const value: AuthContextType = {
    user: auth.user,
    isLoading: !isInitialized,
    login: auth.login,
    logout: auth.logout,
    register: auth.register,
    isAuthenticated: !!auth.user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
