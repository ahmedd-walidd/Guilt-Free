import { Redirect } from 'expo-router';

import { LoadingScreen } from '../src/components/LoadingScreen';
import { useAuthStore } from '../src/stores/authStore';

export default function IndexRoute() {
  const { isLoading, session, profile } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!profile?.has_completed_onboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/dashboard" />;
}
