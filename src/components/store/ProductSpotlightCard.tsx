import React, { useRef, useState } from 'react';
import { ProductItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  Crown, 
  Car, 
  Home, 
  Layers,
  PackageCheck
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProductSpotlightCardProps {
  product: ProductItem;
  onSelect: (product: ProductItem) => void;
  onDirectCheckout: (product: ProductItem) => void;
}

export const ProductSpotlightCard: React.FC<ProductSpotlightCardProps> = ({
  product,
  onSelect,
  onDirectCheckout,
}) => {
  const { language, isRtl } = useLanguage();
  const { addToCart } = useCart();
  const cardRef = useRef<HTMLDivElement | null>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const trans = product.translations[language] || product.translations.ar || product.translations.en;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1500);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'VIP':
        return <Crown className="w-3.5 h-3.5 text-[#C8874B]" />;
      case 'VEHICLES':
        return <Car className="w-3.5 h-3.5 text-[#58A6FF]" />;
      case 'PROPERTIES':
        return <Home className="w-3.5 h-3.5 text-[#E5A93C]" />;
      case 'BUNDLES':
        return <Layers className="w-3.5 h-3.5 text-[#A371F7]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#C8874B]" />;
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-3xl bg-[#0B0B0B] border border-[#1C1C1C] hover:border-[#C8874B]/50 transition-all duration-500 overflow-hidden flex flex-col justify-between hover:shadow-[0_12px_40px_-10px_rgba(200,135,75,0.2)]"
    >
      {/* Dynamic Cursor Spotlight Overlay */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-100 z-10"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(200, 135, 75, 0.12), transparent 70%)`,
          }}
        />
      )}

      {/* Top Media Container */}
      <div className="relative">
        <div 
          onClick={() => onSelect(product)}
          className="relative h-56 sm:h-60 overflow-hidden cursor-pointer bg-[#050505]"
        >
          <img
            src={product.image}
            alt={trans.name}
            className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-110 transition-all duration-700 ease-out"
            loading="lazy"
          />
          {/* Subtle cinematic gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/20 to-transparent" />

          {/* Quick inspect button hover reveal */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
            <span className="px-4 py-2 rounded-full bg-[#111]/90 border border-[#C8874B]/60 text-white text-xs font-bold tracking-wide flex items-center gap-2 shadow-xl shadow-black">
              <Eye className="w-3.5 h-3.5 text-[#C8874B]" />
              <span>{language === 'ar' ? 'عرض المواصفات' : 'Inspect Specs'}</span>
            </span>
          </div>

          {/* Category Tag */}
          <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#070707]/80 backdrop-blur-md border border-[#252525] text-xs font-semibold text-[#E5E5E5] shadow-lg">
            {getCategoryIcon(product.category)}
            <span>{product.category}</span>
          </div>

          {/* Featured / Popular Badge */}
          {product.featured && (
            <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-[#C8874B] to-[#DF9F64] text-black text-[11px] font-black uppercase tracking-wider shadow-lg shadow-[#C8874B]/25">
              <Sparkles className="w-3 h-3 text-black" />
              <span>{language === 'ar' ? 'مميز' : 'Popular'}</span>
            </div>
          )}
        </div>

        {/* Card Body Details */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 
              onClick={() => onSelect(product)}
              className="text-lg sm:text-xl font-black text-white group-hover:text-[#DF9F64] transition-colors line-clamp-1 cursor-pointer"
            >
              {trans.name}
            </h3>
          </div>

          <p className="text-xs text-[#8A8A8A] line-clamp-2 leading-relaxed mb-5 min-h-[32px]">
            {trans.description}
          </p>

          {/* Perks Preview Checklist */}
          <div className="space-y-2 border-t border-[#181818] pt-4 mb-4">
            {trans.perks.slice(0, 3).map((perk, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#A8A8A8]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C8874B] shrink-0 mt-0.5" />
                <span className="line-clamp-1">{perk}</span>
              </div>
            ))}
            {trans.perks.length > 3 && (
              <p className="text-[11px] text-[#C8874B] font-medium pt-1">
                +{trans.perks.length - 3} {language === 'ar' ? 'مميزات إضافية' : 'more amenities included'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-6 pt-0">
        <div className="flex items-baseline justify-between py-3 px-4 rounded-xl bg-[#121212] border border-[#1E1E1E] mb-4">
          <span className="text-xs text-[#7A7A7A] uppercase font-bold tracking-wider">
            {language === 'ar' ? 'السعر الرسمي' : 'Official Price'}
          </span>
          <div className="text-right rtl:text-left">
            <span className="text-2xl font-black text-[#C8874B] font-rajdhani tracking-tight">
              ${product.price}
            </span>
            <span className="text-[11px] text-[#777] ml-1 rtl:ml-0 rtl:mr-1 font-mono">
              USD
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Quick Add to Cart */}
          <button
            onClick={handleAddToCart}
            className={`py-3 px-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isAddedRecently
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-[#141414] hover:bg-[#1C1C1C] text-[#D4D4D4] hover:text-white border-[#242424] hover:border-[#C8874B]/60'
            }`}
          >
            {isAddedRecently ? (
              <>
                <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'ar' ? 'تمت الإضافة' : 'Added!'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#C8874B]" />
                <span>{language === 'ar' ? 'أضف للسلة' : 'Add to Cart'}</span>
              </>
            )}
          </button>

          {/* Instant Purchase */}
          <button
            onClick={() => onDirectCheckout(product)}
            className="py-3 px-3 rounded-xl bg-gradient-to-r from-[#C8874B] to-[#DF9F64] hover:brightness-110 active:scale-98 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#C8874B]/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{language === 'ar' ? 'شراء فوري' : 'Buy Now'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
