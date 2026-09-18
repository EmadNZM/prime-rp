import React, { useEffect } from 'react';
import { ProductItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { 
  X, 
  CheckCircle2, 
  ShoppingBag, 
  CreditCard, 
  Crown, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  PackageCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onDirectCheckout: (product: ProductItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onDirectCheckout,
}) => {
  const { language, isRtl } = useLanguage();
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (product) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [product, onClose]);

  if (!product) return null;

  const trans = product.translations[language] || product.translations.ar || product.translations.en;

  const handleAdd = () => {
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-[#0A0A0A] border border-[#262626] rounded-3xl overflow-hidden shadow-2xl shadow-black/90 flex flex-col"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 rtl:right-auto rtl:left-5 z-20 p-2 rounded-full bg-black/60 border border-white/10 text-[#A0A0A0] hover:text-white hover:border-[#C8874B] transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Content Scrollable Area */}
          <div className="overflow-y-auto p-6 sm:p-8 md:p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Product Visual Container */}
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-[#222] bg-[#050505] shadow-2xl">
                  <img
                    src={product.image}
                    alt={trans.name}
                    className="w-full h-72 sm:h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/80 backdrop-blur-md border border-[#C8874B]/30 text-xs font-bold text-[#C8874B]">
                    <Crown className="w-3.5 h-3.5" />
                    <span>{product.category}</span>
                  </div>

                  {product.featured && (
                    <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 flex items-center gap-1 px-3 py-1 rounded-md bg-[#C8874B] text-black text-xs font-black">
                      <Sparkles className="w-3 h-3" />
                      <span>{language === 'ar' ? 'باقة مميزة' : 'Featured Asset'}</span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-baseline p-4 rounded-xl bg-black/70 backdrop-blur-md border border-white/10">
                    <span className="text-xs text-[#9E9E9E] font-medium">
                      {language === 'ar' ? 'سعر الباقة' : 'Package Value'}
                    </span>
                    <span className="text-2xl font-black text-[#C8874B] font-rajdhani">
                      ${product.price} USD
                    </span>
                  </div>
                </div>

                {/* Assurance Mini Cards */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#111] border border-[#1E1E1E] flex items-center gap-2 text-[#AAA]">
                    <Zap className="w-4 h-4 text-[#C8874B] shrink-0" />
                    <span>{language === 'ar' ? 'تسليم فوري داخل اللعبة' : 'Instant In-Game Injection'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111] border border-[#1E1E1E] flex items-center gap-2 text-[#AAA]">
                    <ShieldCheck className="w-4 h-4 text-[#C8874B] shrink-0" />
                    <span>{language === 'ar' ? 'مزامنة رتبة ديسكورد تلقائية' : 'Auto Discord Role Sync'}</span>
                  </div>
                </div>
              </div>

              {/* Product Info & Complete Perks */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                    {trans.name}
                  </h2>
                  <p className="text-sm text-[#8E8E8E] leading-relaxed">
                    {trans.description}
                  </p>
                </div>

                {/* Complete Perks Checklist */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#C8874B] flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'المميزات والامتيازات المضمنة:' : 'Included Amenities & Perks:'}</span>
                  </h4>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 rtl:pr-0 rtl:pl-1">
                    {trans.perks.map((perk, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-[#121212] border border-[#1C1C1C]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#C8874B] shrink-0 mt-0.5" />
                        <span className="text-xs text-[#D5D5D5] leading-relaxed font-medium">
                          {perk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-[#1C1C1C] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleAdd}
                      className={`py-3.5 px-4 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        justAdded
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-[#161616] hover:bg-[#202020] text-white border-[#2A2A2A] hover:border-[#C8874B]'
                      }`}
                    >
                      {justAdded ? (
                        <>
                          <PackageCheck className="w-4 h-4 text-emerald-400" />
                          <span>{language === 'ar' ? 'أضيفت إلى سلتك!' : 'Added to Cart!'}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-[#C8874B]" />
                          <span>{language === 'ar' ? 'إضافة للسلة' : 'Add to Cart'}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onDirectCheckout(product);
                      }}
                      className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#C8874B] to-[#DF9F64] hover:brightness-110 active:scale-98 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C8874B]/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{language === 'ar' ? 'شراء فوري مباشر' : 'Direct Checkout'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-[#666] text-center">
                    {language === 'ar'
                      ? 'جميع المشتريات موثقة بسجل رسمي وتفعل فورياً عبر نظام Prime RP الآلي.'
                      : 'All purchases are permanently logged and automatically disbursed via Prime RP systems.'}
                  </p>
                </div>

              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
