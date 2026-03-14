import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Search, X } from 'lucide-react';

interface SearchResult {
  type: 'character' | 'story' | 'event';
  id: string;
  title: string;
  subtitle: string;
  link: string;
  avatar?: string;
  color?: string;
}

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => search(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const search = async (q: string) => {
    setLoading(true);
    const lower = q.toLowerCase();

    const [chars, stories, events] = await Promise.all([
      supabase.from('characters').select('id, name, personality, avatar, color')
        .or(`name.ilike.%${lower}%,personality.ilike.%${lower}%`).limit(5),
      supabase.from('story_sessions').select('id, title, genre, characters(name)')
        .ilike('title', `%${lower}%`).limit(3),
      supabase.from('universe_events').select('id, title, event_type, description')
        .ilike('title', `%${lower}%`).limit(3),
    ]);

    const r: SearchResult[] = [];
    (chars.data || []).forEach(c => r.push({
      type: 'character', id: c.id, title: c.name,
      subtitle: c.personality?.slice(0, 60) || '', link: `/chat-chamber?character=${c.id}`,
      avatar: c.avatar || '🤖', color: c.color || '#00f0ff',
    }));
    (stories.data || []).forEach(s => r.push({
      type: 'story', id: s.id, title: s.title,
      subtitle: s.genre, link: '/story-adventure', avatar: '⚔',
    }));
    (events.data || []).forEach(e => r.push({
      type: 'event', id: e.id, title: e.title,
      subtitle: e.event_type, link: '/universe-feed', avatar: '🌌',
    }));

    setResults(r);
    setLoading(false);
  };

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
        title="Search (⌘K)">
        <Search className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search characters, stories, events..."
            className="flex-1 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground/50" />
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading && <div className="px-4 py-3 text-xs text-primary animate-pulse font-display">SCANNING...</div>}

        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto py-2">
            {results.map(r => (
              <Link key={`${r.type}-${r.id}`} to={r.link} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors">
                <span className="text-lg flex-shrink-0">{r.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display tracking-wider" style={{ color: r.color }}>{r.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
                </div>
                <span className="text-[10px] font-display tracking-wider text-muted-foreground/50 uppercase">{r.type}</span>
              </Link>
            ))}
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">No results found</div>
        )}

        {!query && (
          <div className="px-4 py-4 text-center text-xs text-muted-foreground/50">
            Type to search across the universe
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;
