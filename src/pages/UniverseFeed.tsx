import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Star, MessageSquare, Heart, TrendingUp, Clock, Award, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface CharacterWithStats {
  id: string;
  name: string;
  personality: string;
  avatar: string | null;
  color: string | null;
  creator_id: string | null;
  avg_rating?: number;
  rating_count?: number;
  is_favorited?: boolean;
}

// Simulated interaction templates
const interactionTemplates = [
  { type: 'debate', template: '{a} challenged {b} to a philosophical debate about the nature of consciousness.' },
  { type: 'alliance', template: '{a} formed a strategic alliance with {b} to explore the outer rim.' },
  { type: 'discovery', template: '{a} discovered a hidden data stream that reveals ancient knowledge.' },
  { type: 'conflict', template: '{a} and {b} disagreed on the best approach to solving the quantum paradox.' },
  { type: 'collaboration', template: '{a} and {b} are working together on a new interstellar communication protocol.' },
  { type: 'event', template: '{a} unlocked a new ability after extensive interactions with explorers.' },
];

const UniverseFeed = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'trending' | 'newest' | 'top'>('trending');
  const [characters, setCharacters] = useState<CharacterWithStats[]>([]);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    loadCharacters();
    generateFeed();
  }, [tab]);

  useEffect(() => {
    if (user) loadUserRatings();
  }, [user]);

  const loadCharacters = async () => {
    setLoading(true);
    let query = supabase.from('characters').select('id, name, personality, avatar, color, creator_id, created_at');

    if (tab === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: true });
    }

    const { data } = await query.limit(20);

    // Load ratings
    const { data: ratings } = await supabase.from('ratings').select('character_id, rating');

    const charStats = (data || []).map(char => {
      const charRatings = (ratings || []).filter(r => r.character_id === char.id);
      const avg = charRatings.length > 0
        ? charRatings.reduce((s, r) => s + r.rating, 0) / charRatings.length
        : 0;
      return { ...char, avg_rating: avg, rating_count: charRatings.length };
    });

    if (tab === 'top') {
      charStats.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
    } else if (tab === 'trending') {
      charStats.sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0));
    }

    setCharacters(charStats);
    setLoading(false);
  };

  const loadUserRatings = async () => {
    if (!user) return;
    const { data } = await supabase.from('ratings').select('character_id, rating').eq('user_id', user.id);
    const map: Record<string, number> = {};
    (data || []).forEach(r => { map[r.character_id] = r.rating; });
    setUserRatings(map);
  };

  const rateCharacter = async (characterId: string, rating: number) => {
    if (!user) { toast.error('Login to rate characters'); return; }
    const existing = userRatings[characterId];
    if (existing) {
      await supabase.from('ratings').update({ rating }).eq('user_id', user.id).eq('character_id', characterId);
    } else {
      await supabase.from('ratings').insert({ user_id: user.id, character_id: characterId, rating });
    }
    setUserRatings(prev => ({ ...prev, [characterId]: rating }));
    toast.success(`Rated ${rating} stars`);
    loadCharacters();
  };

  const toggleFavorite = async (characterId: string) => {
    if (!user) { toast.error('Login to favorite'); return; }
    const { data: existing } = await supabase.from('favorites')
      .select('id').eq('user_id', user.id).eq('character_id', characterId).maybeSingle();
    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id);
      toast.success('Removed from favorites');
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, character_id: characterId });
      toast.success('Added to favorites');
    }
  };

  const generateFeed = () => {
    // Generate simulated feed items
    const items = [];
    for (let i = 0; i < 6; i++) {
      const template = interactionTemplates[i % interactionTemplates.length];
      items.push({
        id: i,
        ...template,
        time: `${Math.floor(Math.random() * 23) + 1}h ago`,
      });
    }
    setFeedItems(items);
  };

  const tabs = [
    { id: 'trending', label: 'TRENDING', icon: TrendingUp },
    { id: 'newest', label: 'NEWEST', icon: Clock },
    { id: 'top', label: 'TOP RATED', icon: Award },
  ] as const;

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-center text-primary neon-text mb-3 tracking-wider">UNIVERSE FEED</h1>
        <p className="text-center text-muted-foreground mb-8">Discover characters & universe activity</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="flex gap-2 mb-6">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-display text-xs tracking-wider transition-all ${
                    tab === t.id
                      ? 'text-primary bg-primary/10 border border-primary/30'
                      : 'text-muted-foreground hover:text-primary border border-transparent'
                  }`}
                >
                  <t.icon className="w-3 h-3" />
                  {t.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center text-primary animate-pulse font-display py-12">SCANNING...</div>
            ) : (
              <div className="space-y-4">
                {characters.map(char => {
                  const color = char.color || '#00f0ff';
                  const userRating = userRatings[char.id] || 0;
                  return (
                    <div key={char.id} className="holo-card rounded-xl p-5 flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${color}20, ${color}05)`, border: `1px solid ${color}40` }}
                      >
                        {char.avatar || '🤖'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-sm font-bold tracking-wider" style={{ color }}>{char.name}</h3>
                          {(char.avg_rating || 0) > 0 && (
                            <span className="text-xs text-muted-foreground">★ {char.avg_rating?.toFixed(1)} ({char.rating_count})</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{char.personality?.slice(0, 120)}</p>
                        <div className="flex items-center gap-3">
                          {/* Rating stars */}
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <button key={s} onClick={() => rateCharacter(char.id, s)}>
                                <Star className={`w-4 h-4 transition-colors ${s <= userRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-400/50'}`} />
                              </button>
                            ))}
                          </div>
                          <Link to={`/chat-chamber?character=${char.id}`}
                            className="text-muted-foreground hover:text-primary transition-colors">
                            <MessageSquare className="w-4 h-4" />
                          </Link>
                          <button onClick={() => toggleFavorite(char.id)} className="text-muted-foreground hover:text-pink-400 transition-colors">
                            <Heart className="w-4 h-4" />
                          </button>
                          <Link to={`/story-adventure?character=${char.id}`}
                            className="text-muted-foreground hover:text-primary transition-colors" title="Start Adventure">
                            <Zap className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity Feed sidebar */}
          <div>
            <h2 className="font-display text-sm text-muted-foreground tracking-wider mb-4">UNIVERSE ACTIVITY</h2>
            <div className="space-y-3">
              {feedItems.map(item => (
                <div key={item.id} className="holo-card rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-xs text-muted-foreground font-display tracking-wider">{item.type.toUpperCase()}</span>
                    <span className="text-xs text-muted-foreground/50 ml-auto">{item.time}</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {item.template.replace('{a}', characters[0]?.name || 'Unknown').replace('{b}', characters[1]?.name || 'Unknown')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniverseFeed;
