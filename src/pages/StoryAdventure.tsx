import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { streamChat } from '@/lib/chatStream';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Sword, BookOpen, Compass, Sparkles, Skull } from 'lucide-react';

const genres = [
  { id: 'space_mission', label: 'Space Mission', icon: Compass, description: 'Explore unknown galaxies and encounter alien civilizations' },
  { id: 'detective', label: 'Detective Mystery', icon: BookOpen, description: 'Solve crimes and unravel conspiracies' },
  { id: 'fantasy_quest', label: 'Fantasy Quest', icon: Sword, description: 'Embark on magical adventures in enchanted realms' },
  { id: 'survival', label: 'Survival', icon: Sparkles, description: 'Survive against all odds in hostile environments' },
  { id: 'cosmic_war', label: 'Cosmic War', icon: Skull, description: 'Command fleets, defend planets, and wage galactic warfare' },
];

interface StoryMsg {
  role: 'user' | 'assistant';
  content: string;
}

const StoryAdventure = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const characterId = searchParams.get('character');
  const [character, setCharacter] = useState<any>(null);
  const [genre, setGenre] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<StoryMsg[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [choices, setChoices] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!characterId) return;
    supabase.from('characters').select('*').eq('id', characterId).single()
      .then(({ data }) => { if (data) setCharacter(data); });
  }, [characterId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const startAdventure = async (selectedGenre: string) => {
    if (!user || !characterId || !character) return;
    setGenre(selectedGenre);

    const { data: session } = await supabase.from('story_sessions').insert({
      user_id: user.id,
      character_id: characterId,
      title: `${selectedGenre} with ${character.name}`,
      genre: selectedGenre,
      story_state: {},
    }).select('id').single();

    if (session) setSessionId(session.id);

    const personality = [character.personality, character.backstory].filter(Boolean).join('. ');
    const storyPrompt = `Start an interactive ${selectedGenre.replace('_', ' ')} story adventure. Set the scene vividly in 2-3 paragraphs. At the end, present exactly 3 choices for the player, formatted as:\n\n1. [choice]\n2. [choice]\n3. [choice]\n\nMake it immersive and dramatic.`;

    setIsStreaming(true);
    let response = '';

    await streamChat({
      messages: [{ role: 'user', content: storyPrompt }],
      characterName: character.name,
      characterPersonality: personality,
      onDelta: (chunk: string) => {
        response += chunk;
        setMessages([{ role: 'assistant', content: response }]);
      },
      onDone: () => {
        setIsStreaming(false);
        extractChoices(response);
      },
      onError: (err: string) => { toast.error(err); setIsStreaming(false); },
    });
  };

  const makeChoice = useCallback(async (choice: string) => {
    if (!character || isStreaming) return;
    const userMsg: StoryMsg = { role: 'user', content: choice };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setChoices([]);
    setIsStreaming(true);

    let response = '';
    const personality = [character.personality, character.backstory].filter(Boolean).join('. ');
    const continuePrompt = `The player chose: "${choice}". Continue the story based on this choice. Write 2-3 paragraphs of narrative, then present exactly 3 new choices formatted as:\n\n1. [choice]\n2. [choice]\n3. [choice]`;

    const allMsgs = [...updated.map(m => ({ role: m.role, content: m.content })), { role: 'user' as const, content: continuePrompt }];

    await streamChat({
      messages: allMsgs,
      characterName: character.name,
      characterPersonality: personality,
      onDelta: (chunk: string) => {
        response += chunk;
        setMessages([...updated, { role: 'assistant', content: response }]);
      },
      onDone: () => {
        setIsStreaming(false);
        extractChoices(response);
      },
      onError: (err: string) => { toast.error(err); setIsStreaming(false); },
    });
  }, [character, isStreaming, messages]);

  const extractChoices = (text: string) => {
    const lines = text.split('\n');
    const extracted: string[] = [];
    for (const line of lines) {
      const match = line.match(/^\d+\.\s+(.+)/);
      if (match) extracted.push(match[1].trim());
    }
    if (extracted.length >= 2) setChoices(extracted.slice(0, 3));
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-primary animate-pulse font-display">LOADING...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const color = character?.color || '#00f0ff';

  if (!genre) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl font-bold text-primary neon-text mb-3 tracking-wider">STORY ADVENTURE</h1>
          <p className="text-muted-foreground mb-4">Choose your adventure genre</p>
          {character && (
            <p className="text-sm mb-8" style={{ color }}>Adventuring with <span className="font-display font-bold">{character.name}</span></p>
          )}
          {!characterId && (
            <div className="holo-card rounded-2xl p-8 mb-8">
              <p className="text-muted-foreground mb-4">Select a character first</p>
              <Link to="/characters" className="holo-btn px-6 py-2 rounded-lg text-xs inline-block">
                <span className="relative z-10">GO TO GALAXY</span>
              </Link>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {genres.map(g => (
              <button
                key={g.id}
                onClick={() => characterId && startAdventure(g.id)}
                disabled={!characterId}
                className="holo-card rounded-xl p-6 text-left disabled:opacity-40 group"
              >
                <g.icon className="w-8 h-8 text-primary mb-3 group-hover:drop-shadow-[0_0_8px_hsl(185_100%_50%/0.6)]" />
                <h3 className="font-display text-sm font-bold text-primary tracking-wider mb-1">{g.label.toUpperCase()}</h3>
                <p className="text-xs text-muted-foreground">{g.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 flex flex-col">
      {character && (
        <div className="border-b border-border/50 px-6 py-3 flex items-center gap-3 bg-card/50 backdrop-blur-xl">
          <span className="text-2xl">{character.avatar}</span>
          <div>
            <h2 className="font-display text-xs font-bold tracking-wider" style={{ color }}>{character.name}</h2>
            <p className="text-xs text-muted-foreground font-display">{genre?.replace('_', ' ').toUpperCase()} ADVENTURE</p>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i} className={`${msg.role === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block max-w-[90%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary/20 border border-primary/30'
                : 'bg-secondary/10 border border-secondary/20'
            }`}>
              <ReactMarkdown components={{ p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p> }}>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isStreaming && messages.length === 0 && (
          <div className="text-center text-primary animate-pulse font-display text-sm tracking-wider">GENERATING ADVENTURE...</div>
        )}
      </div>

      {choices.length > 0 && !isStreaming && (
        <div className="border-t border-border/50 p-4 bg-card/50 backdrop-blur-xl">
          <p className="text-xs text-muted-foreground font-display tracking-wider text-center mb-3">CHOOSE YOUR PATH</p>
          <div className="max-w-2xl mx-auto space-y-2">
            {choices.map((c, i) => (
              <button
                key={i}
                onClick={() => makeChoice(c)}
                className="holo-btn w-full py-3 px-4 rounded-lg text-sm text-left"
              >
                <span className="relative z-10">{i + 1}. {c}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryAdventure;
