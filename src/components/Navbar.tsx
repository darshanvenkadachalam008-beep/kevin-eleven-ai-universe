import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Hub' },
  { path: '/characters', label: 'Galaxy' },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/60 backdrop-blur-xl border-b border-border/50">
      <Link to="/" className="flex items-center gap-2">
        <span className="font-display text-2xl font-bold text-primary neon-text tracking-widest">
          KEVIN
        </span>
        <span className="font-display text-sm font-medium text-secondary tracking-wider opacity-70">
          ELEVEN
        </span>
      </Link>

      <div className="flex items-center gap-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-4 py-2 rounded-lg font-display text-xs tracking-wider uppercase transition-all duration-300 ${
              location.pathname === item.path
                ? 'text-primary bg-primary/10 border border-primary/30'
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
