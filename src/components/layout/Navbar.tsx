import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { apiClient } from '../../services/apiClient';
import { FiveMTelemetry } from '../../types';
import { PrimeLogo } from '../common/PrimeLogo';
import {
  ShoppingBag,
  Globe,
  Crown,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Ticket,
  Play,
  Terminal
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  setIsCartOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, setIsCartOpen }) => {
  const { t, language, setLanguage } = useLanguage();
  const { user, isAuthenticated, logout, isStaff } = useAuth();
  const { totalItems, setIsCartOpen: setCartOpenContext } = useCart();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<FiveMTelemetry | null>(null);

  const handleOpenCart = () => {
    if (setIsCartOpen) {
      setIsCartOpen(true);
    } else {
      setCartOpenContext(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function loadTelemetry() {
      try {
        const data = await apiClient.getFiveMStatus();
        if (data) setTelemetry(data);
      } catch (e) {
        // quiet fallback
      }
    }
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 30000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { id: 'home', label: t('nav.home') },
    { id: 'about', label: language === 'ar' ? 'من نحن' : 'About' },
    { id: 'store', label: t('nav.store') },
    { id: 'rules', label: t('nav.rules') },
    { id: 'jobs', label: t('nav.jobs') },
    { id: 'players', label: t('nav.players') },
    { id: 'leaderboard', label: t('nav.leaderboard') },
    { id: 'news', label: t('nav.news') },
    { id: 'faq', label: t('nav.faq') },
    { id: 'support', label: t('nav.support') },
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

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const isOnline = telemetry?.online || (telemetry?.playersCount !== undefined && telemetry?.playersCount > 0);
  const playersOnline = isOnline ? (telemetry?.playersCount ?? 0) : 0;
  const maxPlayers = telemetry?.maxPlayers || 150;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-6 pt-3 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        <div
          className={`flex items-center justify-between rounded-2xl transition-all duration-300 px-4 sm:px-5 py-2.5 ${
            isScrolled
              ? 'bg-[#0b0d14]/92 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/90'
              : 'bg-[#0b0d14]/80 backdrop-blur-xl border border-white/[0.06] shadow-xl'
          }`}
        >
          {/* BRAND LOGO */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c8874b] rounded-xl group transition-transform hover:scale-105 cursor-pointer"
            >
              <PrimeLogo size="md" variant="navbar" showText={true} withGlow={true} />
            </button>

            {/* LIVE SERVER TELEMETRY PILL (EchoRP / ONX Style) */}
            <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#11131c] border border-white/[0.06]">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#969cad] font-rajdhani">
                {isOnline ? (
                  <>
                    <span className="text-white font-bold">{playersOnline}</span>
                    <span className="text-[#555]">/{maxPlayers}</span> {language === 'ar' ? 'متصل' : 'ONLINE'}
                  </>
                ) : (
                  <span className="text-amber-400">{language === 'ar' ? 'تهيئة السيرفر' : 'STANDBY'}</span>
                )}
              </span>
            </div>
          </div>

          {/* DESKTOP NAVIGATION LINKS */}
          <nav className="hidden xl:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    active
                      ? 'text-[#df9f64] bg-[#c8874b]/15 border border-[#c8874b]/40 shadow-sm'
                      : 'text-[#969cad] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-[2px] bg-[#c8874b] rounded-full shadow-sm shadow-[#c8874b]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Direct Connect Action (EchoRP Style) */}
            <button
              onClick={() => {
                if (telemetry?.ip && telemetry?.port) {
                  window.location.href = `fivem://connect/${telemetry.ip}:${telemetry.port}`;
                } else {
                  handleNavClick('players');
                }
              }}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#c8874b]/20 active:scale-95 cursor-pointer"
              title={language === 'ar' ? 'اتصال مباشر بالسيرفر' : 'Direct FiveM Connect'}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{language === 'ar' ? 'دخول السيرفر' : 'Connect'}</span>
            </button>

            {/* Store Shopping Cart (DusaDev Style) */}
            <button
              onClick={handleOpenCart}
              className="relative p-2.5 rounded-xl bg-[#11131c] border border-white/[0.06] hover:border-[#c8874b]/60 text-[#969cad] hover:text-[#df9f64] transition-all cursor-pointer group shadow-sm"
              title={language === 'ar' ? 'سلة المشتريات' : 'Shopping Cart'}
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 rtl:-right-auto rtl:-left-1.5 w-5 h-5 rounded-full bg-[#c8874b] text-black text-[10px] font-black flex items-center justify-center shadow-md shadow-[#c8874b]/40">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#969cad] hover:text-[#df9f64] bg-[#11131c] border border-white/[0.06] hover:border-[#c8874b]/50 transition-all cursor-pointer"
              title="Switch Language / تغيير اللغة"
              aria-label="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#c8874b]" />
              <span className="text-[11px]">{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* User Session / Discord Login */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rtl:pl-1.5 rtl:pr-3 rounded-xl bg-[#11131c] border border-white/[0.06] hover:border-[#c8874b] transition-all focus:outline-none cursor-pointer"
                >
                  <span className="text-xs font-bold text-white max-w-[90px] truncate hidden sm:inline">
                    {user.globalName || user.username}
                  </span>
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                    alt={user.username}
                    className="w-7 h-7 rounded-lg border border-[#c8874b] object-cover"
                  />
                  <ChevronDown className="w-3 h-3 text-[#969cad]" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-[#0d0f16] border border-white/[0.08] rounded-2xl shadow-2xl py-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <p className="text-[10px] text-[#666] uppercase tracking-wider font-semibold">
                        {language === 'ar' ? 'المواطن المصادق' : 'Authenticated Citizen'}
                      </p>
                      <p className="font-black text-white truncate text-sm mt-0.5">
                        {user.globalName || user.username}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-black rounded-md bg-[#c8874b]/15 text-[#df9f64] border border-[#c8874b]/30 uppercase font-rajdhani">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => handleNavClick('dashboard')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-left rtl:text-right text-[#969cad] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer text-xs font-semibold"
                    >
                      <UserIcon className="w-4 h-4 text-[#c8874b]" />
                      <span>{t('userDashboard.overview')}</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('tickets')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-left rtl:text-right text-[#969cad] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer text-xs font-semibold"
                    >
                      <Ticket className="w-4 h-4 text-[#c8874b]" />
                      <span>{t('nav.tickets')}</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('orders')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-left rtl:text-right text-[#969cad] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer text-xs font-semibold"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#c8874b]" />
                      <span>{t('nav.orders')}</span>
                    </button>

                    {isStaff && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-left rtl:text-right text-[#df9f64] hover:bg-[#c8874b]/10 transition-colors font-bold border-t border-white/[0.06] cursor-pointer text-xs"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#c8874b]" />
                        <span>{t('nav.adminPanel')}</span>
                      </button>
                    )}

                    <div className="border-t border-white/[0.06] mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-left rtl:text-right text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-semibold cursor-pointer"
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
                className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] active:scale-95 text-black text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#c8874b]/20 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{t('nav.loginDiscord')}</span>
                <span className="xs:hidden">{language === 'ar' ? 'دخول' : 'Login'}</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-[#11131c] border border-white/[0.06] text-[#969cad] hover:text-white cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE RESPONSIVE DRAWER */}
        {mobileMenuOpen && (
          <div className="xl:hidden mt-2 bg-[#0b0d14]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl px-4 pt-4 pb-5 space-y-1 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            {/* Mobile Server status bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#11131c] border border-white/[0.06] mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-xs font-bold text-white uppercase">
                  {isOnline ? (language === 'ar' ? 'السيرفر متاح' : 'Server Online') : (language === 'ar' ? 'قيد الصيانة' : 'Standby')}
                </span>
              </div>
              <span className="text-xs font-bold text-[#c8874b] font-rajdhani">
                {playersOnline} / {maxPlayers} {language === 'ar' ? 'لاعب' : 'Slots'}
              </span>
            </div>

            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left rtl:text-right px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  currentTab === link.id
                    ? 'bg-[#c8874b]/15 text-[#df9f64] border border-[#c8874b]/40'
                    : 'text-[#969cad] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}

            {isStaff && (
              <button
                onClick={() => handleNavClick('admin')}
                className="w-full text-left rtl:text-right px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-[#df9f64] bg-[#c8874b]/10 hover:bg-[#c8874b]/20 border border-[#c8874b]/30 cursor-pointer"
              >
                {t('nav.adminPanel')}
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
