import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiClient } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isOwner: boolean;
  hasDiscordOauth: boolean;
  loginWithDiscord: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasDiscordOauth, setHasDiscordOauth] = useState<boolean>(false);

  const refreshUser = async () => {
    try {
      const [data, authConf] = await Promise.all([
        apiClient.getCurrentUser(),
        apiClient.getAuthConfig()
      ]);
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
      setHasDiscordOauth(Boolean(authConf?.hasDiscordOauth));
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

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isAuthenticated = Boolean(user);
  const isOwner = Boolean(user && (user.isOwner || user.role === UserRole.OWNER));
  const isAdmin = Boolean(
    user && (isOwner || user.isAdmin || user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN)
  );
  const isStaff = Boolean(
    user &&
      (isAdmin ||
        [
          UserRole.OWNER,
          UserRole.SUPER_ADMIN,
          UserRole.ADMIN,
          UserRole.MODERATOR,
          UserRole.SUPPORT,
          UserRole.EDITOR,
          UserRole.STORE_MANAGER
        ].includes(user.role))
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isAdmin,
        isStaff,
        isOwner,
        hasDiscordOauth,
        loginWithDiscord,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
