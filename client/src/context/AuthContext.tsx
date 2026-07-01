import { createContext, useState } from "react";
import type { ReactNode } from "react";

import type { User } from "../types/auth";
import { authService } from "../services/authService";

export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());

  const login = (user: User) => {
    authService.setStoredUser(user);
    setUser(user);
  };

  const logout = () => {
    authService.clearStoredUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
