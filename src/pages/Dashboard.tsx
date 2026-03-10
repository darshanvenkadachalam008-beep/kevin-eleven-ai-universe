import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, MessageSquare, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [myChars, setMyChars] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    // Load profile
    supabase.from('profiles').select('*').eq('user_id', user.id).single()
      .then(({ data }) => setProfile(data));

    // Load user's characters
    supabase.from('characters').select('*').eq('creator_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setMyChars(data || []));

    // Load recent chats (distinct characters)
    supabase.from('messages').select('character_id, created_at, characters(name, avatar, color)')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => {
        if (!data) return;
        const seen = new Set<string>();
        const unique = data.filter(m => {
          if (seen.has(m.character_id)) return false;
          seen.add(m.character_id);
          return true;
        }).slice(0, 5);
        setRecentChats(unique);
      });
  }, [user]);

  const deleteCharacter = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const { error } = await supabase.from('characters').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else {
      setMyChars(prev => prev.filter(c => c.id !== id));
      toast.success(`${name} deleted`);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-primary animate-pulse font-display">LOADING...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-primary neon-text tracking-wider">COMMAND CENTER</h1>
          <button onClick={signOut} className="holo-btn px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <LogOut className="w-4 h-4 relative z-10" />
            <span className="relative z-10">LOG OUT</span>
          </button>
        </div>

        {/* Profile */}
        <div className="holo-card rounded-2xl p-6">
          <h2 className="font-display text-sm text-muted-foreground tracking-wider mb-4">PROFILE</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <p className="font-display text-primary font-bold tracking-wider">{profile?.username || 'Commander'}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        {/* My Characters */}
        <div className="holo-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm text-muted-foreground tracking-wider">MY CHARACTERS ({myChars.length})</h2>
            <Link to="/creation-lab" className="holo-btn px-3 py-1 rounded text-xs">
              <span className="relative z-10">+ CREATE</span>
            </Link>
          </div>
          {myChars.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No characters yet. Visit the Creation Lab to design one!</p>
          ) : (
            <div className="space-y-3">
              {myChars.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <span className="text-2xl">{c.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-xs font-bold tracking-wider" style={{ color: c.color }}>{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.personality}</p>
                  </div>
                  <Link to={`/chat-chamber?character=${c.id}`} className="text-muted-foreground hover:text-primary transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                  <button onClick={() => deleteCharacter(c.id, c.name)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Chats */}
        <div className="holo-card rounded-2xl p-6">
          <h2 className="font-display text-sm text-muted-foreground tracking-wider mb-4">RECENT TRANSMISSIONS</h2>
          {recentChats.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No conversations yet.</p>
          ) : (
            <div className="space-y-3">
              {recentChats.map((chat, i) => {
                const char = chat.characters as any;
                return (
                  <Link key={i} to={`/chat-chamber?character=${chat.character_id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors">
                    <span className="text-2xl">{char?.avatar || '🤖'}</span>
                    <div className="flex-1">
                      <p className="font-display text-xs font-bold tracking-wider" style={{ color: char?.color || '#00f0ff' }}>{char?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(chat.created_at).toLocaleDateString()}</p>
                    </div>
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
