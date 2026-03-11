
-- Ratings table
CREATE TABLE public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, character_id)
);
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all ratings" ON public.ratings FOR SELECT TO public USING (true);
CREATE POLICY "Users can rate" ON public.ratings FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rating" ON public.ratings FOR UPDATE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rating" ON public.ratings FOR DELETE TO public USING (auth.uid() = user_id);

-- Character memory table
CREATE TABLE public.character_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  memory_key text NOT NULL,
  memory_value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.character_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own memories" ON public.character_memory FOR ALL TO public USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Relationships table
CREATE TABLE public.relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  level text NOT NULL DEFAULT 'stranger' CHECK (level IN ('stranger', 'friend', 'companion', 'trusted_ally')),
  interaction_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, character_id)
);
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own relationships" ON public.relationships FOR ALL TO public USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Story sessions table
CREATE TABLE public.story_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  title text NOT NULL,
  genre text NOT NULL DEFAULT 'adventure',
  story_state jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.story_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own stories" ON public.story_sessions FOR ALL TO public USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Character events for universe feed
CREATE TABLE public.character_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.character_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view events" ON public.character_events FOR SELECT TO public USING (true);
CREATE POLICY "System can create events" ON public.character_events FOR INSERT TO public WITH CHECK (true);

-- Character interactions (simulated AI-to-AI)
CREATE TABLE public.character_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_a_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  character_b_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  interaction_type text NOT NULL DEFAULT 'conversation',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.character_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view interactions" ON public.character_interactions FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can create interactions" ON public.character_interactions FOR INSERT TO public WITH CHECK (true);
