import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, UserRole, PermissionId } from '../types';
import { apiClient } from '../services/apiClient';
import { hasUserPermission, getUserEffectivePermissions, DEFAULT_ROLE_PERMISSIONS } from '../utils/permissions';

interface AuthContextType {
  user: User | null;
  effectiveUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isOwner: boolean;
  hasDiscordOauth: boolean;
  previewRole: UserRole | null;
  setPreviewRole: (role: UserRole | null) => void;
  hasPermission: (permission: PermissionId) => boolean;
  effectivePermissions: PermissionId[];
  loginWithDiscord: () => void;
  demoLogin: (role?: 'admin' | 'citizen') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [previewRole, setPreviewRole] = useState<UserRole | null>(null);
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

  const demoLogin = async (role: 'admin' | 'citizen' = 'admin') => {
    try {
      setIsLoading(true);
      await apiClient.demoLogin(role);
      await refreshUser();
    } catch (err) {
      console.error('Demo login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      setPreviewRole(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Compute effective user taking role simulation into account (only if user is staff)
  const effectiveUser = useMemo(() => {
    if (!user) return null;
    if (!previewRole) return user;
    return {
      ...user,
      role: previewRole,
      isOwner: previewRole === UserRole.OWNER,
      isAdmin: [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(previewRole),
      permissions: DEFAULT_ROLE_PERMISSIONS[previewRole] || []
    };
  }, [user, previewRole]);

  const isAuthenticated = Boolean(effectiveUser);
  const isOwner = Boolean(effectiveUser && (effectiveUser.isOwner || effectiveUser.role === UserRole.OWNER));
  const isAdmin = Boolean(
    effectiveUser && (isOwner || effectiveUser.isAdmin || effectiveUser.role === UserRole.SUPER_ADMIN || effectiveUser.role === UserRole.ADMIN)
  );
  const isStaff = Boolean(
    effectiveUser &&
      (isAdmin ||
        [
          UserRole.OWNER,
          UserRole.SUPER_ADMIN,
          UserRole.ADMIN,
          UserRole.MODERATOR,
          UserRole.SUPPORT,
          UserRole.EDITOR,
          UserRole.STORE_MANAGER
        ].includes(effectiveUser.role))
  );

  const effectivePermissions = useMemo(() => {
    return getUserEffectivePermissions(effectiveUser);
  }, [effectiveUser]);

  const hasPermission = (permission: PermissionId): boolean => {
    return hasUserPermission(effectiveUser, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        effectiveUser,
        isAuthenticated,
        isLoading,
        isAdmin,
        isStaff,
        isOwner,
        hasDiscordOauth,
        previewRole,
        setPreviewRole,
        hasPermission,
        effectivePermissions,
        loginWithDiscord,
        demoLogin,
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
