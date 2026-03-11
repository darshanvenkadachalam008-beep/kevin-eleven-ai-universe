
-- Fix permissive INSERT policies
DROP POLICY "System can create events" ON public.character_events;
CREATE POLICY "Auth users can create events" ON public.character_events FOR INSERT TO public WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY "Anyone can create interactions" ON public.character_interactions;
CREATE POLICY "Auth users can create interactions" ON public.character_interactions FOR INSERT TO public WITH CHECK (auth.uid() IS NOT NULL);
