import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { getErrorMessage } from '../lib/errors';
import { authService } from '../services/authService';
import { ensureProfile, getProfile } from '../services/profileService';
import type { Profile } from '../types/money';

type AuthStore = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialised: boolean;
  error: string | null;
  initialise: () => () => void;
  loadSession: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  setProfile: (profile: Profile | null) => void;
  signIn: (email: string, password: string) => Promise<Session | null>;
  signUp: (email: string, password: string, fullName: string) => Promise<Session | null>;
  signOut: () => Promise<void>;
};

async function resolveProfile(session: Session | null) {
  if (!session?.user) {
    return null;
  }

  const fullName = session.user.user_metadata?.full_name;
  return ensureProfile(session.user.id, typeof fullName === 'string' ? fullName : null);
}

export const useAuthStore = create<AuthStore>((set, get) => {
  const applySession = async (session: Session | null) => {
    if (!session?.user) {
      set({ session: null, user: null, profile: null, isLoading: false, error: null });
      return;
    }

    try {
      const profile = await resolveProfile(session);
      set({ session, user: session.user, profile, isLoading: false, error: null });
    } catch (error) {
      set({
        session,
        user: session.user,
        profile: null,
        isLoading: false,
        error: getErrorMessage(error, 'Could not load your profile.'),
      });
    }
  };

  return {
    session: null,
    user: null,
    profile: null,
    isLoading: true,
    isInitialised: false,
    error: null,
    initialise: () => {
      if (get().isInitialised) {
        return () => undefined;
      }

      set({ isInitialised: true, isLoading: true });

      authService
        .getCurrentSession()
        .then(applySession)
        .catch((error) => {
          set({
            session: null,
            user: null,
            profile: null,
            isLoading: false,
            error: getErrorMessage(error, 'Could not restore your session.'),
          });
        });

      return authService.onAuthStateChange((session) => {
        void applySession(session);
      });
    },
    loadSession: async () => {
      set({ isLoading: true, error: null });
      const session = await authService.getCurrentSession();
      await applySession(session);
    },
    refreshProfile: async () => {
      const user = get().user;

      if (!user) {
        set({ profile: null });
        return null;
      }

      const profile = (await getProfile(user.id)) ?? (await ensureProfile(user.id, user.user_metadata?.full_name ?? null));
      set({ profile });
      return profile;
    },
    setProfile: (profile) => set({ profile }),
    signIn: async (email, password) => {
      set({ isLoading: true, error: null });
      const data = await authService.signIn(email, password);
      await applySession(data.session);
      return data.session;
    },
    signUp: async (email, password, fullName) => {
      set({ isLoading: true, error: null });
      const data = await authService.signUp(email, password, fullName);
      await applySession(data.session);
      return data.session;
    },
    signOut: async () => {
      set({ isLoading: true, error: null });
      await authService.signOut();
      set({ session: null, user: null, profile: null, isLoading: false, error: null });
    },
  };
});
