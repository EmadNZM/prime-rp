import React, { useEffect, useRef, useState } from 'react';

type HoverType = 'none' | 'button' | 'link' | 'image' | 'interactive';

export const CustomCursor: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [hoverType, setHoverType] = useState<HoverType>('none');
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  // Raw vs lerped coordinates
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const glowPos = useRef({ x: -100, y: -100 });
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    // 1. Strict Desktop check (fine pointer, no touch screen, no reduced motion)
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

    if (!hasFinePointer || prefersReducedMotion || isTouchDevice) {
      setIsEnabled(false);
      return;
    }

    setIsEnabled(true);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      setIsVisible((prev) => (prev ? prev : true));

      // Instant inner dot placement for zero perceived lag
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check interaction target type efficiently
      const target = e.target as HTMLElement | null;
      if (!target) {
        setHoverType((prev) => (prev === 'none' ? prev : 'none'));
        return;
      }

      let detected: HoverType = 'none';
      if (target.closest('button, [role="button"], .magnetic-btn')) {
        detected = 'button';
      } else if (target.closest('a, [role="link"]')) {
        detected = 'link';
      } else if (target.closest('img, [role="img"], picture, .interactive-image')) {
        detected = 'image';
      } else if (target.closest('input, select, textarea, [data-cursor="pointer"], .cursor-pointer, .interactive-card, [tabindex="0"]')) {
        detected = 'interactive';
      }

      setHoverType((prev) => (prev === detected ? prev : detected));
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // 2. High-performance 60FPS Lerp loop
    const render = () => {
      // Ring damping
      const ringEase = 0.2;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ringEase;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ringEase;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      // Subtle ambient glow damping
      const glowEase = 0.08;
      glowPos.current.x += (mousePos.current.x - glowPos.current.x) * glowEase;
      glowPos.current.y += (mousePos.current.y - glowPos.current.y) * glowEase;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${glowPos.current.x}px, ${glowPos.current.y}px, 0)`;
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  if (!isEnabled) {
    return null;
  }

  // Dynamic styles based on hover target type
  const isHovered = hoverType !== 'none';

  let ringStyle = 'w-9 h-9 border-[#C8874B]/40 bg-transparent';
  if (isClicked) {
    ringStyle = 'w-6 h-6 border-[#DF9F64] bg-[#C8874B]/35 shadow-[0_0_15px_rgba(200,135,75,0.6)]';
  } else if (hoverType === 'button') {
    ringStyle = 'w-14 h-14 border-[#C8874B] bg-[#C8874B]/15 backdrop-blur-[1px] shadow-[0_0_25px_rgba(200,135,75,0.45)]';
  } else if (hoverType === 'link') {
    ringStyle = 'w-12 h-12 border-[#DF9F64] bg-[#DF9F64]/10 shadow-[0_0_18px_rgba(223,159,100,0.35)]';
  } else if (hoverType === 'image') {
    ringStyle = 'w-16 h-16 border-[#C8874B]/60 bg-black/25 backdrop-blur-[2px] shadow-[0_0_20px_rgba(0,0,0,0.7)]';
  } else if (hoverType === 'interactive') {
    ringStyle = 'w-11 h-11 border-[#C8874B] bg-[#C8874B]/10';
  }

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* 1. Soft Ambient Mouse Follower Halo / Spotlight */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full blur-[75px] pointer-events-none will-change-transform opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(200, 135, 75, 0.28) 0%, rgba(200, 135, 75, 0.06) 45%, transparent 70%)',
        }}
      />

      {/* 2. Trailing Luxury Dynamic Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none will-change-transform transition-[width,height,background-color,border-color,box-shadow] duration-200 ease-out flex items-center justify-center ${ringStyle}`}
      >
        {hoverType === 'button' && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#DF9F64] animate-ping" />
        )}
      </div>

      {/* 3. High-Precision Center Copper Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none will-change-transform transition-[width,height,opacity,background-color] duration-150 ${
          isHovered
            ? 'w-1.5 h-1.5 bg-[#FFFFFF] opacity-95 shadow-[0_0_8px_#FFFFFF]'
            : isClicked
            ? 'w-3 h-3 bg-[#DF9F64]'
            : 'w-2 h-2 bg-[#C8874B] shadow-[0_0_10px_#C8874B]'
        }`}
      />
    </div>
  );
};
