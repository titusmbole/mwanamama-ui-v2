// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<boolean>(false);

  useEffect(() => {
    // initialize auth state from localStorage
    const token = localStorage.getItem("authToken");
    setUser(Boolean(token));
  }, []);

  const login = (token: string) => {
    localStorage.setItem("authToken", token);
    setUser(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
