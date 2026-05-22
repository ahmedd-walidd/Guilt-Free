import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colours } from '../src/constants/colours';
import { useAuthStore } from '../src/stores/authStore';

export default function RootLayout() {
  const initialise = useAuthStore((state) => state.initialise);

  useEffect(() => {
    const unsubscribe = initialise();
    return unsubscribe;
  }, [initialise]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colours.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="transactions/new" />
        <Stack.Screen name="goals/new" />
      </Stack>
    </SafeAreaProvider>
  );
}
