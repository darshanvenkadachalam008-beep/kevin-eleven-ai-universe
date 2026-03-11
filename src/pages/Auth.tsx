import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-primary animate-pulse font-display">LOADING...</div></div>;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (mode === 'forgot') {
      const { default: { auth } } = await import('@/integrations/supabase/client').then(m => ({ default: m.supabase }));
      const { error } = await auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      setSubmitting(false);
      if (error) toast.error(error.message);
      else toast.success('Password reset email sent! Check your inbox.');
      return;
    }

    const { error } = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password, username);
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else if (mode === 'signup') {
      toast.success('Account created! Check your email to confirm.');
    }
  };

  const titles = {
    login: 'WELCOME BACK',
    signup: 'JOIN THE UNIVERSE',
    forgot: 'RESET PASSWORD',
  };

  const subtitles = {
    login: 'Log in to continue your journey',
    signup: 'Create your identity in Kevin Eleven',
    forgot: 'Enter your email to receive a reset link',
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20">
      <div className="holo-card rounded-2xl p-8 w-full max-w-md">
        <h1 className="font-display text-3xl font-bold text-center text-primary neon-text mb-2 tracking-wider">
          {titles[mode]}
        </h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">{subtitles[mode]}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs text-muted-foreground mb-1 font-display tracking-wider">USERNAME</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                placeholder="Choose a username" />
            </div>
          )}
          <div>
            <label className="block text-xs text-muted-foreground mb-1 font-display tracking-wider">EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
              placeholder="commander@kevineleven.io" />
          </div>
          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs text-muted-foreground mb-1 font-display tracking-wider">PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                placeholder="••••••••" />
            </div>
          )}
          <button type="submit" disabled={submitting} className="holo-btn w-full py-3 rounded-lg text-sm font-display tracking-wider mt-2">
            <span className="relative z-10">
              {submitting ? 'TRANSMITTING...' : mode === 'login' ? 'LOG IN' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SEND RESET LINK'}
            </span>
          </button>
        </form>

        <div className="text-center text-muted-foreground text-xs mt-6 space-y-2">
          {mode === 'login' && (
            <>
              <p>
                <button onClick={() => setMode('forgot')} className="text-primary hover:underline font-display">
                  <KeyRound className="w-3 h-3 inline mr-1" />Forgot Password?
                </button>
              </p>
              <p>
                Don't have an account?{' '}
                <button onClick={() => setMode('signup')} className="text-primary hover:underline font-display">Sign Up</button>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p>Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-primary hover:underline font-display">Log In</button>
            </p>
          )}
          {mode === 'forgot' && (
            <p>Remember your password?{' '}
              <button onClick={() => setMode('login')} className="text-primary hover:underline font-display">Log In</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
