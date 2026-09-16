import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PrimeLogo } from '../common/PrimeLogo';
import { Shield, MessageSquare, ExternalLink, Heart } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { t } = useLanguage();

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050505] border-t border-[#1C1C1C] pt-16 pb-12 text-[#9E9E9E] relative overflow-hidden">
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
            <p className="text-sm leading-relaxed text-[#A0A0A0] max-w-sm">
              {t('footer.aboutText')}
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://discord.gg/primerp"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#111] border border-[#222] hover:border-[#C8874B] text-xs font-semibold text-[#E5E5E5] transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />
                <span>Discord Community</span>
              </a>
              <span className="text-xs px-2.5 py-1 rounded bg-[#181818] text-[#888] border border-[#262626]">
                FiveM RP v3.0
              </span>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#E5E5E5] mb-4 border-b border-[#222] pb-2">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-[#C8874B] transition-colors">
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('rules')} className="hover:text-[#C8874B] transition-colors">
                  {t('nav.rules')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('jobs')} className="hover:text-[#C8874B] transition-colors">
                  {t('nav.jobs')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('news')} className="hover:text-[#C8874B] transition-colors">
                  {t('nav.news')}
                </button>
              </li>
            </ul>
          </div>

          {/* COMMUNITY & PORTAL */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#E5E5E5] mb-4 border-b border-[#222] pb-2">
              {t('footer.community')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleNav('store')} className="hover:text-[#C8874B] transition-colors">
                  {t('nav.store')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('players')} className="hover:text-[#C8874B] transition-colors">
                  {t('nav.players')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('leaderboard')} className="hover:text-[#C8874B] transition-colors">
                  {t('nav.leaderboard')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('support')} className="hover:text-[#C8874B] transition-colors">
                  {t('nav.support')}
                </button>
              </li>
            </ul>
          </div>

          {/* LEGAL & POLICIES */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#E5E5E5] mb-4 border-b border-[#222] pb-2">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleNav('legal-terms')} className="hover:text-[#C8874B] transition-colors">
                  {t('footer.terms')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('legal-privacy')} className="hover:text-[#C8874B] transition-colors">
                  {t('footer.privacy')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} className="hover:text-[#C8874B] transition-colors">
                  {t('nav.faq')}
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 mt-8 border-t border-[#181818] flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p className="text-[#777]">
            {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4 text-[#777]">
            <span className="flex items-center gap-1">
              Crafted for <span className="text-[#C8874B] font-semibold">PRIME RP Community</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
