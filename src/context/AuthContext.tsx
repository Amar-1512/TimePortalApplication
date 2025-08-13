// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  ssoLogin: () => void;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: async () => null,
  ssoLogin: () => {},
  logout: () => {},
  changePassword: async () => false,
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setCurrentUser(parsed);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const user = await response.json();
      const mapped: User = {
        id: user.sub || user.id || '',
        email: user.email,
        role: user.role || 'user',
        displayName: user.name || user.email,
      };

      setCurrentUser(mapped);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(mapped));
      localStorage.setItem('userRole', mapped.role);
      localStorage.setItem('authToken', 'mock-token');

      return mapped;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  const ssoLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }
    try {
      const response = await fetch('http://localhost:8080/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          currentPassword,
          newPassword,
        }),
        credentials: 'include',
      });
      return response.ok;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, login, ssoLogin, logout, changePassword, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};
