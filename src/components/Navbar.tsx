import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Hub' },
  { path: '/characters', label: 'Galaxy' },
  { path: '/universe-feed', label: 'Feed' },
  { path: '/story-adventure', label: 'Adventure' },
  { path: '/creation-lab', label: 'Lab' },
  { path: '/dashboard', label: 'Dashboard' },
];

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl md:text-2xl font-bold text-primary neon-text tracking-widest">
            KEVIN
          </span>
          <span className="font-display text-xs md:text-sm font-medium text-secondary tracking-wider opacity-70">
            ELEVEN
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-lg font-display text-xs tracking-wider uppercase transition-all duration-300 ${
                location.pathname === item.path
                  ? 'text-primary bg-primary/10 border border-primary/30'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {!user ? (
            <Link to="/auth" className="holo-btn px-4 py-2 rounded-lg text-xs font-display tracking-wider ml-1">
              <span className="relative z-10">LOGIN</span>
            </Link>
          ) : (
            <Link to="/dashboard" className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs ml-1 overflow-hidden">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
              ) : '👤'}
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-muted-foreground">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-16 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col items-center gap-2 p-6">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`w-full text-center px-4 py-3 rounded-lg font-display text-sm tracking-wider uppercase ${
                  location.pathname === item.path
                    ? 'text-primary bg-primary/10 border border-primary/30'
                    : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {!user ? (
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="holo-btn w-full text-center px-4 py-3 rounded-lg text-sm font-display tracking-wider mt-2">
                <span className="relative z-10">LOGIN</span>
              </Link>
            ) : (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="holo-btn w-full text-center px-4 py-3 rounded-lg text-sm font-display tracking-wider mt-2">
                <span className="relative z-10">DASHBOARD</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
