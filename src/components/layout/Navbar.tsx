import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
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
  const { settings } = useSettings();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState<boolean>(false);
  const [copiedConnect, setCopiedConnect] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<FiveMTelemetry | null>(null);
  const [, setVisibilityTick] = useState<number>(0);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const handleDirectConnect = () => {
    const rawUrl = settings?.fiveMConnectUrl || 'fivem://connect/cfx.re/join/7o5gxr';
    const targetUrl = rawUrl.startsWith('fivem://') ? rawUrl : `fivem://connect/${rawUrl.replace(/^connect\s+/, '').trim()}`;
    window.location.href = targetUrl;
    try {
      navigator.clipboard.writeText('connect cfx.re/join/7o5gxr');
      setCopiedConnect(true);
      setTimeout(() => setCopiedConnect(false), 2500);
    } catch {}
  };

  // Helper to determine if a page should be shown with instant localStorage reactivity
  const isPageVisible = (id: string): boolean => {
    if (id === 'home') return true;
    try {
      const cached = localStorage.getItem('prime_page_visibility');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object' && parsed[id] !== undefined) {
          return parsed[id] !== false;
        }
      }
    } catch {}
    if (!settings?.pageVisibility) return true;
    return (settings.pageVisibility as any)[id] !== false;
  };

  // Listen to visibility updates across tabs and components
  useEffect(() => {
    const handleUpdate = () => {
      setVisibilityTick((prev) => prev + 1);
    };
    window.addEventListener('prime_page_visibility_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('prime_page_visibility_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);

    setCurrentTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const isOnline = telemetry?.online || (telemetry?.playersCount !== undefined && telemetry?.playersCount > 0);
  const playersOnline = isOnline ? (telemetry?.playersCount ?? 0) : 0;
  const maxPlayers = telemetry?.maxPlayers || 150;

  // Dynamic distribution based on page visibility
  const allNavLinks = [
    { id: 'home', label: t('nav.home') },
    { id: 'store', label: t('nav.store') },
    { id: 'rules', label: t('nav.rules') },
    { id: 'jobs', label: t('nav.jobs') },
    { id: 'players', label: t('nav.players') },
    { id: 'leaderboard', label: t('nav.leaderboard') },
    { id: 'news', label: t('nav.news') },
    { id: 'faq', label: t('nav.faq') },
    { id: 'support', label: t('nav.support') },
  ];
  const navLinks = allNavLinks.filter((link) => isPageVisible(link.id));

  // Dynamic splitting: 5 or fewer links show all directly in center.
  // 6 or more links show top 5 + "More" dropdown to guarantee zero collisions on all resolutions.
  const MAX_PRIMARY_COUNT = 5;
  const shouldSplit = navLinks.length > MAX_PRIMARY_COUNT;
  const primaryNavLinks = shouldSplit ? navLinks.slice(0, MAX_PRIMARY_COUNT) : navLinks;
  const overflowNavLinks = shouldSplit ? navLinks.slice(MAX_PRIMARY_COUNT) : [];

  const isOverflowActive = overflowNavLinks.some(link => link.id === currentTab);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-2 sm:px-4 md:px-6 pt-2 pointer-events-none w-full max-w-full overflow-visible">
      <div className="max-w-7xl mx-auto pointer-events-auto space-y-1.5 w-full min-w-0 overflow-visible">
        
        {/* TOP UTILITY STRIP (No Server Name, Safe Overflow) */}
        <div className={`hidden md:flex items-center justify-between px-4 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 w-full min-w-0 overflow-hidden ${
          isScrolled ? 'opacity-0 h-0 overflow-hidden py-0 my-0' : 'bg-[#070707]/75 backdrop-blur-md border border-white/[0.04] text-[#A1A1A1]'
        }`}>
          <div className="flex items-center gap-2 font-rajdhani shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#C8874B] animate-pulse" />
            <span className="text-[#DF9F64] text-[10px] font-bold tracking-wider">
              {language === 'ar' ? 'سيرفر فايف ام رول بلاي' : 'FIVEM ROLEPLAY'}
            </span>
            <span className="text-[#555]">•</span>
            <span className="text-[#888] text-[10px] hidden sm:inline">
              {language === 'ar' ? 'تجربة واقعية متكاملة' : 'PREMIUM COMMUNITY'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-montserrat tracking-widest text-[#DF9F64] shrink-0 truncate">
            <span>A NEW ERA</span>
            <span className="text-white/20">•</span>
            <span>A REALER WORLD</span>
          </div>

          <div className="text-[10px] italic text-[#888] font-serif shrink-0 hidden lg:block truncate">
            &ldquo;More Than a Server, A Community.&rdquo;
          </div>
        </div>

        {/* MAIN NAVBAR BAR - Isolated background prevents Chromium backdrop-filter clipping bug on children dropdowns */}
        <div className="relative rounded-2xl w-full min-w-0 overflow-visible">
          {/* Glassmorphism Background Layer */}
          <div
            className={`absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300 ${
              isScrolled
                ? 'bg-[#0b0d14]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/90'
                : 'bg-[#0b0d14]/85 backdrop-blur-xl border border-white/[0.06] shadow-xl'
            }`}
          />

          {/* Foreground Row: Logo at Start, Actions at End, Center Navigation floating at 50% midpoint */}
          <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 w-full min-w-0 overflow-visible">
            {/* BRAND LOGO (Start-aligned, never shrink) */}
            <div className="flex items-center justify-start gap-2 sm:gap-3 shrink-0 z-10 min-w-[65px]">
              <button
                onClick={() => handleNavClick('home')}
                className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c8874b] rounded-xl group transition-transform hover:scale-105 cursor-pointer"
                title={language === 'ar' ? 'الصفحة الرئيسية' : 'Home'}
              >
                <PrimeLogo size="md" variant="navbar" showText={false} withGlow={true} />
              </button>
            </div>

            {/* RIGHT / END ACTION BUTTONS (End-aligned, never shrink, always accessible) */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 z-10">
              {/* Direct Connect Action (EchoRP Style) */}
              <button
                onClick={handleDirectConnect}
                className={`hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
                  copiedConnect
                    ? 'bg-emerald-500 text-black shadow-emerald-500/30'
                    : 'bg-[#c8874b] hover:bg-[#df9f64] text-black shadow-[#c8874b]/20'
                }`}
                title={language === 'ar' ? 'اتصال مباشر بالسيرفر: connect cfx.re/join/7o5gxr' : 'Direct FiveM Connect: connect cfx.re/join/7o5gxr'}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>
                  {copiedConnect
                    ? (language === 'ar' ? 'تم نسخ الرابط!' : 'Copied!')
                    : (language === 'ar' ? 'دخول' : 'Connect')}
                </span>
              </button>

              {/* Store Shopping Cart (DusaDev Style) */}
              {isPageVisible('store') && (
                <button
                  onClick={handleOpenCart}
                  className="relative p-2 sm:p-2.5 rounded-xl bg-[#11131c] border border-white/[0.06] hover:border-[#c8874b]/60 text-[#969cad] hover:text-[#df9f64] transition-all cursor-pointer group shadow-sm shrink-0"
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
              )}

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#969cad] hover:text-[#df9f64] bg-[#11131c] border border-white/[0.06] hover:border-[#c8874b]/50 transition-all cursor-pointer shrink-0"
                title="Switch Language / تغيير اللغة"
                aria-label="Switch Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#c8874b]" />
                <span className="text-[11px] font-bold">{language === 'ar' ? 'EN' : 'عربي'}</span>
              </button>

            {/* User Session / Discord Login */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-2 p-1.5 pl-3 rtl:pl-1.5 rtl:pr-3 rounded-xl bg-[#11131c] border transition-all focus:outline-none cursor-pointer ${
                    userDropdownOpen
                      ? 'border-[#c8874b] shadow-[0_0_15px_rgba(200,135,75,0.25)]'
                      : 'border-white/[0.06] hover:border-[#c8874b]/70'
                  }`}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="text-xs font-bold text-white max-w-[90px] truncate hidden sm:inline">
                    {user.globalName || user.username}
                  </span>
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                    alt={user.username}
                    className="w-7 h-7 rounded-lg border border-[#c8874b] object-cover shrink-0"
                  />
                  <ChevronDown className={`w-3.5 h-3.5 text-[#969cad] transition-transform duration-200 ${userDropdownOpen ? 'rotate-180 text-[#df9f64]' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2.5 w-64 bg-[#0d0f17] border border-[#c8874b]/40 rounded-2xl shadow-2xl shadow-black/95 py-2 z-[9999] text-sm overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-[10px] text-[#888] uppercase tracking-wider font-semibold">
                          {language === 'ar' ? 'المواطن المصادق' : 'Authenticated Citizen'}
                        </p>
                        <p className="font-black text-white truncate text-sm mt-0.5">
                          {user.globalName || user.username}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-black rounded-md bg-[#c8874b]/15 text-[#df9f64] border border-[#c8874b]/30 uppercase font-rajdhani">
                            {user.role}
                          </span>
                          {user.isOwner && (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-black rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-rajdhani">
                              OWNER
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            handleNavClick('dashboard');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-left rtl:text-right text-[#969cad] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer text-xs font-semibold"
                        >
                          <UserIcon className="w-4 h-4 text-[#c8874b]" />
                          <span>{t('userDashboard.overview')}</span>
                        </button>

                        <button
                          onClick={() => {
                            handleNavClick('tickets');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-left rtl:text-right text-[#969cad] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer text-xs font-semibold"
                        >
                          <Ticket className="w-4 h-4 text-[#c8874b]" />
                          <span>{t('nav.tickets')}</span>
                        </button>

                        <button
                          onClick={() => {
                            handleNavClick('orders');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-left rtl:text-right text-[#969cad] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer text-xs font-semibold"
                        >
                          <ShoppingBag className="w-4 h-4 text-[#c8874b]" />
                          <span>{t('nav.orders')}</span>
                        </button>

                        {isStaff && (
                          <button
                            onClick={() => {
                              handleNavClick('admin');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-left rtl:text-right text-[#df9f64] hover:bg-[#c8874b]/10 transition-colors font-bold border-t border-white/[0.06] cursor-pointer text-xs"
                          >
                            <ShieldCheck className="w-4 h-4 text-[#c8874b]" />
                            <span>{t('nav.adminPanel')}</span>
                          </button>
                        )}
                      </div>

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
                    </motion.div>
                  )}
                </AnimatePresence>
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
              className="lg:hidden p-2 rounded-xl bg-[#11131c] border border-white/[0.06] text-[#969cad] hover:text-white cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* DESKTOP NAVIGATION DOCK: Mathematically dead-centered on the header bar */}
          <div className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 pointer-events-auto max-w-[calc(100%-460px)]">
            <nav
              className={`flex items-center justify-center bg-[#08090d]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/80 transition-all duration-300 ${
                primaryNavLinks.length <= 3
                  ? 'p-1.5 sm:p-2 rounded-2xl gap-2 sm:gap-3 min-w-[340px] sm:min-w-[420px]'
                  : primaryNavLinks.length === 4
                  ? 'p-1.5 rounded-2xl gap-1.5 sm:gap-2 min-w-[400px] sm:min-w-[480px]'
                  : 'p-1 sm:p-1.5 rounded-2xl gap-1 sm:gap-1.5'
              }`}
              aria-label="Main Navigation"
            >
              {primaryNavLinks.map((link) => {
                const active = currentTab === link.id;
                const linkPadding = primaryNavLinks.length <= 3
                  ? 'flex-1 text-center justify-center px-6 sm:px-7 py-2.5 text-xs sm:text-sm font-black'
                  : primaryNavLinks.length === 4
                  ? 'flex-1 text-center justify-center px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold'
                  : 'px-3 xl:px-3.5 py-1.5 text-xs font-bold';

                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`relative ${linkPadding} rounded-xl uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      active
                        ? 'text-[#df9f64]'
                        : 'text-[#969cad] hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="activeNavbarPill"
                        className="absolute inset-0 bg-[#c8874b]/15 border border-[#c8874b]/40 rounded-xl shadow-[0_0_20px_rgba(200,135,75,0.25)]"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </button>
                );
              })}

              {/* "More" Dropdown when overflow links exist */}
              {overflowNavLinks.length > 0 && (
                <div className="relative" ref={moreMenuRef}>
                  <button
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                      isOverflowActive || moreMenuOpen
                        ? 'text-[#df9f64] bg-[#c8874b]/15 border border-[#c8874b]/40'
                        : 'text-[#969cad] hover:text-white hover:bg-white/[0.04]'
                    }`}
                    aria-expanded={moreMenuOpen}
                  >
                    <span>{language === 'ar' ? 'المزيد' : 'More'}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180 text-[#df9f64]' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {moreMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute top-full left-1/2 -translate-x-1/2 rtl:left-auto rtl:right-0 rtl:translate-x-0 mt-2 w-44 bg-[#0d0f17] border border-[#c8874b]/40 rounded-2xl shadow-2xl shadow-black/90 py-1.5 z-50 overflow-hidden"
                      >
                        {overflowNavLinks.map((link) => (
                          <button
                            key={link.id}
                            onClick={() => {
                              handleNavClick(link.id);
                              setMoreMenuOpen(false);
                            }}
                            className={`w-full text-left rtl:text-right px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                              currentTab === link.id
                                ? 'text-[#df9f64] bg-[#c8874b]/10'
                                : 'text-[#969cad] hover:text-white hover:bg-white/[0.04]'
                            }`}
                          >
                            {link.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>

        {/* MOBILE RESPONSIVE DRAWER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden mt-2 bg-[#0b0d14]/98 backdrop-blur-2xl border border-white/[0.08] rounded-2xl px-4 pt-4 pb-5 space-y-1 shadow-2xl"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
