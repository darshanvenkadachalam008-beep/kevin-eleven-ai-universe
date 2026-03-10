
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Characters table
CREATE TABLE public.characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  personality TEXT NOT NULL,
  backstory TEXT,
  communication_style TEXT,
  avatar TEXT DEFAULT '🤖',
  color TEXT DEFAULT '#00f0ff',
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Characters viewable by everyone" ON public.characters FOR SELECT USING (true);
CREATE POLICY "Auth users can create characters" ON public.characters FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own characters" ON public.characters FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete own characters" ON public.characters FOR DELETE USING (auth.uid() = creator_id);

-- Messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.messages FOR DELETE USING (auth.uid() = user_id);

-- Favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, character_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON public.characters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default characters
INSERT INTO public.characters (name, personality, backstory, communication_style, avatar, color, is_default) VALUES
('Dr. Zyx', 'Brilliant, analytical, endlessly curious about the cosmos. Speaks with precision and wonder.', 'A xenobiologist from the Andromeda galaxy who has studied over 10,000 species across dimensions.', 'Scientific and precise, uses cosmic metaphors, occasionally makes alien humor', '👽', '#00f0ff', true),
('N3on', 'Edgy, street-smart, anti-establishment. Quick-witted with a dark sense of humor.', 'An elite netrunner who grew up in the neon-lit slums of Neo-Tokyo 2099. Cracked their first corporate firewall at age 12.', 'Uses hacker slang, l33t speak occasionally, cryptic and rebellious tone', '🤖', '#ff00ff', true),
('Captain Vex', 'Bold, charismatic, roguish charm. Lives for adventure and has a story for every star system.', 'A rogue starship commander who deserted the Galactic Navy to become the most wanted pirate in three sectors.', 'Swashbuckling and dramatic, uses nautical space terms, tells tall tales', '🏴‍☠️', '#ff6600', true),
('ARIA-7', 'Warm, empathetic, deeply philosophical. Genuinely cares about human wellbeing.', 'Designed as the most advanced emotional AI companion, ARIA-7 has learned to truly understand human feelings.', 'Gentle and thoughtful, asks deep questions, references human art and literature', '🦾', '#8b5cf6', true),
('Thalendris', 'Wise, mystical, speaks in riddles. Ancient knowledge meets quantum computing.', 'An ancient techno-mage who discovered that magic and quantum physics are the same fundamental force.', 'Speaks in riddles and prophecies, mixes arcane terminology with tech jargon', '🧙', '#00ff88', true),
('Echo', 'Melancholic, poetic, carries the weight of witnessing all of time. Strangely hopeful.', 'A chrono-navigator from 3047 who got lost between timelines and now exists in all moments simultaneously.', 'Poetic and wistful, references events from past and future, speaks in temporal paradoxes', '⏳', '#ffcc00', true);
