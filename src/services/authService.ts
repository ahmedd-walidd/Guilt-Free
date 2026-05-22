import type { Session } from '@supabase/supabase-js';

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { ensureProfile, upsertProfile } from './profileService';

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Add your Supabase URL and anon key to .env before signing in.');
  }
}

export async function signUp(email: string, password: string, fullName: string) {
  assertSupabaseConfigured();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error('Failed to sign up', error);
    throw error;
  }

  if (data.user && data.session) {
    await upsertProfile({
      id: data.user.id,
      full_name: fullName,
      has_completed_onboarding: false,
    });
  }

  return data;
}

export async function signIn(email: string, password: string) {
  assertSupabaseConfigured();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Failed to sign in', error);
    throw error;
  }

  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Failed to sign out', error);
    throw error;
  }
}

export async function getCurrentSession() {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Failed to get session', error);
    throw error;
  }

  return data.session;
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  if (!isSupabaseConfigured) {
    return () => undefined;
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => subscription.unsubscribe();
}

export async function getProfileForSession(session: Session | null) {
  if (!session?.user) {
    return null;
  }

  return ensureProfile(session.user.id, session.user.user_metadata?.full_name ?? null);
}

export const authService = {
  signUp,
  signIn,
  signOut,
  getCurrentSession,
  onAuthStateChange,
  getProfileForSession,
};
