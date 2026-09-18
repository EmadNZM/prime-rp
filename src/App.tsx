import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { CustomCursor } from './components/common/CustomCursor';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/store/CartDrawer';
import { HomePage } from './pages/public/HomePage';
import { RulesPage } from './pages/public/RulesPage';
import { JobsPage } from './pages/public/JobsPage';
import { NewsPage } from './pages/public/NewsPage';
import { NewsDetailPage } from './pages/public/NewsDetailPage';
import { StorePage } from './pages/public/StorePage';
import { PlayersPage } from './pages/public/PlayersPage';
import { LeaderboardPage } from './pages/public/LeaderboardPage';
import { SupportPage } from './pages/public/SupportPage';
import { FAQPage } from './pages/public/FAQPage';
import { LoginPage } from './pages/public/LoginPage';
import { LegalPages } from './pages/public/LegalPages';
import { UserDashboard } from './pages/user/UserDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const VALID_TABS = [
  'home',
  'about',
  'rules',
  'jobs',
  'news',
  'news-detail',
  'store',
  'players',
  'leaderboard',
  'support',
  'tickets',
  'faq',
  'login',
  'dashboard',
  'orders',
  'admin',
  'legal-terms',
  'legal-privacy'
];

function getInitialTab(): string {
  try {
    const path = window.location.pathname.replace(/^\//, '').split('/')[0];
    if (path && VALID_TABS.includes(path)) {
      return path;
    }
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && VALID_TABS.includes(tabParam)) {
      return tabParam;
    }
  } catch {
    // fallback
  }
  return 'home';
}

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>(getInitialTab);
  const [selectedNewsSlug, setSelectedNewsSlug] = useState<string>('');
  const { isRtl } = useLanguage();

  // Keep browser URL synchronized with active tab
  useEffect(() => {
    try {
      const targetPath = currentTab === 'home' ? '/' : `/${currentTab}`;
      if (window.location.pathname !== targetPath) {
        // Keep search params when on login to retain notices/prompts
        const search = currentTab === 'login' ? window.location.search : '';
        window.history.pushState({ tab: currentTab }, '', targetPath + search);
      }
    } catch {
      // ignore
    }
    if (currentTab !== 'about') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentTab]);

  // Support browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentTab(getInitialTab());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className={`min-h-screen bg-[#08090d] text-[#f1f3f7] flex flex-col font-sans selection:bg-[#c8874b] selection:text-black ${isRtl ? 'font-cairo' : 'font-montserrat'}`}>
      {/* High-Performance Luxury Custom Cursor */}
      <CustomCursor />

      {/* Top Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Global Tebex Cart Drawer */}
      <CartDrawer 
        setCurrentTab={setCurrentTab}
        onCheckoutSuccess={() => setCurrentTab('orders')}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {(currentTab === 'home' || currentTab === 'about') && (
          <HomePage currentTab={currentTab} setCurrentTab={setCurrentTab} setSelectedNewsSlug={setSelectedNewsSlug} />
        )}
        {currentTab === 'rules' && <RulesPage />}
        {currentTab === 'jobs' && <JobsPage setCurrentTab={setCurrentTab} />}
        {currentTab === 'news' && (
          <NewsPage setCurrentTab={setCurrentTab} setSelectedNewsSlug={setSelectedNewsSlug} />
        )}
        {currentTab === 'news-detail' && (
          <NewsDetailPage slug={selectedNewsSlug} onBack={() => setCurrentTab('news')} />
        )}
        {currentTab === 'store' && <StorePage setCurrentTab={setCurrentTab} />}
        {currentTab === 'players' && <PlayersPage />}
        {currentTab === 'leaderboard' && <LeaderboardPage />}
        {(currentTab === 'support' || currentTab === 'tickets') && <SupportPage setCurrentTab={setCurrentTab} />}
        {currentTab === 'faq' && <FAQPage setCurrentTab={setCurrentTab} />}
        {currentTab === 'login' && <LoginPage setCurrentTab={setCurrentTab} />}
        {currentTab === 'dashboard' && <UserDashboard setCurrentTab={setCurrentTab} />}
        {currentTab === 'orders' && <UserDashboard setCurrentTab={setCurrentTab} />}
        {currentTab === 'admin' && <AdminDashboard setCurrentTab={setCurrentTab} />}
        {currentTab === 'legal-terms' && (
          <LegalPages type="terms" onBack={() => setCurrentTab('home')} />
        )}
        {currentTab === 'legal-privacy' && (
          <LegalPages type="privacy" onBack={() => setCurrentTab('home')} />
        )}
      </main>

      {/* Footer */}
      <Footer setCurrentTab={setCurrentTab} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
