import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-primary animate-pulse font-display">LOADING...</div></div>;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password, username);
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else if (!isLogin) {
      toast.success('Account created! Check your email to confirm.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20">
      <div className="holo-card rounded-2xl p-8 w-full max-w-md">
        <h1 className="font-display text-3xl font-bold text-center text-primary neon-text mb-2 tracking-wider">
          {isLogin ? 'WELCOME BACK' : 'JOIN THE UNIVERSE'}
        </h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">
          {isLogin ? 'Log in to continue your journey' : 'Create your identity in Kevin Eleven'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs text-muted-foreground mb-1 font-display tracking-wider">USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                placeholder="Choose a username"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-muted-foreground mb-1 font-display tracking-wider">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
              placeholder="commander@kevineleven.io"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1 font-display tracking-wider">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="holo-btn w-full py-3 rounded-lg text-sm font-display tracking-wider mt-2"
          >
            <span className="relative z-10">{submitting ? 'TRANSMITTING...' : isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}</span>
          </button>
        </form>

        <p className="text-center text-muted-foreground text-xs mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-display">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
