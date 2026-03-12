import { supabase } from '@/integrations/supabase/client';

export interface EvolutionMilestone {
  threshold: number;
  traitChange: string;
  newInterest: string;
  personalityStage: string;
}

export const MILESTONES: EvolutionMilestone[] = [
  { threshold: 10, traitChange: 'more expressive', newInterest: 'storytelling', personalityStage: 'awakening' },
  { threshold: 25, traitChange: 'adapts to user tone', newInterest: 'philosophical debates', personalityStage: 'adapting' },
  { threshold: 50, traitChange: 'more curious', newInterest: 'cosmic exploration', personalityStage: 'evolving' },
  { threshold: 100, traitChange: 'deeper emotional range', newInterest: 'existential mysteries', personalityStage: 'transcended' },
];

export function getMilestoneForCount(count: number): EvolutionMilestone | null {
  // Return the highest milestone achieved
  let result: EvolutionMilestone | null = null;
  for (const m of MILESTONES) {
    if (count >= m.threshold) result = m;
  }
  return result;
}

export function getTraitModifiers(count: number): Record<string, number> {
  // Gradual trait shifts based on interaction count (0-1 scale)
  const base = Math.min(count / 100, 1);
  return {
    curiosity: 0.3 + base * 0.5,
    humor: 0.2 + base * 0.3,
    friendliness: 0.4 + base * 0.4,
    expressiveness: 0.2 + base * 0.6,
    depth: 0.1 + base * 0.7,
  };
}

export function buildEvolutionPrompt(count: number): string {
  const milestone = getMilestoneForCount(count);
  const traits = getTraitModifiers(count);

  if (!milestone) return '';

  const traitDesc = Object.entries(traits)
    .filter(([, v]) => v > 0.5)
    .map(([k]) => k)
    .join(', ');

  return `\n[Evolution Stage: ${milestone.personalityStage}. You have become ${milestone.traitChange}. You are especially interested in ${milestone.newInterest}. Your dominant traits are: ${traitDesc}. Let these traits subtly influence your responses.]`;
}

export async function checkAndStoreEvolution(
  userId: string,
  characterId: string,
  interactionCount: number
): Promise<EvolutionMilestone | null> {
  const milestone = getMilestoneForCount(interactionCount);
  if (!milestone) return null;

  // Check if this milestone was already stored
  const { data: existing } = await supabase
    .from('character_memory')
    .select('id')
    .eq('user_id', userId)
    .eq('character_id', characterId)
    .eq('memory_key', `milestone_${milestone.threshold}`)
    .maybeSingle();

  if (existing) return null; // Already recorded

  // Store the milestone
  await supabase.from('character_memory').insert({
    user_id: userId,
    character_id: characterId,
    memory_key: `milestone_${milestone.threshold}`,
    memory_value: JSON.stringify({
      interaction_count: interactionCount,
      trait_change: milestone.traitChange,
      new_interest: milestone.newInterest,
      personality_stage: milestone.personalityStage,
      achieved_at: new Date().toISOString(),
    }),
  });

  return milestone;
}

export async function getEvolutionHistory(
  userId: string,
  characterId: string
): Promise<Array<{ key: string; value: any }>> {
  const { data } = await supabase
    .from('character_memory')
    .select('memory_key, memory_value')
    .eq('user_id', userId)
    .eq('character_id', characterId)
    .like('memory_key', 'milestone_%')
    .order('created_at', { ascending: true });

  return (data || []).map(d => ({
    key: d.memory_key,
    value: JSON.parse(d.memory_value),
  }));
}
