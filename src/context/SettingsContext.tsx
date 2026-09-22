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
  const [settings, setSettings] = useState<SiteSettings | null>(() => {
    try {
      const cachedVisibility = localStorage.getItem('prime_page_visibility');
      const cachedSettings = localStorage.getItem('prime_site_settings');
      if (cachedSettings) {
        const parsed = JSON.parse(cachedSettings);
        if (cachedVisibility) {
          parsed.pageVisibility = { ...parsed.pageVisibility, ...JSON.parse(cachedVisibility) };
        }
        return parsed;
      }
      if (cachedVisibility) {
        return {
          pageVisibility: JSON.parse(cachedVisibility)
        } as any;
      }
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSettings = async () => {
    try {
      const data = await apiClient.getSiteSettings();
      let mergedData = data;
      try {
        const cachedVisibility = localStorage.getItem('prime_page_visibility');
        if (cachedVisibility) {
          mergedData = {
            ...data,
            pageVisibility: {
              ...(data?.pageVisibility || {}),
              ...JSON.parse(cachedVisibility)
            }
          };
        }
        localStorage.setItem('prime_site_settings', JSON.stringify(mergedData));
      } catch {}

      setSettings(mergedData);
      // If favicon is set, dynamically update the link tag
      if (mergedData?.logos?.favicon) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = mergedData.logos.favicon;
      }
    } catch (err) {
      console.error('Failed to load site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();

    const handleVisibilityUpdate = () => {
      try {
        const cached = localStorage.getItem('prime_page_visibility');
        if (cached) {
          const parsed = JSON.parse(cached);
          setSettings((prev) => prev ? { ...prev, pageVisibility: { ...(prev.pageVisibility || {}), ...parsed } } : null);
        }
      } catch {}
    };

    window.addEventListener('prime_page_visibility_updated', handleVisibilityUpdate);
    window.addEventListener('storage', handleVisibilityUpdate);
    return () => {
      window.removeEventListener('prime_page_visibility_updated', handleVisibilityUpdate);
      window.removeEventListener('storage', handleVisibilityUpdate);
    };
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>): Promise<SiteSettings> => {
    // 1. Optimistically update local state immediately
    let optimisticUpdated: SiteSettings;
    setSettings((prev) => {
      optimisticUpdated = {
        ...(prev || {}),
        ...newSettings,
        pageVisibility: {
          ...(prev?.pageVisibility || {}),
          ...(newSettings.pageVisibility || {})
        }
      } as SiteSettings;
      return optimisticUpdated;
    });

    // 2. Persist to localStorage immediately
    try {
      if (newSettings.pageVisibility) {
        localStorage.setItem('prime_page_visibility', JSON.stringify(newSettings.pageVisibility));
        window.dispatchEvent(new CustomEvent('prime_page_visibility_updated'));
      }
      localStorage.setItem('prime_site_settings', JSON.stringify({
        ...(settings || {}),
        ...newSettings
      }));
    } catch (e) {
      console.warn('Failed to cache settings in localStorage:', e);
    }

    // 3. Sync with server API
    let serverUpdated: any = null;
    try {
      serverUpdated = await apiClient.updateSettings(newSettings);
      if (newSettings.pageVisibility) {
        await apiClient.updatePageVisibility(newSettings.pageVisibility);
      }
    } catch (err) {
      console.warn('Server settings update encountered an error (local state preserved):', err);
    }

    const finalResult = (serverUpdated && typeof serverUpdated === 'object' && !serverUpdated.error)
      ? {
          ...serverUpdated,
          pageVisibility: {
            ...(serverUpdated.pageVisibility || {}),
            ...(newSettings.pageVisibility || {})
          }
        }
      : (optimisticUpdated! || (newSettings as SiteSettings));

    setSettings(finalResult);

    if (finalResult?.logos?.favicon) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (link) link.href = finalResult.logos.favicon;
    }

    return finalResult;
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
