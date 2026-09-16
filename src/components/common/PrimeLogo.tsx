import React from 'react';

interface PrimeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  withGlow?: boolean;
  className?: string;
}

export const PrimeLogo: React.FC<PrimeLogoProps> = ({
  size = 'md',
  showText = false,
  withGlow = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-10 w-auto',
    md: 'h-14 w-auto',
    lg: 'h-20 w-auto',
    xl: 'h-32 w-auto',
    hero: 'h-48 md:h-64 lg:h-72 w-auto'
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none group ${className}`}>
      {withGlow && (
        <div 
          className="absolute inset-0 bg-[#C8874B]/20 blur-xl rounded-full scale-90 group-hover:scale-110 transition-transform duration-500 pointer-events-none"
          aria-hidden="true"
        />
      )}
      <img
        src="/assets/prime-logo.svg"
        alt="Prime RP Official Logo"
        className={`${sizeClasses[size]} object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] filter transition-all duration-300 group-hover:brightness-110`}
        loading="eager"
      />
      {showText && (
        <div className="flex flex-col ml-3 rtl:mr-3 rtl:ml-0 font-bold leading-none">
          <span className="text-xl md:text-2xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#E5E5E5] via-[#C7C7C7] to-[#FFFFFF]">
            PRIME
          </span>
          <span className="text-xs md:text-sm font-extrabold tracking-widest text-[#C8874B] drop-shadow-sm">
            ROLEPLAY
          </span>
        </div>
      )}
    </div>
  );
};
