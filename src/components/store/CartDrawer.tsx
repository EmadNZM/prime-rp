import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CreditCard,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  onCheckoutSuccess: (order: any) => void;
  setCurrentTab: (tab: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onCheckoutSuccess,
  setCurrentTab,
}) => {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const { language, isRtl } = useLanguage();
  const { isAuthenticated, loginWithDiscord } = useAuth();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!isAuthenticated) {
      setIsCartOpen(false);
      setCurrentTab('login');
      return;
    }

    setIsCheckingOut(true);
    setErrorMessage(null);

    try {
      // Process items through the official checkout endpoint sequentially
      let lastOrder: any = null;
      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          const res = await apiClient.checkoutOrder(item.product.id);
          const order = res.order || (res.id ? res : null);
          if (order) {
            lastOrder = order;
          } else {
            throw new Error(res.error || 'Checkout failed');
          }
        }
      }

      if (lastOrder) {
        clearCart();
        setIsCartOpen(false);
        onCheckoutSuccess(lastOrder);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during transaction processing');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        />

        <div className={`fixed inset-y-0 ${isRtl ? 'left-0' : 'right-0'} max-w-full flex pl-10 rtl:pl-0 rtl:pr-10`}>
          <motion.div
            initial={{ x: isRtl ? -420 : 420 }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? -420 : 420 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="w-screen max-w-md bg-[#0B0B0B] border-l rtl:border-l-0 rtl:border-r border-[#1E1E1E] shadow-2xl flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#1A1A1A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C8874B]/10 border border-[#C8874B]/30 flex items-center justify-center text-[#C8874B]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {language === 'ar' ? 'سلة المشتريات' : 'Shopping Cart'}
                  </h3>
                  <p className="text-xs text-[#7E7E7E]">
                    {totalItems} {language === 'ar' ? 'عناصر مختارة' : 'selected items'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl text-[#8E8E8E] hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {items.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#141414] border border-[#222] flex items-center justify-center mx-auto text-[#666]">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">
                      {language === 'ar' ? 'سلتك فارغة حالياً' : 'Your cart is empty'}
                    </h4>
                    <p className="text-xs text-[#7A7A7A] max-w-xs mx-auto">
                      {language === 'ar'
                        ? 'استعرض باقات VIP والمركبات الحصرية وأضف ما يناسبك.'
                        : 'Explore our prestigious VIP passes and custom imports to get started.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-[#181818] hover:bg-[#C8874B] text-white hover:text-black font-bold text-xs transition-all border border-[#282828] hover:border-[#C8874B]"
                  >
                    {language === 'ar' ? 'تصفح المتجر الآن' : 'Browse Store'}
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const trans = item.product.translations[language] || item.product.translations.ar || item.product.translations.en;
                  return (
                    <div
                      key={item.product.id}
                      className="p-4 rounded-2xl bg-[#121212] border border-[#1E1E1E] flex gap-3.5 items-center justify-between"
                    >
                      <img
                        src={item.product.image}
                        alt={trans.name}
                        className="w-16 h-16 rounded-xl object-cover border border-[#262626] shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-white truncate mb-1">
                          {trans.name}
                        </h5>
                        <p className="text-xs font-black text-[#C8874B] font-rajdhani">
                          ${item.product.price} USD
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-6 h-6 rounded-md bg-[#1A1A1A] hover:bg-[#252525] text-[#AAA] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-white px-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-6 h-6 rounded-md bg-[#1A1A1A] hover:bg-[#252525] text-[#AAA] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 rounded-lg text-[#6E6E6E] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer & Checkout Action */}
            {items.length > 0 && (
              <div className="p-6 border-t border-[#1A1A1A] bg-[#0E0E0E] space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#8E8E8E]">
                    <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span className="font-mono text-white">${totalPrice} USD</span>
                  </div>
                  <div className="flex justify-between text-[#8E8E8E]">
                    <span>{language === 'ar' ? 'الضرائب ورسوم الخدمة' : 'Service Fees'}</span>
                    <span className="text-emerald-400 font-mono">$0.00 (Included)</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#1C1C1C]">
                    <span>{language === 'ar' ? 'الإجمالي النهائي' : 'Grand Total'}</span>
                    <span className="text-lg font-black text-[#C8874B] font-rajdhani">
                      ${totalPrice} USD
                    </span>
                  </div>
                </div>

                {!isAuthenticated ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-[#A0A0A0] text-center leading-relaxed">
                      {language === 'ar'
                        ? 'يتطلب إتمام الشراء المصادقة عبر Discord لربط الرتب وتفعيل المشتريات تلقائياً.'
                        : 'Discord authentication is required to synchronize citizen ranks and amenities.'}
                    </p>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        setCurrentTab('login');
                      }}
                      className="w-full py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{language === 'ar' ? 'تسجيل الدخول عبر Discord' : 'Sign In with Discord'}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#C8874B] to-[#DF9F64] hover:brightness-110 active:scale-98 text-black font-extrabold text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#C8874B]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isCheckingOut ? (
                      <span>{language === 'ar' ? 'جاري معالجة الطلب...' : 'Processing Transaction...'}</span>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>
                          {language === 'ar'
                            ? `تأكيد وإتمام الشراء ($${totalPrice})`
                            : `Checkout Now ($${totalPrice} USD)`}
                        </span>
                      </>
                    )}
                  </button>
                )}

                <div className="flex items-center justify-center gap-4 text-[11px] text-[#666] pt-1">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#C8874B]" />
                    {language === 'ar' ? 'تسليم فوري' : 'Instant Delivery'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#C8874B]" />
                    {language === 'ar' ? 'معاملة مشفرة' : 'Encrypted'}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
