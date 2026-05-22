import { Redirect, Tabs } from 'expo-router';
import { BarChart3, ClipboardCheck, ListChecks, PiggyBank } from 'lucide-react-native';

import { LoadingScreen } from '../../src/components/LoadingScreen';
import { colours } from '../../src/constants/colours';
import { useTutorialStatus } from '../../src/hooks/useTutorialStatus';
import { useAuthStore } from '../../src/stores/authStore';

export default function TabsLayout() {
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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colours.primary,
        tabBarInactiveTintColor: colours.muted,
        tabBarStyle: {
          backgroundColor: colours.surface,
          borderTopColor: colours.border,
          height: 72,
          paddingTop: 9,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Spend',
          tabBarIcon: ({ color, size }) => <ListChecks color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, size }) => <PiggyBank color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="afford"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Review',
          tabBarIcon: ({ color, size }) => <ClipboardCheck color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
