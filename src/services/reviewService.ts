import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { MonthlyReview } from '../types/money';
import { toNumber } from '../utils/money';

type MonthlyReviewRow = Database['public']['Tables']['monthly_reviews']['Row'];

export type SaveMonthlyReviewInput = {
  user_id: string;
  month: string;
  what_went_well?: string | null;
  wasteful_spending_notes?: string | null;
  next_month_focus?: string | null;
  score: number;
};

function normaliseReview(row: MonthlyReviewRow): MonthlyReview {
  return {
    ...row,
    score: toNumber(row.score),
  };
}

export async function getMonthlyReview(userId: string, month: string) {
  const { data, error } = await supabase
    .from('monthly_reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle();

  if (error) {
    console.error('Failed to load monthly review', error);
    throw error;
  }

  return data ? normaliseReview(data) : null;
}

export async function saveMonthlyReview(payload: SaveMonthlyReviewInput) {
  const { data, error } = await supabase
    .from('monthly_reviews')
    .upsert(payload, { onConflict: 'user_id,month' })
    .select('*')
    .single();

  if (error) {
    console.error('Failed to save monthly review', error);
    throw error;
  }

  return normaliseReview(data);
}

export const reviewService = {
  getMonthlyReview,
  saveMonthlyReview,
};
