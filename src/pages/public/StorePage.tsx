import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { apiClient } from '../../services/apiClient';
import { ProductItem, FiveMTelemetry } from '../../types';
import { ProductSpotlightCard } from '../../components/store/ProductSpotlightCard';
import { ProductDetailModal } from '../../components/store/ProductDetailModal';
import { CartDrawer } from '../../components/store/CartDrawer';
import { MagneticButton } from '../../components/common/MagneticButton';
import { 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Search, 
  X, 
  CheckCircle2, 
  ExternalLink,
  ChevronDown,
  HelpCircle,
  Users,
  Wifi,
  Flame,
  Check,
  AlertCircle,
  Car,
  Home,
  Layers,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StorePageProps {
  setCurrentTab: (tab: string) => void;
}

export const StorePage: React.FC<StorePageProps> = ({ setCurrentTab }) => {
  const { t, language, isRtl } = useLanguage();
  const { isAuthenticated, loginWithDiscord } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();

  // Data States
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [serverStatus, setServerStatus] = useState<FiveMTelemetry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [inspectedProduct, setInspectedProduct] = useState<ProductItem | null>(null);
  const [directCheckoutProduct, setDirectCheckoutProduct] = useState<ProductItem | null>(null);
  const [isProcessingDirectCheckout, setIsProcessingDirectCheckout] = useState<boolean>(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<any>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Active FAQ Accordion index
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Catalog anchor ref for smooth scrolling
  const catalogRef = useRef<HTMLDivElement | null>(null);

  // Load Products & Server Telemetry
  useEffect(() => {
    async function initData() {
      try {
        const [productsData, statusData] = await Promise.all([
          apiClient.getProducts(),
          apiClient.getFiveMStatus().catch(() => null),
        ]);
        setProducts(productsData || []);
        if (statusData) setServerStatus(statusData);
      } catch (err) {
        console.error('Failed to load store data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  // Compute Categories with item counts
  const categoriesList = ['all', 'VIP', 'VEHICLES', 'PROPERTIES', 'BUNDLES'];
  const categoryCounts = categoriesList.reduce((acc, cat) => {
    acc[cat] = cat === 'all' 
      ? products.length 
      : products.filter(p => p.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    const matchesCat = selectedCategory === 'all' || prod.category === selectedCategory;
    if (!matchesCat) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const trans = prod.translations[language] || prod.translations.ar || prod.translations.en;
    const matchName = trans.name.toLowerCase().includes(query);
    const matchDesc = trans.description.toLowerCase().includes(query);
    const matchPerk = trans.perks.some(p => p.toLowerCase().includes(query));
    return matchName || matchDesc || matchPerk;
  });

  // Featured Products
  const featuredProducts = products.filter(p => p.featured);
  const flagshipProduct = featuredProducts.find(p => p.price === Math.max(...featuredProducts.map(fp => fp.price))) || featuredProducts[0];
  const secondaryFeatured = featuredProducts.filter(p => p.id !== flagshipProduct?.id);

  // Smooth scroll to catalog
  const scrollToCatalog = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Direct checkout handler (modal)
  const handleDirectCheckout = async () => {
    if (!directCheckoutProduct) return;
    if (!isAuthenticated) {
      setDirectCheckoutProduct(null);
      setCurrentTab('login');
      return;
    }

    setIsProcessingDirectCheckout(true);
    setCheckoutError(null);

    try {
      const res = await apiClient.checkoutOrder(directCheckoutProduct.id);
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
        return;
      }
      const createdOrder = res.order || (res.id ? res : null);
      if (createdOrder) {
        setCheckoutSuccess(createdOrder);
        setDirectCheckoutProduct(null);
      } else {
        setCheckoutError(res.error || (language === 'ar' ? 'بوابة الدفع الإلكتروني قيد التهيئة الإدارية.' : 'Payment gateway is pending configuration.'));
      }
    } catch (err: any) {
      setCheckoutError(err.message || (language === 'ar' ? 'حدث خطأ أثناء معالجة الطلب' : 'An error occurred during checkout'));
    } finally {
      setIsProcessingDirectCheckout(false);
    }
  };

  // Store FAQs
  const storeFaqs = [
    {
      qAr: 'كيف يتم تسليم المشتريات داخل السيرفر؟',
      qEn: 'How are purchases disbursed in-game?',
      aAr: 'تتم عملية التسليم آلياً وفورياً خلال 30 إلى 60 ثانية عبر نظام Prime Connect. سيصلك إشعار فوري داخل اللعبة مع تفعيل كافة الصلاحيات والأصول.',
      aEn: 'Delivery is processed automatically via Prime Connect within 30-60 seconds. You will receive an immediate in-game HUD alert confirming activation.'
    },
    {
      qAr: 'هل أحتاج لتسجيل الدخول عبر Discord قبل الشراء؟',
      qEn: 'Is Discord authentication mandatory before purchase?',
      aAr: 'نعم، تسجيل الدخول يربط هويتك الرسمية في السيرفر مع حساب المتجر لضمان مزامنة رتبة VIP وتفعيل صلاحيات قنوات النخبة في الديسكورد.',
      aEn: 'Yes, authentication binds your citizen identity with our database to ensure seamless Discord VIP role synchronization and permissions.'
    },
    {
      qAr: 'ما هي طرق الدفع المدعومة والمعتمدة؟',
      qEn: 'Which payment processors are supported?',
      aAr: 'ندعم بوابات دفع آمنة ومشفرة بالكامل تشمل بطاقات Visa وMasterCard وApple Pay وMada عبر تكاملات Tebex وStripe الآمنة.',
      aEn: 'We support certified 256-bit encrypted gateways including Visa, MasterCard, Apple Pay, and Mada via Tebex/Stripe infrastructures.'
    },
    {
      qAr: 'ماذا أفعل في حال واجهت أي مشكلة أثناء أو بعد الشراء؟',
      qEn: 'What if I encounter an issue with my order?',
      aAr: 'يمكنك فتح تذكرة دعم فوري عبر قسم الدعم الفني في الموقع، وسيقوم مسؤولو الإدارة بمراجعة رقم فاتورتك وحل طلبك خلال دقائق.',
      aEn: 'You can immediately submit a ticket via our Citizen Support Center. Our staff monitors orders 24/7 and resolves inquiries rapidly.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] relative overflow-hidden">
      
      {/* BACKGROUND ATMOSPHERIC GLOWS & MESH */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] bg-radial-mesh pointer-events-none opacity-60 z-0" />
      <div className="absolute top-24 left-1/4 w-96 h-96 rounded-full bg-[#C8874B]/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-60 right-1/4 w-80 h-80 rounded-full bg-[#1A2536]/20 blur-[130px] pointer-events-none z-0" />

      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative z-10 pt-32 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#141414]">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          
          {/* Live Telemetry Pill */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#121212]/90 border border-[#C8874B]/30 backdrop-blur-md text-xs shadow-lg shadow-black/60"
          >
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {serverStatus?.status || (serverStatus?.online ? 'ONLINE' : 'FIVE-M ONLINE')}
            </span>
            <span className="text-[#444]">•</span>
            <span className="text-[#BBB] flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#C8874B]" />
              <strong className="text-white font-mono">{serverStatus?.playersCount ?? serverStatus?.activePlayers ?? 128}</strong> / {serverStatus?.maxPlayers ?? 256} {language === 'ar' ? 'مواطن متصل' : 'Citizens Online'}
            </span>
            <span className="text-[#444] hidden sm:inline">•</span>
            <span className="text-[#DF9F64] font-medium hidden sm:inline flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {language === 'ar' ? 'التسليم الفوري مفعل' : 'Auto Delivery Active'}
            </span>
          </motion.div>

          {/* Main Title & Subheading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-4 max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.15]">
              {t('store.heroTitle')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8874B] via-[#DF9F64] to-[#E5A93C]">
                PRIME RP
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[#9E9E9E] max-w-2xl mx-auto leading-relaxed">
              {t('store.heroSubtitle')}
            </p>
          </motion.div>

          {/* Hero CTAs with Magnetic Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <MagneticButton onClick={scrollToCatalog}>
              <div className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#C8874B] to-[#DF9F64] hover:brightness-110 active:scale-98 text-black font-extrabold text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#C8874B]/25 flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span>{t('store.exploreCta')}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </div>
            </MagneticButton>

            <MagneticButton onClick={() => setCurrentTab('login')}>
              <div className="px-7 py-4 rounded-2xl bg-[#111111] hover:bg-[#181818] text-[#E0E0E0] hover:text-white font-bold text-sm uppercase tracking-wider transition-all border border-[#242424] hover:border-[#C8874B]/60 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C8874B]" />
                <span>{t('store.discordSyncCta')}</span>
              </div>
            </MagneticButton>
          </motion.div>

          {/* 4 Trust Value Pillars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-5xl mx-auto"
          >
            <div className="p-4 rounded-2xl bg-[#0D0D0D]/80 border border-[#1A1A1A] text-left rtl:text-right flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#C8874B]/10 border border-[#C8874B]/20 text-[#C8874B] shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">{t('store.perkInstant')}</h4>
                <p className="text-[11px] text-[#777] line-clamp-2">{t('store.perkInstantDesc')}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D0D0D]/80 border border-[#1A1A1A] text-left rtl:text-right flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">{t('store.perkSync')}</h4>
                <p className="text-[11px] text-[#777] line-clamp-2">{t('store.perkSyncDesc')}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D0D0D]/80 border border-[#1A1A1A] text-left rtl:text-right flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">{t('store.perkSecure')}</h4>
                <p className="text-[11px] text-[#777] line-clamp-2">{t('store.perkSecureDesc')}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D0D0D]/80 border border-[#1A1A1A] text-left rtl:text-right flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#E5A93C]/10 border border-[#E5A93C]/20 text-[#E5A93C] shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">{t('store.perkSupport')}</h4>
                <p className="text-[11px] text-[#777] line-clamp-2">{t('store.perkSupportDesc')}</p>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. FLAGSHIP FEATURED SPOTLIGHT SHOWCASE */}
      {flagshipProduct && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8874B] uppercase tracking-wider mb-2">
                <Flame className="w-4 h-4" />
                <span>{t('store.featuredPicks')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {language === 'ar' ? 'الباقات الأكثر تميزاً وطلباً' : 'Flagship Executive Highlights'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#8A8A8A] max-w-md">
              {t('store.featuredSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Flagship Large Card */}
            <div className="lg:col-span-8 rounded-3xl bg-[#0C0C0C] border border-[#252525] hover:border-[#C8874B]/60 transition-all duration-500 overflow-hidden relative shadow-2xl group flex flex-col justify-between">
              
              <div className="relative h-72 sm:h-96 overflow-hidden bg-black">
                <img
                  src={flagshipProduct.image}
                  alt={flagshipProduct.translations[language]?.name || flagshipProduct.translations.ar?.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-[#0C0C0C]/40 to-transparent" />

                {/* Badges */}
                <div className="absolute top-6 left-6 rtl:left-auto rtl:right-6 flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-[#C8874B] to-[#DF9F64] text-black text-xs font-black uppercase tracking-wider shadow-lg">
                    {language === 'ar' ? 'الباقة الملكية الأولى' : 'Pinnacle Flagship'}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs font-bold">
                    {flagshipProduct.category}
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h3 className="text-2xl sm:text-4xl font-black text-white mb-2">
                      {flagshipProduct.translations[language]?.name || flagshipProduct.translations.ar?.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#B5B5B5] max-w-xl line-clamp-2">
                      {flagshipProduct.translations[language]?.description || flagshipProduct.translations.ar?.description}
                    </p>
                  </div>
                  <div className="text-left rtl:text-right shrink-0">
                    <span className="text-3xl sm:text-4xl font-black text-[#C8874B] font-rajdhani">
                      ${flagshipProduct.price}
                    </span>
                    <span className="text-xs text-[#888] ml-1 rtl:ml-0 rtl:mr-1">USD</span>
                  </div>
                </div>
              </div>

              {/* Perks Strip & Actions */}
              <div className="p-6 sm:p-8 bg-[#0C0C0C] border-t border-[#1C1C1C]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {(flagshipProduct.translations[language]?.perks || flagshipProduct.translations.ar?.perks || [])
                    .slice(0, 4)
                    .map((perk, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-[#CCC]">
                        <CheckCircle2 className="w-4 h-4 text-[#C8874B] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{perk}</span>
                      </div>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#181818]">
                  <button
                    onClick={() => setInspectedProduct(flagshipProduct)}
                    className="text-xs text-[#AAA] hover:text-[#C8874B] font-bold underline transition-colors cursor-pointer"
                  >
                    {language === 'ar' ? 'عرض كافة المواصفات والامتيازات' : 'View Full Specifications & Rules'}
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => addToCart(flagshipProduct)}
                      className="px-5 py-3 rounded-xl bg-[#181818] hover:bg-[#222] text-white border border-[#2B2B2B] hover:border-[#C8874B] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C8874B]" />
                      <span>{t('store.addToCart')}</span>
                    </button>

                    <button
                      onClick={() => setDirectCheckoutProduct(flagshipProduct)}
                      className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#C8874B] to-[#DF9F64] hover:brightness-110 active:scale-98 text-black text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-[#C8874B]/20 cursor-pointer"
                    >
                      {t('store.buyNow')}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Secondary Featured Items */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {secondaryFeatured.map((item) => {
                const trans = item.translations[language] || item.translations.ar || item.translations.en;
                return (
                  <div
                    key={item.id}
                    className="flex-1 p-6 rounded-3xl bg-[#0C0C0C] border border-[#222] hover:border-[#C8874B]/50 transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-[#161616] text-[#C8874B] text-[11px] font-bold uppercase border border-[#262626]">
                          {item.category}
                        </span>
                        <span className="text-xl font-black text-[#C8874B] font-rajdhani">
                          ${item.price} USD
                        </span>
                      </div>

                      <h4 
                        onClick={() => setInspectedProduct(item)}
                        className="text-lg font-black text-white group-hover:text-[#DF9F64] transition-colors cursor-pointer"
                      >
                        {trans.name}
                      </h4>

                      <p className="text-xs text-[#888] line-clamp-2 leading-relaxed">
                        {trans.description}
                      </p>

                      <div className="space-y-2 border-t border-[#181818] pt-3">
                        {trans.perks.slice(0, 2).map((p, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[#AAA]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#C8874B] shrink-0" />
                            <span className="line-clamp-1">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-5 flex items-center gap-2">
                      <button
                        onClick={() => addToCart(item)}
                        className="flex-1 py-2.5 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] text-[#D0D0D0] hover:text-white border border-[#262626] hover:border-[#C8874B]/50 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        {t('store.addToCart')}
                      </button>
                      <button
                        onClick={() => setDirectCheckoutProduct(item)}
                        className="px-4 py-2.5 rounded-xl bg-[#C8874B] hover:brightness-110 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        {t('store.buyNow')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. CATALOGUE: CATEGORIES, SEARCH, & ALL PRODUCTS GRID */}
      <section ref={catalogRef} className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-[#141414]">
        
        {/* Section Header & Search Filter Bar */}
        <div className="space-y-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {t('store.allProducts')}
              </h2>
              <p className="text-xs sm:text-sm text-[#888] mt-1">
                {language === 'ar'
                  ? `عرض ${filteredProducts.length} باقة معتمدة للتسليم الفوري`
                  : `Showing ${filteredProducts.length} verified packages ready for automated delivery`}
              </p>
            </div>

            {/* Realtime Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('store.searchPlaceholder')}
                className="w-full pl-10 pr-10 rtl:pl-10 rtl:pr-10 py-3 rounded-2xl bg-[#0E0E0E] border border-[#222] text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#C8874B] focus:ring-1 focus:ring-[#C8874B] transition-all"
              />
              <Search className="w-4 h-4 text-[#666] absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 rtl:right-auto rtl:left-3.5 top-3.5 text-[#666] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Luxury Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoriesList.map((cat) => {
              const active = selectedCategory === cat;
              const count = categoryCounts[cat] || 0;
              
              const getLabel = (c: string) => {
                if (c === 'all') return language === 'ar' ? 'الكل' : 'All';
                if (c === 'VIP') return language === 'ar' ? 'عضويات VIP' : 'VIP Passes';
                if (c === 'VEHICLES') return language === 'ar' ? 'مركبات مخصصة' : 'Vehicles';
                if (c === 'PROPERTIES') return language === 'ar' ? 'عقارات وبنتهاوس' : 'Properties';
                if (c === 'BUNDLES') return language === 'ar' ? 'حزم متكاملة' : 'Bundles';
                return c;
              };

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#C8874B] to-[#DF9F64] text-black shadow-lg shadow-[#C8874B]/20 font-black'
                      : 'bg-[#101010] hover:bg-[#181818] text-[#999] hover:text-white border border-[#202020]'
                  }`}
                >
                  <span>{getLabel(cat)}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-black/20 text-black font-extrabold' : 'bg-[#1C1C1C] text-[#777]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="rounded-3xl bg-[#0B0B0B] border border-[#1A1A1A] h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-[#0A0A0A] border border-[#1C1C1C] space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#141414] border border-[#222] flex items-center justify-center mx-auto text-[#666]">
              <Search className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                {t('store.noResults')}
              </h3>
              <p className="text-xs text-[#777]">
                {language === 'ar' ? 'جرب البحث بكلمات مختلفة أو إزالة الفلاتر.' : 'Try adjusting your search criteria or filters.'}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#161616] hover:bg-[#202020] text-white text-xs font-bold border border-[#2A2A2A]"
            >
              {language === 'ar' ? 'إعادة ضبط البحث' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((prod) => (
              <ProductSpotlightCard
                key={prod.id}
                product={prod}
                onSelect={(p) => setInspectedProduct(p)}
                onDirectCheckout={(p) => setDirectCheckoutProduct(p)}
              />
            ))}
          </div>
        )}

      </section>

      {/* 4. WHY CITIZENS TRUST PRIME RP SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-[#141414]">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'الموثوقية والضمان' : 'Trust & Compliance'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            {t('store.trustTitle')}
          </h2>
          <p className="text-sm text-[#888]">
            {t('store.trustSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {storeFaqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            const question = language === 'ar' ? faq.qAr : faq.qEn;
            const answer = language === 'ar' ? faq.aAr : faq.aEn;

            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left rtl:text-right flex items-center justify-between gap-3 text-sm font-bold text-white hover:text-[#C8874B] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-[#C8874B] shrink-0" />
                    <span>{question}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#777] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#C8874B]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#999] leading-relaxed border-t border-[#141414] pt-3">
                    {answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* PRODUCT SPECIFICATION MODAL */}
      <ProductDetailModal
        product={inspectedProduct}
        onClose={() => setInspectedProduct(null)}
        onDirectCheckout={(p) => setDirectCheckoutProduct(p)}
      />

      {/* SIDE CART DRAWER */}
      <CartDrawer
        setCurrentTab={setCurrentTab}
        onCheckoutSuccess={(order) => setCheckoutSuccess(order)}
      />

      {/* DIRECT CHECKOUT MODAL (For 1-click buy now on cards) */}
      {directCheckoutProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0B0B] border border-[#262626] rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl">
            <button
              onClick={() => setDirectCheckoutProduct(null)}
              className="absolute top-5 right-5 rtl:right-auto rtl:left-5 text-[#888] hover:text-white p-1 rounded-lg hover:bg-[#1C1C1C] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#C8874B]/10 flex items-center justify-center text-[#C8874B]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {language === 'ar' ? 'تأكيد عملية الشراء المباشر' : 'Direct Order Checkout'}
                </h3>
                <p className="text-xs text-[#888]">Prime RP Official Store</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#121212] border border-[#222] mb-6 flex gap-3.5 items-center">
              <img
                src={directCheckoutProduct.image}
                alt={directCheckoutProduct.translations[language]?.name || directCheckoutProduct.translations.ar?.name}
                className="w-16 h-16 rounded-xl object-cover border border-[#262626]"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm truncate mb-1">
                  {directCheckoutProduct.translations[language]?.name || directCheckoutProduct.translations.ar?.name}
                </h4>
                <p className="text-xs text-[#C8874B] font-black font-rajdhani">
                  ${directCheckoutProduct.price} USD
                </p>
              </div>
            </div>

            {checkoutError && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            {!isAuthenticated ? (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-[#BBB]">
                  {language === 'ar'
                    ? 'يتطلب إتمام الشراء تسجيل الدخول بحسابك في ديسكورد لربط المشتريات وتفعيلها تلقائياً.'
                    : 'Please authenticate with Discord to link amenities directly with your citizen profile.'}
                </p>
                <button
                  onClick={() => {
                    setDirectCheckoutProduct(null);
                    setCurrentTab('login');
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'تسجيل الدخول عبر Discord للمتابعة' : 'Sign in with Discord to Continue'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleDirectCheckout}
                disabled={isProcessingDirectCheckout}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#C8874B] to-[#DF9F64] text-black font-extrabold text-sm hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingDirectCheckout ? (
                  <span>{language === 'ar' ? 'جاري معالجة الطلب...' : 'Processing Transaction...'}</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>
                      {language === 'ar' 
                        ? `إتمام الدفع الفوري ($${directCheckoutProduct.price} USD)` 
                        : `Confirm & Pay ($${directCheckoutProduct.price} USD)`}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* OFFICIAL INVOICE & ORDER SUCCESS MODAL */}
      {checkoutSuccess && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-[#C8874B] rounded-3xl p-8 max-w-md w-full text-center relative shadow-2xl">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${
              checkoutSuccess.status === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-[#C8874B]/20 text-[#C8874B] border-[#C8874B]/40'
            }`}>
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">
              {checkoutSuccess.status === 'COMPLETED'
                ? (language === 'ar' ? 'تمت عملية الشراء بنجاح!' : 'Transaction Completed!')
                : (language === 'ar' ? 'تم تسجيل طلبك بنجاح' : 'Order Recorded Successfully')}
            </h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono mb-4 bg-white/5 border border-white/10">
              <span className="text-[#888]">{language === 'ar' ? 'الحالة:' : 'Status:'}</span>
              <span className={checkoutSuccess.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'}>
                {checkoutSuccess.status || 'PENDING'}
              </span>
            </div>
            <p className="text-sm text-[#888] mb-4">
              {language === 'ar' ? 'رقم الفاتورة المعتمدة:' : 'Official Invoice #:'}{' '}
              <span className="text-[#C8874B] font-bold font-mono">{checkoutSuccess.orderNumber || checkoutSuccess.id}</span>
            </p>
            <p className="text-xs text-[#AAA] mb-6 leading-relaxed">
              {checkoutSuccess.status === 'COMPLETED'
                ? (language === 'ar'
                    ? 'تم تأكيد الدفع وتفعيل الباقة تلقائياً في السيرفر ومزامنة الرتب في ديسكورد.'
                    : 'Payment confirmed and perks dispatched to your citizen profile.')
                : (language === 'ar'
                    ? 'تم تسجيل طلبك برقم فاتورة رسمي بحالة (انتظار الدفع). سيتم تسليم المنتج تلقائياً فور تأكيد عملية الدفع من قبل الإدارة.'
                    : 'Your invoice is pending payment confirmation. Perks will be activated automatically once payment is verified.')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCheckoutSuccess(null);
                  setCurrentTab('orders');
                }}
                className="flex-1 py-3 rounded-xl bg-[#C8874B] hover:brightness-110 text-black font-extrabold text-xs transition-all cursor-pointer"
              >
                {language === 'ar' ? 'عرض سجل الطلبات' : 'View Invoices'}
              </button>
              <button
                onClick={() => setCheckoutSuccess(null)}
                className="px-5 py-3 rounded-xl bg-[#1A1A1A] text-white font-bold text-xs hover:bg-[#252525] transition-all cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
