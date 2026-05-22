import { Redirect, Stack } from 'expo-router';

import { LoadingScreen } from '../../src/components/LoadingScreen';
import { useAuthStore } from '../../src/stores/authStore';

export default function AuthLayout() {
  const { isLoading, session, profile } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (session && profile?.has_completed_onboarding) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  if (session) {
    return <Redirect href="/onboarding" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
