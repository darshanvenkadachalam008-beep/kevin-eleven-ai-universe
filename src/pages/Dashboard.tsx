import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, MessageSquare, Trash2, Heart, Shield, Users, Sparkles, Sword, Camera, Star, Edit3, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { getRankForXp, getNextRank } from '@/lib/xpSystem';

const FACTIONS = [
  { id: 'nova_guardians', name: 'Nova Guardians', color: '#00f0ff', icon: '🛡' },
  { id: 'void_raiders', name: 'Void Raiders', color: '#ff3366', icon: '⚔' },
  { id: 'quantum_scholars', name: 'Quantum Scholars', color: '#8b5cf6', icon: '📚' },
];

const relationshipIcons: Record<string, { label: string; icon: typeof Heart; color: string }> = {
  stranger: { label: 'STRANGER', icon: Users, color: '#666' },
  friend: { label: 'FRIEND', icon: Heart, color: '#00f0ff' },
  companion: { label: 'COMPANION', icon: Shield, color: '#8b5cf6' },
  trusted_ally: { label: 'TRUSTED ALLY', icon: Sparkles, color: '#ffcc00' },
};

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [myChars, setMyChars] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [storySessions, setStorySessions] = useState<any[]>([]);
  const [userLevel, setUserLevel] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: '', bio: '', faction: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    supabase.from('profiles').select('*').eq('user_id', user.id).single()
      .then(({ data }) => {
        setProfile(data);
        if (data) setEditForm({ display_name: data.display_name || '', bio: data.bio || '', faction: data.faction || '' });
      });

    supabase.from('user_levels').select('*').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setUserLevel(data));

    supabase.from('characters').select('*').eq('creator_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setMyChars(data || []));

    supabase.from('messages').select('character_id, created_at, characters(name, avatar, color)')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => {
        if (!data) return;
        const seen = new Set<string>();
        setRecentChats(data.filter(m => { if (seen.has(m.character_id)) return false; seen.add(m.character_id); return true; }).slice(0, 5));
      });

    supabase.from('relationships').select('*, characters(name, avatar, color)')
      .eq('user_id', user.id).order('interaction_count', { ascending: false })
      .then(({ data }) => setRelationships(data || []));

    supabase.from('favorites').select('*, characters(name, avatar, color)')
      .eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setFavorites(data || []));

    supabase.from('story_sessions').select('*, characters(name, avatar, color)')
      .eq('user_id', user.id).order('updated_at', { ascending: false }).limit(5)
      .then(({ data }) => setStorySessions(data || []));
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from('user_profiles').upload(path, file, { upsert: true });
    if (uploadError) { toast.error('Upload failed'); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('user_profiles').getPublicUrl(path);
    const photoUrl = urlData.publicUrl + '?t=' + Date.now();
    await supabase.from('profiles').update({ profile_photo_url: photoUrl }).eq('user_id', user.id);
    setProfile((prev: any) => ({ ...prev, profile_photo_url: photoUrl }));
    toast.success('Profile photo updated!');
    setUploading(false);
  };

  const saveProfile = async () => {
    if (!user) return;
    await supabase.from('profiles').update({
      display_name: editForm.display_name || null,
      bio: editForm.bio || null,
      faction: editForm.faction || null,
    }).eq('user_id', user.id);
    setProfile((prev: any) => ({ ...prev, ...editForm }));
    setEditingProfile(false);
    toast.success('Profile updated!');
  };

  const deleteCharacter = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const { error } = await supabase.from('characters').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { setMyChars(prev => prev.filter(c => c.id !== id)); toast.success(`${name} deleted`); }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-primary animate-pulse font-display">LOADING...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const avatarUrl = profile?.profile_photo_url || user.user_metadata?.avatar_url;
  const xp = userLevel?.xp || 0;
  const rankInfo = getRankForXp(xp);
  const nextRank = getNextRank(xp);
  const xpProgress = nextRank ? ((xp - (rankInfo.minXp || 0)) / (nextRank.minXp - (rankInfo.minXp || 0))) * 100 : 100;
  const faction = FACTIONS.find(f => f.id === (profile?.faction || editForm.faction));

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-primary neon-text tracking-wider">COMMAND CENTER</h1>
          <button onClick={signOut} className="holo-btn px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <LogOut className="w-4 h-4 relative z-10" /><span className="relative z-10">LOG OUT</span>
          </button>
        </div>

        {/* Profile + Level Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="holo-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-sm text-muted-foreground tracking-wider">PROFILE</h2>
              <button onClick={() => editingProfile ? saveProfile() : setEditingProfile(true)}
                className="text-muted-foreground hover:text-primary transition-colors">
                {editingProfile ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-2xl overflow-hidden">
                  {avatarUrl ? <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" /> : '👤'}
                </div>
                <button onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-foreground" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
              <div className="flex-1">
                {editingProfile ? (
                  <div className="space-y-2">
                    <input value={editForm.display_name} onChange={e => setEditForm(p => ({ ...p, display_name: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                      placeholder="Display name" />
                    <textarea value={editForm.bio} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded bg-muted border border-border text-foreground text-xs focus:outline-none focus:border-primary resize-none"
                      placeholder="Bio" rows={2} />
                  </div>
                ) : (
                  <>
                    <p className="font-display text-primary font-bold tracking-wider">
                      {profile?.display_name || profile?.username || user.user_metadata?.full_name || 'Commander'}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {profile?.bio && <p className="text-xs text-foreground/60 mt-1">{profile.bio}</p>}
                  </>
                )}
                {uploading && <p className="text-xs text-primary animate-pulse">Uploading...</p>}
              </div>
            </div>

            {/* Faction selector */}
            {editingProfile ? (
              <div className="mt-4">
                <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-2">FACTION</p>
                <div className="flex gap-2">
                  {FACTIONS.map(f => (
                    <button key={f.id} onClick={() => setEditForm(p => ({ ...p, faction: f.id }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display tracking-wider border transition-all ${
                        editForm.faction === f.id ? 'border-primary/50 bg-primary/10' : 'border-border/50 hover:border-primary/30'
                      }`} style={{ color: f.color }}>
                      <span>{f.icon}</span>{f.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : faction && (
              <div className="mt-3 flex items-center gap-2">
                <span>{faction.icon}</span>
                <span className="font-display text-xs tracking-wider" style={{ color: faction.color }}>{faction.name}</span>
              </div>
            )}
          </div>

          {/* Level Card */}
          <div className="holo-card rounded-2xl p-6">
            <h2 className="font-display text-sm text-muted-foreground tracking-wider mb-4">RANK & LEVEL</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full border-2 border-primary/40 flex items-center justify-center bg-primary/5">
                <span className="font-display text-2xl font-bold text-primary">{rankInfo.level}</span>
              </div>
              <div>
                <p className="font-display text-sm font-bold text-primary tracking-wider">{rankInfo.rank.toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">{xp} XP</p>
              </div>
            </div>
            {nextRank && (
              <div>
                <div className="flex justify-between text-[10px] font-display tracking-wider text-muted-foreground mb-1">
                  <span>PROGRESS</span>
                  <span>{nextRank.rank} (Lv.{nextRank.level})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                    style={{ width: `${Math.min(xpProgress, 100)}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{nextRank.minXp - xp} XP to next rank</p>
              </div>
            )}
            {!nextRank && <p className="text-xs text-primary font-display tracking-wider">MAX RANK ACHIEVED 🏆</p>}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/characters', icon: '🪐', label: 'Galaxy' },
            { to: '/story-adventure', icon: '⚔', label: 'Adventure' },
            { to: '/creation-lab', icon: '✨', label: 'Create' },
            { to: '/universe-feed', icon: '📡', label: 'Feed' },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className="holo-card rounded-xl p-4 text-center group hover:scale-105 transition-transform">
              <span className="text-2xl block mb-1">{a.icon}</span>
              <span className="font-display text-xs tracking-wider text-muted-foreground group-hover:text-primary transition-colors">{a.label}</span>
            </Link>
          ))}
        </div>

        {/* Relationships */}
        {relationships.length > 0 && (
          <div className="holo-card rounded-2xl p-6">
            <h2 className="font-display text-sm text-muted-foreground tracking-wider mb-4">RELATIONSHIP BONDS</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {relationships.map(rel => {
                const char = rel.characters as any;
                const info = relationshipIcons[rel.level] || relationshipIcons.stranger;
                return (
                  <Link key={rel.id} to={`/chat-chamber?character=${rel.character_id}`}
                    className="p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors text-center">
                    <span className="text-2xl block mb-1">{char?.avatar || '🤖'}</span>
                    <p className="font-display text-xs font-bold tracking-wider" style={{ color: char?.color || '#00f0ff' }}>{char?.name}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <info.icon className="w-3 h-3" style={{ color: info.color }} />
                      <span className="text-[10px] font-display tracking-wider" style={{ color: info.color }}>{info.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{rel.interaction_count} chats</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="holo-card rounded-2xl p-6">
            <h2 className="font-display text-sm text-muted-foreground tracking-wider mb-4">FAVORITES ❤️</h2>
            <div className="flex flex-wrap gap-3">
              {favorites.map(fav => {
                const char = fav.characters as any;
                return (
                  <Link key={fav.id} to={`/chat-chamber?character=${fav.character_id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors">
                    <span className="text-lg">{char?.avatar || '🤖'}</span>
                    <span className="font-display text-xs font-bold tracking-wider" style={{ color: char?.color || '#00f0ff' }}>{char?.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Story Sessions */}
        {storySessions.length > 0 && (
          <div className="holo-card rounded-2xl p-6">
            <h2 className="font-display text-sm text-muted-foreground tracking-wider mb-4">STORY ADVENTURES</h2>
            <div className="space-y-3">
              {storySessions.map(s => {
                const char = s.characters as any;
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <Sword className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-xs font-bold tracking-wider text-primary">{s.title}</p>
                      <p className="text-[10px] text-muted-foreground">{s.genre} · with {char?.name || 'Unknown'}</p>
                    </div>
                    <span className={`text-[10px] font-display tracking-wider ${s.is_active ? 'text-green-400' : 'text-muted-foreground'}`}>
                      {s.is_active ? 'ACTIVE' : 'COMPLETE'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* My Characters */}
        <div className="holo-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm text-muted-foreground tracking-wider">MY CHARACTERS ({myChars.length})</h2>
            <Link to="/creation-lab" className="holo-btn px-3 py-1 rounded text-xs"><span className="relative z-10">+ CREATE</span></Link>
          </div>
          {myChars.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No characters yet. Visit the Creation Lab!</p>
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
