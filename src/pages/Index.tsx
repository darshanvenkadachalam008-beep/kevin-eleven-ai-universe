import HeroScene from '@/components/HeroScene';
import CharacterCard from '@/components/CharacterCard';
import { characters } from '@/data/characters';
import { useEffect, useRef } from 'react';

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple fade-in on mount
    if (heroRef.current) {
      heroRef.current.style.opacity = '1';
      heroRef.current.style.transform = 'translateY(0)';
    }
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* 3D Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroScene />

        {/* Hero Content Overlay */}
        <div
          ref={heroRef}
          className="relative z-10 text-center px-4 transition-all duration-1000 ease-out"
          style={{ opacity: 0, transform: 'translateY(30px)' }}
        >
          {/* Logo */}
          <h1 className="font-display text-7xl md:text-9xl font-black tracking-[0.2em] text-primary neon-text mb-2">
            KEVIN
          </h1>
          <div className="font-display text-xl md:text-2xl tracking-[0.5em] text-secondary neon-text-purple mb-8 uppercase">
            Eleven
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-foreground/70 mb-10 max-w-lg mx-auto font-body leading-relaxed">
            Enter the AI Character Universe
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/characters"
              className="holo-btn px-8 py-3 rounded-lg text-sm inline-block"
            >
              <span className="relative z-10">Explore Characters</span>
            </a>
            <button className="holo-btn px-8 py-3 rounded-lg text-sm" style={{ borderColor: 'hsl(262 83% 58% / 0.4)', color: 'hsl(262 83% 58%)' }}>
              <span className="relative z-10">Create Character</span>
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 rounded-full bg-primary/50 animate-pulse-glow" />
          </div>
        </div>
      </section>

      {/* Characters Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-primary neon-text mb-3 tracking-wider">
            AI CHARACTERS
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-md mx-auto">
            Meet the inhabitants of the Kevin Eleven universe
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char, i) => (
              <CharacterCard
                key={char.id}
                name={char.name}
                role={char.role}
                description={char.description}
                color={char.color}
                icon={char.icon}
                delay={i * 0.5}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-border/30 text-center">
        <p className="font-display text-xs text-muted-foreground tracking-widest">
          KEVIN ELEVEN — AI CHARACTER UNIVERSE
        </p>
      </footer>
    </div>
  );
};

export default Index;
