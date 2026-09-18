import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import { PrimeLogo } from '../common/PrimeLogo';
import { MessageSquare, Copy, Check, Terminal } from 'lucide-react';

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
    const connectTarget = settings?.fiveMConnectUrl || 'play.primerp.net:30120';
    navigator.clipboard.writeText(connectTarget.startsWith('connect ') ? connectTarget : `connect ${connectTarget}`);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  return (
    <footer className="bg-[#06070a] border-t border-white/[0.06] pt-16 pb-12 text-[#969cad] relative overflow-hidden">
      {/* Background Subtle Glow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#c8874b]/5 blur-3xl pointer-events-none rounded-full" 
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* BRAND COLUMN */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <PrimeLogo size="md" variant="footer" showText={true} withGlow={true} />
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-[#7a8091] max-w-sm">
              {t('footer.aboutText')}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <a
                href={settings?.discordUrl || "https://discord.gg/primerp"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0d0f16] border border-white/[0.08] hover:border-[#5865F2]/60 text-xs font-bold text-white transition-all shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />
                <span>Discord Community</span>
              </a>

              <button
                onClick={handleCopyIp}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0d0f16] border border-white/[0.08] hover:border-[#c8874b]/60 text-xs font-bold text-[#f1f3f7] transition-all cursor-pointer shadow-sm"
                title={language === 'ar' ? 'نسخ أمر الاتصال بالسيرفر' : 'Copy Server Direct Connect'}
              >
                <Terminal className="w-3.5 h-3.5 text-[#c8874b]" />
                <span>F8 Connect</span>
                {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#777]" />}
              </button>
            </div>
          </div>

          {/* QUICK NAVIGATION */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4 border-b border-white/[0.06] pb-2 font-rajdhani">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-[#df9f64] transition-colors cursor-pointer">
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('rules')} className="hover:text-[#df9f64] transition-colors cursor-pointer">
                  {t('nav.rules')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('jobs')} className="hover:text-[#df9f64] transition-colors cursor-pointer">
                  {t('nav.jobs')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('news')} className="hover:text-[#df9f64] transition-colors cursor-pointer">
                  {t('nav.news')}
                </button>
              </li>
            </ul>
          </div>

          {/* COMMUNITY & PORTAL */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4 border-b border-white/[0.06] pb-2 font-rajdhani">
              {t('footer.community')}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => handleNav('store')} className="hover:text-[#df9f64] transition-colors cursor-pointer">
                  {t('nav.store')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('players')} className="hover:text-[#df9f64] transition-colors cursor-pointer">
                  {t('nav.players')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('leaderboard')} className="hover:text-[#df9f64] transition-colors cursor-pointer">
                  {t('nav.leaderboard')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('support')} className="hover:text-[#df9f64] transition-colors cursor-pointer">
                  {t('nav.support')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} className="hover:text-[#df9f64] transition-colors cursor-pointer">
                  {t('nav.faq')}
                </button>
              </li>
            </ul>
          </div>

          {/* LEGAL & POLICIES */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4 border-b border-white/[0.06] pb-2 font-rajdhani">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => handleNav('legal-terms')} className="hover:text-[#df9f64] transition-colors cursor-pointer">
                  {t('footer.terms')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('legal-privacy')} className="hover:text-[#df9f64] transition-colors cursor-pointer">
                  {t('footer.privacy')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} className="hover:text-[#df9f64] transition-colors cursor-pointer">
                  {t('nav.faq')}
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* POSTER SIGNATURE BRANDING BAR */}
        <div className="py-8 my-8 border-y border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left rtl:md:text-right">
          <div className="flex items-center gap-3">
            <PrimeLogo size="sm" variant="footer" showText={false} withGlow={true} />
            <div>
              <div className="text-white font-black tracking-wider text-sm font-rajdhani">PRIME RP</div>
              <div className="text-[10px] text-[#A1A1A1] uppercase font-bold tracking-widest">PREMIUM FIVEM ROLEPLAY</div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-sm sm:text-base font-black tracking-widest text-[#DF9F64] uppercase font-rajdhani">
              A BIGGER STORY AWAITS
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#A1A1A1] tracking-wider uppercase mt-0.5">
              <span>PLAY</span>
              <span className="text-[#C8874B]">•</span>
              <span>ROLEPLAY</span>
              <span className="text-[#C8874B]">•</span>
              <span>BELONG</span>
            </div>
          </div>

          <div className="text-xs italic text-[#888] font-serif">
            &ldquo;Same World. A New Experience.&rdquo;
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs gap-4 text-[#666]">
          <p>
            {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#888]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8874b] animate-pulse" />
              Sovereign Roleplay Engine • <span className="text-white font-bold">PRIME RP</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
