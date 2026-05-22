import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colours } from '../constants/colours';

type LoadingScreenProps = {
  message?: string;
};

export function LoadingScreen({ message = 'Loading your money plan...' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colours.primary} size="large" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colours.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  message: {
    color: colours.muted,
    fontSize: 15,
    textAlign: 'center',
  },
});
