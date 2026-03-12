import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    if (!container || !overlay) return;

    const tl = gsap.timeline();

    // Overlay in
    tl.set(overlay, { display: 'block' });
    tl.fromTo(overlay, { opacity: 1 }, { opacity: 0, duration: 0.4, ease: 'power2.out' });
    
    // Content entrance
    tl.fromTo(
      container,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    );

    tl.set(overlay, { display: 'none' });

    return () => { tl.kill(); };
  }, [location.pathname]);

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[60] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, hsl(var(--primary) / 0.1), hsl(var(--background)))',
          display: 'none',
        }}
      />
      <div ref={containerRef}>{children}</div>
    </>
  );
};

export default PageTransition;
