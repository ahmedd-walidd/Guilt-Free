import { Redirect, Tabs } from 'expo-router';
import { BarChart3, BookOpen, ClipboardCheck, ListChecks, PiggyBank, WalletCards } from 'lucide-react-native';

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
          height: 66,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
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
          title: 'Afford',
          tabBarIcon: ({ color, size }) => <WalletCards color={color} size={size} />,
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
          title: 'Guide',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
