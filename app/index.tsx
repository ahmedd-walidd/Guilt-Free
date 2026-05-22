import { Redirect } from 'expo-router';

import { LoadingScreen } from '../src/components/LoadingScreen';
import { useTutorialStatus } from '../src/hooks/useTutorialStatus';
import { useAuthStore } from '../src/stores/authStore';

export default function IndexRoute() {
  const { isLoading, session, profile } = useAuthStore();
  const hasCompletedTutorial = useTutorialStatus();

  if (isLoading || hasCompletedTutorial === null) {
    return <LoadingScreen />;
  }

  if (!hasCompletedTutorial) {
    return <Redirect href="/tutorial" />;
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!profile?.has_completed_onboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/dashboard" />;
}
