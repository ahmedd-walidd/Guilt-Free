import { StyleSheet, Text, View } from 'react-native';

import { colours } from '../constants/colours';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  title: {
    color: colours.text,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: colours.muted,
    fontSize: 15,
    lineHeight: 21,
  },
});
