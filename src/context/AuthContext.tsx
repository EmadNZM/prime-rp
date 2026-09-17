import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiClient } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  hasDiscordOauth: boolean;
  loginWithDiscord: () => void;
  loginWithDiscordDirect: (discordUsername: string, discordId?: string, avatar?: string) => Promise<boolean>;
  portalLogin: (username?: string, password?: string) => Promise<void>;
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

  const loginWithDiscordDirect = async (discordUsername: string, discordId?: string, avatar?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await apiClient.discordDirectLogin(discordUsername, discordId, avatar);
      if (res.success && res.user) {
        setUser(res.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Discord direct login error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
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
        hasDiscordOauth,
        loginWithDiscord,
        loginWithDiscordDirect,
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
