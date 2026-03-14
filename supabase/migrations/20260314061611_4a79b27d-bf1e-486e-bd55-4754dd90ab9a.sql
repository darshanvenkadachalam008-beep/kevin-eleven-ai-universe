-- User levels table for gamification
CREATE TABLE IF NOT EXISTS public.user_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  level integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  rank text NOT NULL DEFAULT 'Explorer',
  faction text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all levels" ON public.user_levels FOR SELECT USING (true);
CREATE POLICY "Users can insert own level" ON public.user_levels FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own level" ON public.user_levels FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_user_levels_updated_at BEFORE UPDATE ON public.user_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS faction text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text DEFAULT NULL;