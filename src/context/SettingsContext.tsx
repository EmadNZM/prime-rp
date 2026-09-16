import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings } from '../types';
import { apiClient } from '../services/apiClient';

interface SettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<SiteSettings>;
  getLogo: (type?: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSettings = async () => {
    try {
      const data = await apiClient.getSiteSettings();
      setSettings(data);
      // If favicon is set, dynamically update the link tag
      if (data?.logos?.favicon) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = data.logos.favicon;
      }
    } catch (err) {
      console.error('Failed to load site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>): Promise<SiteSettings> => {
    const updated = await apiClient.updateSettings(newSettings);
    setSettings(updated);
    if (updated?.logos?.favicon) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (link) link.href = updated.logos.favicon;
    }
    return updated;
  };

  const getLogo = (type?: string): string => {
    if (type && settings?.logos && (settings.logos as any)[type]) {
      return (settings.logos as any)[type];
    }
    if (settings?.logos?.main) {
      return settings.logos.main;
    }
    return '/assets/prime-logo.png';
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings, getLogo }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
