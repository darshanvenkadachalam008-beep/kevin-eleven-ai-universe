import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import HeroScene from '@/components/HeroScene';

interface DbCharacter {
  id: string;
  name: string;
  personality: string;
  avatar: string | null;
  color: string | null;
}

const Characters = () => {
  const [characters, setCharacters] = useState<DbCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('characters').select('id, name, personality, avatar, color')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setCharacters(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background relative pt-20">
      <div className="fixed inset-0 z-0 opacity-40">
        <HeroScene />
      </div>

      <div className="relative z-10 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-center text-primary neon-text mb-3 tracking-wider">
            CHARACTER GALAXY
          </h1>
          <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
            Explore holographic AI personalities orbiting the Kevin Eleven universe
          </p>

          {loading ? (
            <div className="text-center text-primary animate-pulse font-display">SCANNING UNIVERSE...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((char, i) => {
                const color = char.color || '#00f0ff';
                const isHovered = hoveredId === char.id;
                return (
                  <div
                    key={char.id}
                    className="holo-card rounded-xl p-6 cursor-pointer animate-float"
                    style={{
                      animationDelay: `${i * 0.3}s`,
                      borderColor: isHovered ? color : undefined,
                      boxShadow: isHovered ? `0 0 20px ${color}40, 0 0 60px ${color}15` : undefined,
                    }}
                    onMouseEnter={() => setHoveredId(char.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${color}20, ${color}05)`,
                        border: `1px solid ${color}40`,
                        boxShadow: isHovered ? `0 0 15px ${color}50` : undefined,
                      }}
                    >
                      {char.avatar || '🤖'}
                    </div>
                    <h3 className="font-display text-sm font-bold text-center mb-1 tracking-wider uppercase" style={{ color }}>
                      {char.name}
                    </h3>
                    <p className="text-xs text-muted-foreground/70 text-center leading-relaxed mb-4">
                      {char.personality.slice(0, 100)}{char.personality.length > 100 ? '...' : ''}
                    </p>
                    <Link
                      to={`/chat-chamber?character=${char.id}`}
                      className="holo-btn w-full py-2 px-4 rounded-lg text-xs relative z-10 block text-center"
                      style={{ borderColor: `${color}40`, color }}
                    >
                      <span className="relative z-10">Enter Chat</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Characters;
