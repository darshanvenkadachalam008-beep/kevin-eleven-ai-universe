import { supabase } from '@/integrations/supabase/client';

const RANKS = [
  { minXp: 0, rank: 'Explorer', level: 1 },
  { minXp: 100, rank: 'Explorer', level: 2 },
  { minXp: 250, rank: 'Commander', level: 3 },
  { minXp: 500, rank: 'Commander', level: 4 },
  { minXp: 1000, rank: 'Galactic Hero', level: 5 },
  { minXp: 2000, rank: 'Galactic Hero', level: 6 },
  { minXp: 5000, rank: 'Universe Architect', level: 7 },
];

export function getRankForXp(xp: number) {
  let result = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXp) result = r;
  }
  return result;
}

export function getNextRank(xp: number) {
  for (const r of RANKS) {
    if (xp < r.minXp) return r;
  }
  return null;
}

export const XP_REWARDS = {
  chat_message: 5,
  story_start: 15,
  story_choice: 10,
  create_character: 50,
  rate_character: 5,
  favorite: 3,
};

export async function addXp(userId: string, action: keyof typeof XP_REWARDS) {
  const reward = XP_REWARDS[action];
  
  const { data: existing } = await supabase
    .from('user_levels')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  const currentXp = existing?.xp || 0;
  const newXp = currentXp + reward;
  const { rank, level } = getRankForXp(newXp);

  if (existing) {
    await supabase.from('user_levels').update({ xp: newXp, rank, level }).eq('user_id', existing.id);
  } else {
    await supabase.from('user_levels').insert({ user_id: userId, xp: newXp, rank, level });
  }

  return { xp: newXp, rank, level, gained: reward };
}
