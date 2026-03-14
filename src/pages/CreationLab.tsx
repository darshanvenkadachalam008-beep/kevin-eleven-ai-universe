import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Wand2, Save } from 'lucide-react';
import { addXp } from '@/lib/xpSystem';

const avatarOptions = ['👽', '🤖', '🏴‍☠️', '🦾', '🧙', '⏳', '🧛', '🦊', '🐉', '👾', '🎭', '🌌'];
const colorOptions = ['#00f0ff', '#ff00ff', '#ff6600', '#8b5cf6', '#00ff88', '#ffcc00', '#ff3366', '#00ccff'];

const CreationLab = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');
  const [backstory, setBackstory] = useState('');
  const [commStyle, setCommStyle] = useState('');
  const [avatar, setAvatar] = useState('🤖');
  const [color, setColor] = useState('#00f0ff');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-primary animate-pulse font-display">LOADING...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const generatePersonality = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-personality', {
        body: { name, theme: personality || undefined }
      });
      if (error) throw error;
      if (data.personality) setPersonality(data.personality);
      if (data.backstory) setBackstory(data.backstory);
      if (data.communication_style) setCommStyle(data.communication_style);
      toast.success('Personality generated!');
    } catch {
      toast.error('Generation failed. Try again.');
    }
    setGenerating(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !personality.trim()) {
      toast.error('Name and personality are required.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('characters').insert({
      name: name.trim(),
      personality: personality.trim(),
      backstory: backstory.trim() || null,
      communication_style: commStyle.trim() || null,
      avatar,
      color,
      creator_id: user.id,
    });
    setSaving(false);
    if (error) {
      toast.error('Failed to save character.');
    } else {
      toast.success(`${name} has been created!`);
      addXp(user.id, 'create_character');
      navigate('/characters');
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-center text-primary neon-text mb-3 tracking-wider">CREATION LAB</h1>
        <p className="text-center text-muted-foreground mb-10">Design your AI character</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="holo-card rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-xs text-muted-foreground mb-1 font-display tracking-wider">CHARACTER NAME *</label>
              <input
                value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                placeholder="Enter character name"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-muted-foreground font-display tracking-wider">PERSONALITY *</label>
                <button onClick={generatePersonality} disabled={generating} className="holo-btn px-3 py-1 rounded text-xs flex items-center gap-1">
                  <Wand2 className="w-3 h-3 relative z-10" />
                  <span className="relative z-10">{generating ? 'GENERATING...' : 'AI GENERATE'}</span>
                </button>
              </div>
              <textarea
                value={personality} onChange={e => setPersonality(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:border-primary focus:outline-none transition-colors min-h-[80px] resize-none"
                placeholder="Describe the character's personality"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1 font-display tracking-wider">BACKSTORY</label>
              <textarea
                value={backstory} onChange={e => setBackstory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:border-primary focus:outline-none transition-colors min-h-[80px] resize-none"
                placeholder="Origin story and background"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1 font-display tracking-wider">COMMUNICATION STYLE</label>
              <input
                value={commStyle} onChange={e => setCommStyle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                placeholder="How does this character speak?"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1 font-display tracking-wider">AVATAR</label>
              <div className="flex flex-wrap gap-2">
                {avatarOptions.map(a => (
                  <button key={a} onClick={() => setAvatar(a)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${avatar === a ? 'bg-primary/20 border-2 border-primary' : 'bg-muted border border-border hover:border-primary/50'}`}
                  >{a}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1 font-display tracking-wider">COLOR</label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="holo-btn w-full py-3 rounded-lg text-sm font-display tracking-wider flex items-center justify-center gap-2">
              <Save className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{saving ? 'SAVING...' : 'DEPLOY CHARACTER'}</span>
            </button>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-center">
            <div className="holo-card rounded-2xl p-8 w-full max-w-sm text-center animate-float">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-6 mx-auto"
                style={{ background: `linear-gradient(135deg, ${color}20, ${color}05)`, border: `2px solid ${color}40`, boxShadow: `0 0 30px ${color}30` }}
              >
                {avatar}
              </div>
              <h3 className="font-display text-lg font-bold tracking-wider mb-2" style={{ color }}>
                {name || 'CHARACTER NAME'}
              </h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {personality || 'Personality description will appear here...'}
              </p>
              {backstory && <p className="text-xs text-muted-foreground/60 italic mb-2">{backstory.slice(0, 100)}...</p>}
              <div className="holo-btn py-2 px-4 rounded-lg text-xs mt-4" style={{ borderColor: `${color}40`, color }}>
                <span className="relative z-10">ENTER CHAT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreationLab;
