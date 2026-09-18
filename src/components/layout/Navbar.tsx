import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { PrimeLogo } from '../common/PrimeLogo';
import { 
  Globe, 
  Menu, 
  X, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  Ticket, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: t('nav.home') },
    { id: 'about', label: t('nav.about') },
    { id: 'rules', label: t('nav.rules') },
    { id: 'jobs', label: t('nav.jobs') },
    { id: 'news', label: t('nav.news') },
    { id: 'store', label: t('nav.store') },
    { id: 'players', label: t('nav.players') },
    { id: 'leaderboard', label: t('nav.leaderboard') },
    { id: 'support', label: t('nav.support') },
    { id: 'faq', label: t('nav.faq') }
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070707]/90 backdrop-blur-md border-b border-[#C8874B]/20 py-3 shadow-2xl shadow-black/80'
          : 'bg-transparent border-b border-white/5 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* LOGO */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8874B] rounded-lg"
          >
            <PrimeLogo size="md" variant="navbar" showText={true} withGlow={true} />
          </button>

          {/* DESKTOP NAVIGATION LINKS */}
          <nav className="hidden xl:flex items-center gap-1 rtl:gap-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-[#C8874B] bg-[#C8874B]/10 font-bold border-b-2 border-[#C8874B]'
                      : 'text-[#C7C7C7] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Store Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl bg-[#121212] border border-[#222] hover:border-[#C8874B]/60 text-[#C7C7C7] hover:text-[#C8874B] transition-all cursor-pointer group"
              title={language === 'ar' ? 'سلة المشتريات' : 'Shopping Cart'}
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 rtl:-right-auto rtl:-left-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-[#C8874B] to-[#DF9F64] text-black text-[10px] font-black flex items-center justify-center shadow-lg shadow-[#C8874B]/40 animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider text-[#C7C7C7] hover:text-[#C8874B] bg-[#121212] border border-[#222] hover:border-[#C8874B]/50 transition-all"
              title="Switch Language / تغيير اللغة"
              aria-label="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#C8874B]" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* User Session / Discord Login */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rtl:pl-1.5 rtl:pr-3 rounded-full bg-[#121212] border border-[#2A2A2A] hover:border-[#C8874B] transition-all focus:outline-none"
                >
                  <span className="text-xs font-semibold text-white max-w-[100px] truncate">
                    {user.globalName || user.username}
                  </span>
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                    alt={user.username}
                    className="w-7 h-7 rounded-full border border-[#C8874B] object-cover"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-[#C7C7C7]" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-[#0B0B0B] border border-[#222] rounded-xl shadow-2xl py-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#1A1A1A]">
                      <p className="text-xs text-[#888]">مرحباً بك / Welcome</p>
                      <p className="font-bold text-[#E5E5E5] truncate">{user.globalName || user.username}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-[#C8874B]/20 text-[#C8874B] border border-[#C8874B]/30">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        handleNavClick('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left rtl:text-right text-[#C7C7C7] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-[#C8874B]" />
                      <span>{t('userDashboard.overview')}</span>
                    </button>

                    <button
                      onClick={() => {
                        handleNavClick('tickets');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left rtl:text-right text-[#C7C7C7] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-[#C8874B]" />
                      <span>{t('nav.tickets')}</span>
                    </button>

                    <button
                      onClick={() => {
                        handleNavClick('orders');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left rtl:text-right text-[#C7C7C7] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#C8874B]" />
                      <span>{t('nav.orders')}</span>
                    </button>

                    {isStaff && (
                      <button
                        onClick={() => {
                          handleNavClick('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left rtl:text-right text-[#DF9F64] hover:bg-[#C8874B]/10 transition-colors font-semibold border-t border-[#1A1A1A]"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#C8874B]" />
                        <span>{t('nav.adminPanel')}</span>
                      </button>
                    )}

                    <div className="border-t border-[#1A1A1A] mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-left rtl:text-right text-red-400 hover:bg-red-500/10 transition-colors text-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold transition-all shadow-md shadow-[#5865F2]/20 hover:scale-[1.02]"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span className="hidden sm:inline">{t('nav.loginDiscord')}</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg bg-[#121212] border border-[#222] text-[#C7C7C7] hover:text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE RESPONSIVE DRAWER */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0B0B0B] border-b border-[#222] px-4 pt-3 pb-6 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`w-full text-left rtl:text-right px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === link.id
                  ? 'bg-[#C8874B]/15 text-[#C8874B] font-bold'
                  : 'text-[#C7C7C7] hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
          {isStaff && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full text-left rtl:text-right px-4 py-2.5 rounded-lg text-sm font-bold text-[#DF9F64] bg-[#C8874B]/10 hover:bg-[#C8874B]/20"
            >
              {t('nav.adminPanel')}
            </button>
          )}
        </div>
      )}
    </header>
  );
};
