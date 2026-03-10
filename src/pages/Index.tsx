import HeroScene from '@/components/HeroScene';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (heroRef.current) {
      heroRef.current.style.opacity = '1';
      heroRef.current.style.transform = 'translateY(0)';
    }
    supabase.from('characters').select('id, name, personality, avatar, color')
      .eq('is_default', true).order('created_at')
      .then(({ data }) => setCharacters(data || []));
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroScene />
        <div
          ref={heroRef}
          className="relative z-10 text-center px-4 transition-all duration-1000 ease-out"
          style={{ opacity: 0, transform: 'translateY(30px)' }}
        >
          <h1 className="font-display text-7xl md:text-9xl font-black tracking-[0.2em] text-primary neon-text mb-2">
            KEVIN
          </h1>
          <div className="font-display text-xl md:text-2xl tracking-[0.5em] text-secondary neon-text-purple mb-8 uppercase">
            Eleven
          </div>
          <p className="text-lg md:text-xl text-foreground/70 mb-10 max-w-lg mx-auto font-body leading-relaxed">
            Enter the AI Character Universe
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/characters" className="holo-btn px-8 py-3 rounded-lg text-sm inline-block">
              <span className="relative z-10">Explore Characters</span>
            </Link>
            <Link to="/creation-lab" className="holo-btn px-8 py-3 rounded-lg text-sm inline-block" style={{ borderColor: 'hsl(262 83% 58% / 0.4)', color: 'hsl(262 83% 58%)' }}>
              <span className="relative z-10">Create Character</span>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 rounded-full bg-primary/50 animate-pulse-glow" />
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-primary neon-text mb-3 tracking-wider">
            AI CHARACTERS
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-md mx-auto">
            Meet the inhabitants of the Kevin Eleven universe
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char, i) => {
              const color = char.color || '#00f0ff';
              const isHovered = hoveredId === char.id;
              return (
                <div
                  key={char.id}
                  className="holo-card rounded-xl p-6 cursor-pointer animate-float"
                  style={{ animationDelay: `${i * 0.5}s`, borderColor: isHovered ? color : undefined, boxShadow: isHovered ? `0 0 20px ${color}40, 0 0 60px ${color}15` : undefined }}
                  onMouseEnter={() => setHoveredId(char.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto transition-all duration-300"
                    style={{ background: `linear-gradient(135deg, ${color}20, ${color}05)`, border: `1px solid ${color}40`, boxShadow: isHovered ? `0 0 15px ${color}50` : undefined }}>
                    {char.avatar || '🤖'}
                  </div>
                  <h3 className="font-display text-sm font-bold text-center mb-1 tracking-wider uppercase" style={{ color }}>{char.name}</h3>
                  <p className="text-xs text-muted-foreground/70 text-center leading-relaxed mb-4">
                    {char.personality?.slice(0, 80)}...
                  </p>
                  <Link to={`/chat-chamber?character=${char.id}`}
                    className="holo-btn w-full py-2 px-4 rounded-lg text-xs relative z-10 block text-center"
                    style={{ borderColor: `${color}40`, color }}>
                    <span className="relative z-10">Enter Chat</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-8 border-t border-border/30 text-center">
        <p className="font-display text-xs text-muted-foreground tracking-widest">
          KEVIN ELEVEN — AI CHARACTER UNIVERSE
        </p>
      </footer>
    </div>
  );
};

export default Index;
