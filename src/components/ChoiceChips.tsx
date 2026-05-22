import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { colours } from '../constants/colours';

type ChoiceOption<T extends string> = {
  label: string;
  value: T;
};

type ChoiceChipsProps<T extends string> = {
  label?: string;
  labelAccessory?: ReactNode;
  options: ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
  error?: string;
};

export function ChoiceChips<T extends string>({
  label,
  labelAccessory,
  options,
  value,
  onChange,
  error,
}: ChoiceChipsProps<T>) {
  return (
    <View style={styles.container}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {labelAccessory}
        </View>
      ) : null}
      <View style={styles.options}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              accessibilityRole="button"
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.option, selected ? styles.selected : null]}
            >
              <Text style={[styles.optionText, selected ? styles.selectedText : null]} numberOfLines={2}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: colours.text,
    fontSize: 14,
    fontWeight: '700',
  },
  labelRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colours.border,
    backgroundColor: colours.surface,
    paddingHorizontal: 13,
    paddingVertical: 9,
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colours.primary,
    borderColor: colours.primary,
  },
  optionText: {
    color: colours.text,
    fontSize: 14,
    fontWeight: '700',
  },
  selectedText: {
    color: '#fff',
  },
  error: {
    color: colours.danger,
    fontSize: 13,
  },
});
