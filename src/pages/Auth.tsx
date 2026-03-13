import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { lovable } from '@/integrations/lovable/index';
import { toast } from 'sonner';
import gsap from 'gsap';

const LoginPortal = lazy(() => import('@/components/LoginPortal'));

const Auth = () => {
  const { user, loading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [animating, setAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-primary animate-pulse font-display">LOADING...</div>
    </div>
  );
  if (user) return <Navigate to="/" replace />;

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setAnimating(true);

    // Animate portal expansion
    if (containerRef.current) {
      const portal = containerRef.current.querySelector('.login-portal-glow');
      if (portal) {
        gsap.to(portal, {
          scale: 3,
          opacity: 0.9,
          duration: 0.8,
          ease: 'power2.in',
        });
      }
    }

    // Small delay for visual effect then sign in
    await new Promise(r => setTimeout(r, 400));

    const { error } = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });

    if (error) {
      toast.error('Sign in failed. Please try again.');
      setSigningIn(false);
      setAnimating(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* 3D Galaxy Background */}
      <Suspense fallback={null}>
        <LoginPortal animating={animating} />
      </Suspense>

      {/* Login content */}
      <div className="relative z-20 text-center px-4">
        <h1 className="font-display text-5xl md:text-7xl font-black tracking-[0.2em] text-primary neon-text mb-2">
          KEVIN
        </h1>
        <div className="font-display text-lg md:text-xl tracking-[0.5em] text-secondary neon-text-purple mb-4 uppercase">
          Eleven
        </div>
        <p className="text-foreground/60 mb-10 text-sm max-w-xs mx-auto">
          Enter the AI Character Universe
        </p>

        {/* Glowing portal indicator */}
        <div className="login-portal-glow w-32 h-32 mx-auto mb-8 rounded-full relative">
          <div className="absolute inset-0 rounded-full animate-pulse-glow"
            style={{ background: 'radial-gradient(circle, hsl(185 100% 50% / 0.3), hsl(262 83% 58% / 0.15), transparent 70%)' }} />
          <div className="absolute inset-2 rounded-full border border-primary/30 animate-spin" style={{ animationDuration: '8s' }} />
          <div className="absolute inset-4 rounded-full border border-secondary/20 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          className="holo-btn px-8 py-4 rounded-xl text-sm font-display tracking-wider flex items-center gap-3 mx-auto disabled:opacity-50"
        >
          <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="relative z-10">{signingIn ? 'ENTERING UNIVERSE...' : 'SIGN IN WITH GOOGLE'}</span>
        </button>
      </div>
    </div>
  );
};

export default Auth;
