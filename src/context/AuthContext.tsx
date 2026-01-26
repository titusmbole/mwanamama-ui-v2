// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { jwtDecode } from 'jwt-decode';

// Define the type for User (decoded from JWT)
interface User {
  sub: string;
  email: string;
  phoneNumber: string;
  status: string;
  idNo: string;
  id: number;
  firstLogin: boolean;
  name: string;
  designation: string;
  location: string;
  gender: string;
  role: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode(token) as User;
        setUser(decodedUser);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }
  }, [token]);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decodedUser = jwtDecode(token) as User;
    setUser(decodedUser);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

