import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { Profile } from '../types/money';
import { toNumber } from '../utils/money';

type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

function normaliseProfile(row: ProfileRow): Profile {
  return {
    ...row,
    monthly_income: toNumber(row.monthly_income),
    fixed_costs_percentage: toNumber(row.fixed_costs_percentage),
    investments_percentage: toNumber(row.investments_percentage),
    savings_percentage: toNumber(row.savings_percentage),
    guilt_free_percentage: toNumber(row.guilt_free_percentage),
    buffer_percentage: toNumber(row.buffer_percentage),
  };
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

  if (error) {
    console.error('Failed to load profile', error);
    throw error;
  }

  return data ? normaliseProfile(data) : null;
}

export async function upsertProfile(payload: ProfileInsert) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    console.error('Failed to upsert profile', error);
    throw error;
  }

  return normaliseProfile(data);
}

export async function updateProfile(userId: string, payload: ProfileUpdate) {
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    console.error('Failed to update profile', error);
    throw error;
  }

  return normaliseProfile(data);
}

export async function ensureProfile(userId: string, fullName?: string | null) {
  const existingProfile = await getProfile(userId);

  if (existingProfile) {
    return existingProfile;
  }

  return upsertProfile({
    id: userId,
    full_name: fullName ?? null,
    currency: 'EGP',
    monthly_income: 0,
    fixed_costs_percentage: 50,
    investments_percentage: 10,
    savings_percentage: 15,
    guilt_free_percentage: 20,
    buffer_percentage: 5,
    has_completed_onboarding: false,
  });
}

export const profileService = {
  getProfile,
  upsertProfile,
  updateProfile,
  ensureProfile,
};
