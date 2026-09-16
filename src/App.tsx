import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
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

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedNewsSlug, setSelectedNewsSlug] = useState<string>('');
  const { isRtl } = useLanguage();

  // Listen to browser hash or navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  return (
    <div className={`min-h-screen bg-[#070707] text-[#E5E5E5] flex flex-col font-sans selection:bg-[#C8874B] selection:text-black ${isRtl ? 'font-cairo' : 'font-montserrat'}`}>
      {/* Top Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-grow">
        {currentTab === 'home' && (
          <HomePage setCurrentTab={setCurrentTab} setSelectedNewsSlug={setSelectedNewsSlug} />
        )}
        {currentTab === 'about' && (
          <HomePage setCurrentTab={setCurrentTab} setSelectedNewsSlug={setSelectedNewsSlug} />
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
        {currentTab === 'support' && <SupportPage />}
        {currentTab === 'tickets' && <SupportPage />}
        {currentTab === 'faq' && <FAQPage />}
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
          <MainApp />
        </SettingsProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
