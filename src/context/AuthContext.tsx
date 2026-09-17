import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiClient } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  loginWithDiscord: () => void;
  portalLogin: (username?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const data = await apiClient.getCurrentUser();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error refreshing session:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const loginWithDiscord = () => {
    window.location.href = '/api/auth/discord';
  };

  const portalLogin = async (username: string = 'PrimeCommander', password?: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.portalLogin(username, password);
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Portal login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isAuthenticated = Boolean(user);
  const isAdmin = Boolean(
    user && (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN)
  );
  const isStaff = Boolean(
    user &&
      [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.MODERATOR,
        UserRole.SUPPORT,
        UserRole.EDITOR,
        UserRole.STORE_MANAGER
      ].includes(user.role)
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isAdmin,
        isStaff,
        loginWithDiscord,
        portalLogin,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
