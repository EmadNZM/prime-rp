import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { ProductItem } from '../../types';
import { 
  ShoppingBag, 
  Crown, 
  CheckCircle2, 
  X, 
  Check, 
  AlertCircle, 
  CreditCard,
  Sparkles
} from 'lucide-react';

interface StorePageProps {
  setCurrentTab: (tab: string) => void;
}

export const StorePage: React.FC<StorePageProps> = ({ setCurrentTab }) => {
  const { t, language } = useLanguage();
  const { isAuthenticated, loginWithDiscord } = useAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Cart & Checkout state
  const [cartProduct, setCartProduct] = useState<ProductItem | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<any>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await apiClient.getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load store products:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const categories = ['all', 'VIP', 'VEHICLES', 'PROPERTIES', 'BUNDLES'];
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const handleCheckout = async () => {
    if (!cartProduct) return;
    if (!isAuthenticated) {
      loginWithDiscord();
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);
    try {
      const res = await apiClient.checkoutOrder(cartProduct.id);
      const createdOrder = res.order || (res.id ? res : null);
      if (createdOrder) {
        setCheckoutSuccess(createdOrder);
        setCartProduct(null);
      } else {
        setCheckoutError(res.error || 'Failed to process order');
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'An error occurred during checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-4">
            <Crown className="w-3.5 h-3.5" />
            <span>Prime Luxury Exchange</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            {t('store.title')}
          </h1>
          <p className="text-[#8E8E8E] text-sm sm:text-base leading-relaxed">
            {t('store.subtitle')}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? 'bg-[#C8874B] text-black shadow-lg shadow-[#C8874B]/20'
                  : 'bg-[#111] text-[#999] hover:text-white hover:bg-[#1A1A1A] border border-[#222]'
              }`}
            >
              {cat === 'all' ? (language === 'ar' ? 'جميع المنتجات' : 'All Products') : cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-[#888]">{t('common.loading')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((prod) => {
              const trans = prod.translations[language] || prod.translations.ar;
              return (
                <div
                  key={prod.id}
                  className="rounded-3xl bg-[#0B0B0B] border border-[#1E1E1E] hover:border-[#C8874B]/50 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={prod.image}
                        alt={trans.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-2.5 py-1 text-[11px] font-bold rounded-md bg-black/80 backdrop-blur-md text-[#C8874B] border border-[#C8874B]/30 uppercase">
                        {prod.category}
                      </div>
                      {prod.featured && (
                        <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2.5 py-1 text-[11px] font-bold rounded-md bg-[#C8874B] text-black flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Popular</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-baseline justify-between mb-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-[#DF9F64] transition-colors">
                          {trans.name}
                        </h3>
                        <span className="text-xl font-black text-[#C8874B]">
                          ${prod.price}
                        </span>
                      </div>

                      <p className="text-xs text-[#888] mb-6 line-clamp-2 leading-relaxed">
                        {trans.description}
                      </p>

                      <div className="space-y-2 border-t border-[#181818] pt-4">
                        {trans.perks.slice(0, 4).map((perk, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-[#AAA]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#C8874B] shrink-0 mt-0.5" />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => setCartProduct(prod)}
                      className="w-full py-3 rounded-xl bg-[#141414] hover:bg-[#C8874B] text-white hover:text-black border border-[#2B2B2B] hover:border-[#C8874B] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('store.buyNow')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ORDER SUCCESS NOTIFICATION MODAL */}
        {checkoutSuccess && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0D0D0D] border border-[#C8874B] rounded-3xl p-8 max-w-md w-full text-center relative shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-[#C8874B]/20 text-[#C8874B] flex items-center justify-center mx-auto mb-4 border border-[#C8874B]/40">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                {language === 'ar' ? 'تمت عملية الشراء بنجاح!' : 'Purchase Completed Successfully!'}
              </h3>
              <p className="text-sm text-[#888] mb-4">
                {language === 'ar' ? 'رقم الفاتورة:' : 'Invoice #:'}{' '}
                <span className="text-[#C8874B] font-bold font-mono">{checkoutSuccess.orderNumber}</span>
              </p>
              <p className="text-xs text-[#AAA] mb-6 leading-relaxed">
                {language === 'ar'
                  ? 'تم تفعيل المنتج وإرسال إشعار رسمي إلى حسابك. يمكنك مراجعة طلباتك ومشترياتك عبر لوحة التحكم.'
                  : 'Your in-game amenities have been activated and logged. You can review all orders anytime from your dashboard.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCheckoutSuccess(null);
                    setCurrentTab('orders');
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#C8874B] hover:brightness-110 text-black font-extrabold text-xs transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'عرض سجل الطلبات' : 'View Orders'}
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

        {/* CHECKOUT MODAL */}
        {cartProduct && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B0B0B] border border-[#262626] rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl">
              <button
                onClick={() => setCartProduct(null)}
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
                    {language === 'ar' ? 'تأكيد عملية الشراء' : 'Confirm Purchase'}
                  </h3>
                  <p className="text-xs text-[#888]">Direct Roleplay Store Checkout</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#121212] border border-[#222] mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-white text-base">
                    {cartProduct.translations[language]?.name || cartProduct.translations.ar.name}
                  </h4>
                  <span className="text-lg font-black text-[#C8874B]">${cartProduct.price} USD</span>
                </div>
                <p className="text-xs text-[#888]">
                  {cartProduct.translations[language]?.description || cartProduct.translations.ar.description}
                </p>
              </div>

              {checkoutError && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {!isAuthenticated ? (
                <div className="text-center py-4">
                  <p className="text-xs text-[#BBB] mb-4">
                    {language === 'ar'
                      ? 'يتطلب الشراء تسجيل الدخول بحسابك في ديسكورد لربط المشتريات وتفعيلها تلقائياً.'
                      : 'Please authenticate with Discord to link purchases directly with your citizen profile.'}
                  </p>
                  <button
                    onClick={() => {
                      setCartProduct(null);
                      setCurrentTab('login');
                    }}
                    className="w-full py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    {language === 'ar' ? 'تسجيل الدخول عبر Discord للمتابعة' : 'Sign in with Discord to Continue'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#C8874B] to-[#DF9F64] text-black font-extrabold text-sm hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>{language === 'ar' ? 'جاري معالجة الطلب...' : 'Processing Transaction...'}</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {language === 'ar' 
                          ? `إتمام الدفع ($${cartProduct.price} USD)` 
                          : `Complete Order ($${cartProduct.price} USD)`}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
