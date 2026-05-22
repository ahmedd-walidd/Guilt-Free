import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colours } from '../constants/colours';
import { Card } from './Card';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.dot} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {action}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  dot: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colours.surfaceAlt,
    borderWidth: 1,
    borderColor: colours.border,
  },
  title: {
    color: colours.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    color: colours.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
