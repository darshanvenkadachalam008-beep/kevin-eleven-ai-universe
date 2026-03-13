-- Storage buckets for profile photos and character avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('user_profiles', 'user_profiles', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('character_avatars', 'character_avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read user profiles" ON storage.objects FOR SELECT USING (bucket_id = 'user_profiles');
CREATE POLICY "Users upload own profile photo" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user_profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own profile photo" ON storage.objects FOR UPDATE USING (bucket_id = 'user_profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own profile photo" ON storage.objects FOR DELETE USING (bucket_id = 'user_profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read character avatars" ON storage.objects FOR SELECT USING (bucket_id = 'character_avatars');
CREATE POLICY "Auth users upload character avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'character_avatars' AND auth.uid() IS NOT NULL);

-- Add profile_photo_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_photo_url text;

-- Galaxy territory war system
CREATE TABLE IF NOT EXISTS public.galaxy_territories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  controller_character_id uuid REFERENCES public.characters(id) ON DELETE SET NULL,
  controller_user_id uuid,
  status text NOT NULL DEFAULT 'neutral',
  defense_level integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.galaxy_territories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view territories" ON public.galaxy_territories FOR SELECT USING (true);
CREATE POLICY "Auth users can manage territories" ON public.galaxy_territories FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Universe events
CREATE TABLE IF NOT EXISTS public.universe_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  affected_territory_id uuid REFERENCES public.galaxy_territories(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE public.universe_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view events" ON public.universe_events FOR SELECT USING (true);
CREATE POLICY "Auth users can create events" ON public.universe_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Triggers for updated_at
CREATE TRIGGER update_galaxy_territories_updated_at BEFORE UPDATE ON public.galaxy_territories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();