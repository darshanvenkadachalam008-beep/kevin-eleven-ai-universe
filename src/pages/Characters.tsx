import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import WarpTunnel from '@/components/WarpTunnel';

const GalaxyExplorer = lazy(() => import('@/components/GalaxyExplorer'));

interface DbCharacter {
  id: string;
  name: string;
  personality: string;
  avatar: string | null;
  color: string | null;
  backstory?: string | null;
}

const Characters = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<DbCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [warpActive, setWarpActive] = useState(false);
  const [warpTarget, setWarpTarget] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('characters').select('id, name, personality, avatar, color, backstory')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setCharacters(data || []);
        setLoading(false);
      });
  }, []);

  const selected = characters.find(c => c.id === selectedId);

  const enterChat = useCallback((charId: string) => {
    setWarpTarget(charId);
    setWarpActive(true);
  }, []);

  const onWarpComplete = useCallback(() => {
    setWarpActive(false);
    if (warpTarget) {
      navigate(`/chat-chamber?character=${warpTarget}`);
    }
  }, [warpTarget, navigate]);

  return (
    <div className="min-h-screen bg-background relative pt-16">
      <WarpTunnel active={warpActive} onComplete={onWarpComplete} />

      {/* 3D Galaxy */}
      <div className="h-[60vh] relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-primary animate-pulse font-display tracking-widest">SCANNING UNIVERSE...</div>
          </div>
        ) : (
          <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="text-primary animate-pulse font-display">LOADING GALAXY...</div></div>}>
            <GalaxyExplorer
              characters={characters}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </Suspense>
        )}

        {/* Header overlay */}
        <div className="absolute top-4 left-0 right-0 text-center pointer-events-none z-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary neon-text tracking-wider">
            CHARACTER GALAXY
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Click a planet to select · Scroll to zoom · Drag to rotate</p>
        </div>
      </div>

      {/* Character info panel */}
      <div className="relative z-10 px-4 py-6">
        {selected ? (
          <div className="max-w-3xl mx-auto">
            <div className="holo-card rounded-2xl p-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                {/* Avatar + stats */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-3"
                    style={{
                      background: `linear-gradient(135deg, ${selected.color || '#00f0ff'}20, ${selected.color || '#00f0ff'}05)`,
                      border: `2px solid ${selected.color || '#00f0ff'}40`,
                      boxShadow: `0 0 25px ${selected.color || '#00f0ff'}30`,
                    }}
                  >
                    {selected.avatar || '🤖'}
                  </div>
                  <h3 className="font-display text-sm font-bold tracking-wider text-center" style={{ color: selected.color || '#00f0ff' }}>
                    {selected.name}
                  </h3>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="mb-3">
                    <p className="text-xs font-display tracking-wider text-muted-foreground mb-1">PERSONALITY</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{selected.personality}</p>
                  </div>
                  {selected.backstory && (
                    <div className="mb-3">
                      <p className="text-xs font-display tracking-wider text-muted-foreground mb-1">BACKSTORY</p>
                      <p className="text-xs text-muted-foreground/70 italic leading-relaxed">{selected.backstory.slice(0, 200)}{selected.backstory.length > 200 ? '...' : ''}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      onClick={() => enterChat(selected.id)}
                      className="holo-btn px-6 py-2.5 rounded-lg text-xs"
                      style={{ borderColor: `${selected.color || '#00f0ff'}40`, color: selected.color || '#00f0ff' }}
                    >
                      <span className="relative z-10">⚡ ENTER CHAT</span>
                    </button>
                    <Link
                      to={`/story-adventure?character=${selected.id}`}
                      className="holo-btn px-6 py-2.5 rounded-lg text-xs"
                      style={{ borderColor: `${selected.color || '#00f0ff'}40`, color: selected.color || '#00f0ff' }}
                    >
                      <span className="relative z-10">⚔ STORY ADVENTURE</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto text-center mb-6">
            <p className="text-muted-foreground text-sm font-display tracking-wider">
              SELECT A PLANET TO VIEW CHARACTER
            </p>
          </div>
        )}

        {/* Grid fallback */}
        {!selected && (
          <div className="max-w-6xl mx-auto mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {characters.map(char => {
              const color = char.color || '#00f0ff';
              return (
                <button
                  key={char.id}
                  onClick={() => setSelectedId(char.id)}
                  className="holo-card rounded-xl p-4 text-center transition-all hover:scale-105"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2 mx-auto"
                    style={{ background: `linear-gradient(135deg, ${color}20, ${color}05)`, border: `1px solid ${color}40` }}
                  >
                    {char.avatar || '🤖'}
                  </div>
                  <p className="font-display text-xs font-bold tracking-wider" style={{ color }}>{char.name}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Characters;
