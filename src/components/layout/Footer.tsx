import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import { PrimeLogo } from '../common/PrimeLogo';
import { Shield, MessageSquare, Copy, Check, ExternalLink, Activity, Terminal } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { t, language } = useLanguage();
  const { settings } = useSettings();
  const [copiedIp, setCopiedIp] = useState<boolean>(false);

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyIp = () => {
    const connectTarget = settings?.fiveMConnectUrl || 'play.primerp.me';
    navigator.clipboard.writeText(connectTarget.startsWith('connect ') ? connectTarget : `connect ${connectTarget}`);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  return (
    <footer className="bg-[#050505] border-t border-[#1C1C20] pt-16 pb-12 text-[#9A9A9A] relative overflow-hidden">
      {/* Background Subtle Glow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#C8874B]/5 blur-3xl pointer-events-none rounded-full" 
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* BRAND COLUMN */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <PrimeLogo size="md" variant="footer" showText={true} withGlow={false} />
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-[#888] max-w-sm">
              {t('footer.aboutText')}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <a
                href={settings?.discordUrl || "https://discord.gg/primerp"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0D0D0F] border border-[#222226] hover:border-[#5865F2]/60 text-xs font-bold text-white transition-all shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />
                <span>Discord Community</span>
              </a>

              <button
                onClick={handleCopyIp}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/60 text-xs font-bold text-[#E5E5E5] transition-all cursor-pointer shadow-sm"
                title={language === 'ar' ? 'نسخ أمر الاتصال بالسيرفر' : 'Copy Server Direct Connect'}
              >
                <Terminal className="w-3.5 h-3.5 text-[#C8874B]" />
                <span>F8 Connect</span>
                {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#777]" />}
              </button>
            </div>
          </div>

          {/* QUICK NAVIGATION */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4 border-b border-[#1C1C20] pb-2">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-[#C8874B] transition-colors cursor-pointer">
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('rules')} className="hover:text-[#C8874B] transition-colors cursor-pointer">
                  {t('nav.rules')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('jobs')} className="hover:text-[#C8874B] transition-colors cursor-pointer">
                  {t('nav.jobs')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('news')} className="hover:text-[#C8874B] transition-colors cursor-pointer">
                  {t('nav.news')}
                </button>
              </li>
            </ul>
          </div>

          {/* COMMUNITY & PORTAL */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4 border-b border-[#1C1C20] pb-2">
              {t('footer.community')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNav('store')} className="hover:text-[#C8874B] transition-colors cursor-pointer">
                  {t('nav.store')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('players')} className="hover:text-[#C8874B] transition-colors cursor-pointer">
                  {t('nav.players')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('leaderboard')} className="hover:text-[#C8874B] transition-colors cursor-pointer">
                  {t('nav.leaderboard')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('support')} className="hover:text-[#C8874B] transition-colors cursor-pointer">
                  {t('nav.support')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} className="hover:text-[#C8874B] transition-colors cursor-pointer">
                  {t('nav.faq')}
                </button>
              </li>
            </ul>
          </div>

          {/* LEGAL & POLICIES */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4 border-b border-[#1C1C20] pb-2">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNav('legal-terms')} className="hover:text-[#C8874B] transition-colors cursor-pointer">
                  {t('footer.terms')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('legal-privacy')} className="hover:text-[#C8874B] transition-colors cursor-pointer">
                  {t('footer.privacy')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} className="hover:text-[#C8874B] transition-colors cursor-pointer">
                  {t('nav.faq')}
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 mt-8 border-t border-[#151518] flex flex-col sm:flex-row items-center justify-between text-xs gap-4 text-[#777]">
          <p>
            {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8874B]" />
              Crafted for <span className="text-white font-bold">PRIME RP Community</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
