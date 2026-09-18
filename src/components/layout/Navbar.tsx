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
  Sparkles,
  Layers,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { t, language, toggleLanguage, isRtl } = useLanguage();
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
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
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);

    if (id === 'about') {
      if (currentTab === 'home') {
        const el = document.getElementById('about');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      setCurrentTab('about');
      return;
    }

    setCurrentTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070707]/90 backdrop-blur-xl border-b border-[#222226] py-3 shadow-2xl shadow-black/80'
          : 'bg-transparent border-b border-white/[0.04] py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* BRAND LOGO */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8874B] rounded-lg group"
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
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    active
                      ? 'text-[#C8874B] bg-[#C8874B]/10 border border-[#C8874B]/30 shadow-sm'
                      : 'text-[#9A9A9A] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#C8874B] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Store Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/60 text-[#9A9A9A] hover:text-[#C8874B] transition-all cursor-pointer group shadow-md"
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#9A9A9A] hover:text-[#C8874B] bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/50 transition-all cursor-pointer"
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
                  className="flex items-center gap-2 p-1.5 pl-3 rtl:pl-1.5 rtl:pr-3 rounded-full bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B] transition-all focus:outline-none cursor-pointer"
                >
                  <span className="text-xs font-bold text-white max-w-[90px] truncate hidden sm:inline">
                    {user.globalName || user.username}
                  </span>
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                    alt={user.username}
                    className="w-7 h-7 rounded-full border border-[#C8874B] object-cover"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-[#9A9A9A]" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-[#0D0D0F] border border-[#222226] rounded-2xl shadow-2xl py-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-[#1C1C20]">
                      <p className="text-[11px] text-[#777] uppercase tracking-wider font-semibold">
                        {language === 'ar' ? 'المواطن المصادق' : 'Authenticated Citizen'}
                      </p>
                      <p className="font-black text-white truncate text-sm mt-0.5">
                        {user.globalName || user.username}
                      </p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-black rounded-md bg-[#C8874B]/15 text-[#DF9F64] border border-[#C8874B]/30 uppercase">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => handleNavClick('dashboard')}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left rtl:text-right text-[#9A9A9A] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer text-xs font-semibold"
                    >
                      <UserIcon className="w-4 h-4 text-[#C8874B]" />
                      <span>{t('userDashboard.overview')}</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('tickets')}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left rtl:text-right text-[#9A9A9A] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer text-xs font-semibold"
                    >
                      <Ticket className="w-4 h-4 text-[#C8874B]" />
                      <span>{t('nav.tickets')}</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('orders')}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left rtl:text-right text-[#9A9A9A] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer text-xs font-semibold"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#C8874B]" />
                      <span>{t('nav.orders')}</span>
                    </button>

                    {isStaff && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left rtl:text-right text-[#DF9F64] hover:bg-[#C8874B]/10 transition-colors font-bold border-t border-[#1C1C20] cursor-pointer text-xs"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#C8874B]" />
                        <span>{t('nav.adminPanel')}</span>
                      </button>
                    )}

                    <div className="border-t border-[#1C1C20] mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left rtl:text-right text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-semibold cursor-pointer"
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C8874B] to-[#DF9F64] hover:brightness-110 active:scale-98 text-black text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#C8874B]/20 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{t('nav.loginDiscord')}</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-[#0D0D0F] border border-[#222226] text-[#9A9A9A] hover:text-white cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE RESPONSIVE DRAWER */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0D0D0F]/95 backdrop-blur-2xl border-b border-[#222226] px-4 pt-4 pb-6 space-y-1.5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`w-full text-left rtl:text-right px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                currentTab === link.id
                  ? 'bg-[#C8874B]/15 text-[#C8874B] border border-[#C8874B]/30'
                  : 'text-[#9A9A9A] hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
          {isStaff && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full text-left rtl:text-right px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-[#DF9F64] bg-[#C8874B]/10 hover:bg-[#C8874B]/20 border border-[#C8874B]/20 cursor-pointer"
            >
              {t('nav.adminPanel')}
            </button>
          )}
        </div>
      )}
    </header>
  );
};
