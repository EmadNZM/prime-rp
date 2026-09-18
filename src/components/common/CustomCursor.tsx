import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  // Position state (raw mouse coords vs lerped coords)
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const glowPos = useRef({ x: -100, y: -100 });
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    // 1. Check if device supports fine pointer and user does not prefer reduced motion
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!hasFinePointer || prefersReducedMotion || isTouchDevice) {
      setIsEnabled(false);
      return;
    }

    setIsEnabled(true);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Instantly position the center dot for zero perceived latency
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check if hovering an interactive target
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'button, a, input, select, textarea, [data-cursor="pointer"], .cursor-pointer, .interactive-card, [role="button"]'
        );
        setIsHovered(Boolean(interactive));
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // 2. Smooth Lerp loop for the trailing ring and ambient spotlight glow
    const render = () => {
      // Lerp ring towards mouse with smooth damping factor
      const ringEase = 0.18;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ringEase;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ringEase;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      // Lerp ambient glow with softer damping
      const glowEase = 0.09;
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
  }, [isVisible]);

  if (!isEnabled) {
    return null;
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
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full blur-[70px] pointer-events-none will-change-transform opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(200, 135, 75, 0.25) 0%, rgba(200, 135, 75, 0.05) 45%, transparent 70%)',
        }}
      />

      {/* 2. Trailing Luxury Dynamic Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none will-change-transform transition-[width,height,background-color,border-color,transform] duration-200 ease-out flex items-center justify-center ${
          isHovered
            ? 'w-12 h-12 border-[#C8874B] bg-[#C8874B]/15 backdrop-blur-[1px] shadow-[0_0_20px_rgba(200,135,75,0.4)]'
            : isClicked
            ? 'w-6 h-6 border-[#DF9F64] bg-[#C8874B]/30'
            : 'w-9 h-9 border-[#C8874B]/40 bg-transparent'
        }`}
      >
        {isHovered && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#DF9F64] animate-ping" />
        )}
      </div>

      {/* 3. High-Precision Center Copper Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none will-change-transform transition-[width,height,opacity] duration-150 ${
          isHovered
            ? 'w-1.5 h-1.5 bg-[#FFFFFF] opacity-90'
            : isClicked
            ? 'w-3 h-3 bg-[#DF9F64]'
            : 'w-2 h-2 bg-[#C8874B] shadow-[0_0_8px_#C8874B]'
        }`}
      />
    </div>
  );
};
