import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { streamChat } from '@/lib/chatStream';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Send, Mic, MicOff, Volume2 } from 'lucide-react';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

interface CharacterData {
  id: string;
  name: string;
  personality: string;
  backstory: string | null;
  communication_style: string | null;
  avatar: string | null;
  color: string | null;
}

const ChatChamber = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const characterId = searchParams.get('character');

  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
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

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const saveMessage = async (role: string, content: string) => {
    if (!user || !characterId) return;
    await supabase.from('messages').insert({ user_id: user.id, character_id: characterId, role, message: content });
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

    await streamChat({
      messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
      characterName: character.name,
      characterPersonality: personality,
      onDelta: upsert,
      onDone: async () => {
        setIsStreaming(false);
        if (assistantSoFar) await saveMessage('assistant', assistantSoFar);
      },
      onError: (err) => toast.error(err),
    });
  }, [input, character, isStreaming, messages, user, characterId]);

  // Voice input
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // Text-to-speech
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-primary animate-pulse font-display">LOADING...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!characterId) return <Navigate to="/characters" replace />;

  const color = character?.color || '#00f0ff';

  return (
    <div className="min-h-screen bg-background pt-20 flex flex-col">
      {/* Character header */}
      {character && (
        <div className="border-b border-border/50 px-6 py-4 flex items-center gap-4 bg-card/50 backdrop-blur-xl">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: `linear-gradient(135deg, ${color}20, ${color}05)`, border: `1px solid ${color}40` }}
          >
            {character.avatar}
          </div>
          <div>
            <h2 className="font-display text-sm font-bold tracking-wider" style={{ color }}>{character.name}</h2>
            <p className="text-xs text-muted-foreground">{character.personality?.slice(0, 60)}...</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-muted-foreground font-display">ONLINE</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && character && (
          <div className="text-center text-muted-foreground py-20">
            <div className="text-5xl mb-4">{character.avatar}</div>
            <p className="font-display text-sm tracking-wider" style={{ color }}>Begin your conversation with {character.name}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary/20 border border-primary/30 text-foreground'
                  : 'bg-secondary/15 border border-secondary/25 text-foreground'
              }`}
            >
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

      {/* Input */}
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
