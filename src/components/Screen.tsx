import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, type ScrollViewProps, type StyleProp, type ViewStyle, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colours } from '../constants/colours';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  refreshControl?: ScrollViewProps['refreshControl'];
};

export function Screen({ children, scroll = true, contentStyle, style, refreshControl }: ScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView style={[styles.safeArea, style]}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colours.background,
  },
  content: {
    padding: 18,
    gap: 16,
  },
});
