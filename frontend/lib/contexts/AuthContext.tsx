import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CONFIG } from '@/config';

const TOKEN_STORAGE_KEY = 'auth_token'; // Fallback constant

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Use optional chaining and provide fallback
    const storageKey = CONFIG?.auth?.tokenStorageKey || TOKEN_STORAGE_KEY;
    const token = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    setIsAuthenticated(!!token);
  }, []);

  const login = (token: string) => {
    const storageKey = CONFIG?.auth?.tokenStorageKey || TOKEN_STORAGE_KEY;
    localStorage.setItem(storageKey, token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    const storageKey = CONFIG?.auth?.tokenStorageKey || TOKEN_STORAGE_KEY;
    localStorage.removeItem(storageKey);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 