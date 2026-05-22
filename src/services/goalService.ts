import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { Goal, GoalPriority, GoalStatus } from '../types/money';
import { toNumber } from '../utils/money';

type GoalRow = Database['public']['Tables']['goals']['Row'];
type GoalUpdate = Database['public']['Tables']['goals']['Update'];

export type CreateGoalInput = {
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  target_date?: string | null;
  priority: GoalPriority;
};

function normaliseGoal(row: GoalRow): Goal {
  return {
    ...row,
    target_amount: toNumber(row.target_amount),
    current_amount: toNumber(row.current_amount),
    monthly_contribution: toNumber(row.monthly_contribution),
    priority: row.priority as GoalPriority,
    status: row.status as GoalStatus,
  };
}

export async function listGoals(userId: string) {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load goals', error);
    throw error;
  }

  return (data ?? []).map(normaliseGoal);
}

export async function createGoal(payload: CreateGoalInput) {
  const { data, error } = await supabase.from('goals').insert(payload).select('*').single();

  if (error) {
    console.error('Failed to create goal', error);
    throw error;
  }

  return normaliseGoal(data);
}

export async function updateGoal(goalId: string, payload: GoalUpdate) {
  const { data, error } = await supabase.from('goals').update(payload).eq('id', goalId).select('*').single();

  if (error) {
    console.error('Failed to update goal', error);
    throw error;
  }

  return normaliseGoal(data);
}

export async function deleteGoal(goalId: string) {
  const { error } = await supabase.from('goals').delete().eq('id', goalId);

  if (error) {
    console.error('Failed to delete goal', error);
    throw error;
  }
}

export const goalService = {
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};
