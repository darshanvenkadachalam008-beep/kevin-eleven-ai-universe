import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { streamChat } from '@/lib/chatStream';
import { streamOllamaChat, isOllamaAvailable } from '@/lib/ollamaChat';
import { buildEvolutionPrompt, checkAndStoreEvolution, getMilestoneForCount } from '@/lib/characterEvolution';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Send, Mic, MicOff, Volume2, Heart, Shield, Users, Sparkles, Dna } from 'lucide-react';

interface ChatMsg { role: 'user' | 'assistant'; content: string; }

interface CharacterData {
  id: string; name: string; personality: string; backstory: string | null;
  communication_style: string | null; avatar: string | null; color: string | null;
}

const relationshipLabels: Record<string, { label: string; icon: typeof Heart; color: string }> = {
  stranger: { label: 'STRANGER', icon: Users, color: '#666' },
  friend: { label: 'FRIEND', icon: Heart, color: '#00f0ff' },
  companion: { label: 'COMPANION', icon: Shield, color: '#8b5cf6' },
  trusted_ally: { label: 'TRUSTED ALLY', icon: Sparkles, color: '#ffcc00' },
};

const ChatChamber = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const characterId = searchParams.get('character');

  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [relationship, setRelationship] = useState<string>('stranger');
  const [interactionCount, setInteractionCount] = useState(0);
  const [evolutionStage, setEvolutionStage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load character
  useEffect(() => {
    if (!characterId) return;
    supabase.from('characters').select('*').eq('id', characterId).single()
      .then(({ data }) => { if (data) setCharacter(data); });
  }, [characterId]);

  // Load previous messages
  useEffect(() => {
    if (!user || !characterId) return;
    supabase.from('messages').select('role, message')
      .eq('user_id', user.id).eq('character_id', characterId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data.map(m => ({ role: m.role as 'user' | 'assistant', content: m.message })));
      });
  }, [user, characterId]);

  // Load relationship
  useEffect(() => {
    if (!user || !characterId) return;
    supabase.from('relationships').select('level, interaction_count')
      .eq('user_id', user.id).eq('character_id', characterId).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setRelationship(data.level);
          setInteractionCount(data.interaction_count);
          const m = getMilestoneForCount(data.interaction_count);
          if (m) setEvolutionStage(m.personalityStage);
        }
      });
  }, [user, characterId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const saveMessage = async (role: string, content: string) => {
    if (!user || !characterId) return;
    await supabase.from('messages').insert({ user_id: user.id, character_id: characterId, role, message: content });
  };

  const updateRelationship = async () => {
    if (!user || !characterId) return;
    const newCount = interactionCount + 1;
    setInteractionCount(newCount);

    let newLevel = 'stranger';
    if (newCount >= 50) newLevel = 'trusted_ally';
    else if (newCount >= 20) newLevel = 'companion';
    else if (newCount >= 5) newLevel = 'friend';
    setRelationship(newLevel);

    const { data: existing } = await supabase.from('relationships')
      .select('id').eq('user_id', user.id).eq('character_id', characterId).maybeSingle();

    if (existing) {
      await supabase.from('relationships').update({ level: newLevel, interaction_count: newCount, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase.from('relationships').insert({ user_id: user.id, character_id: characterId, level: newLevel, interaction_count: newCount });
    }

    // Check for evolution milestone
    const milestone = await checkAndStoreEvolution(user.id, characterId, newCount);
    if (milestone) {
      setEvolutionStage(milestone.personalityStage);
      toast.success(`${character?.name} has evolved! Stage: ${milestone.personalityStage}`, { duration: 4000 });
    }
  };

  const sendMessage = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || !character || isStreaming) return;
    setInput('');

    const userMsg: ChatMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);
    await saveMessage('user', msg);

    let assistantSoFar = '';
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && prev.length > 0 && prev[prev.length - 2]?.content === msg) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    const personality = [character.personality, character.backstory, character.communication_style].filter(Boolean).join('. ');
    const evolutionContext = buildEvolutionPrompt(interactionCount);

    const ollamaOk = await isOllamaAvailable();
    const streamFn = ollamaOk ? streamOllamaChat : streamChat;

    await streamFn({
      messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
      characterName: character.name,
      characterPersonality: personality + evolutionContext,
      onDelta: upsert,
      onDone: async () => {
        setIsStreaming(false);
        if (assistantSoFar) {
          await saveMessage('assistant', assistantSoFar);
          await updateRelationship();
        }
      },
      onError: (err) => toast.error(err),
    });
  }, [input, character, isStreaming, messages, user, characterId, interactionCount]);

  // Voice input
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice not supported in this browser');
      return;
    }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9; u.pitch = 1.1;
    speechSynthesis.speak(u);
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-primary animate-pulse font-display">LOADING...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!characterId) return <Navigate to="/characters" replace />;

  const color = character?.color || '#00f0ff';
  const rel = relationshipLabels[relationship] || relationshipLabels.stranger;

  return (
    <div className="min-h-screen bg-background pt-20 flex flex-col">
      {character && (
        <div className="border-b border-border/50 px-4 md:px-6 py-3 flex items-center gap-3 bg-card/50 backdrop-blur-xl">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${color}20, ${color}05)`, border: `1px solid ${color}40` }}
          >
            {character.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-sm font-bold tracking-wider" style={{ color }}>{character.name}</h2>
            <p className="text-xs text-muted-foreground truncate">{character.personality?.slice(0, 50)}...</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {evolutionStage && (
              <div className="hidden sm:flex items-center gap-1" title="Evolution stage">
                <Dna className="w-3 h-3 text-secondary" />
                <span className="text-[10px] font-display tracking-wider text-secondary uppercase">{evolutionStage}</span>
              </div>
            )}
            <div className="flex items-center gap-1" title={`${interactionCount} interactions`}>
              <rel.icon className="w-3 h-3" style={{ color: rel.color }} />
              <span className="text-xs font-display tracking-wider" style={{ color: rel.color }}>{rel.label}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-muted-foreground font-display">ONLINE</span>
            </div>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && character && (
          <div className="text-center text-muted-foreground py-20">
            <div className="text-5xl mb-4">{character.avatar}</div>
            <p className="font-display text-sm tracking-wider" style={{ color }}>Begin your conversation with {character.name}</p>
            {evolutionStage && (
              <p className="text-xs text-secondary/60 mt-2 font-display">Evolution: {evolutionStage}</p>
            )}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary/20 border border-primary/30 text-foreground'
                : 'bg-secondary/15 border border-secondary/25 text-foreground'
            }`}>
              <ReactMarkdown components={{ p: ({ children }) => <p className="m-0">{children}</p> }}>{msg.content}</ReactMarkdown>
              {msg.role === 'assistant' && (
                <button onClick={() => speak(msg.content)} className="mt-2 text-muted-foreground hover:text-primary transition-colors">
                  <Volume2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-secondary/15 border border-secondary/25 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border/50 p-4 bg-card/50 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto flex gap-2">
          <button
            onClick={toggleVoice}
            className={`p-3 rounded-xl border transition-all ${isListening ? 'border-primary bg-primary/20 text-primary' : 'border-border text-muted-foreground hover:text-primary hover:border-primary/50'}`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={`Message ${character?.name || ''}...`}
            className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:border-primary focus:outline-none transition-colors text-sm"
            disabled={isStreaming}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isStreaming || !input.trim()}
            className="holo-btn p-3 rounded-xl disabled:opacity-50"
          >
            <Send className="w-5 h-5 relative z-10" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatChamber;
