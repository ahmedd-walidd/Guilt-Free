import {
  StyleSheet,
  Text,
  TextInput,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
  View,
} from 'react-native';

import { colours } from '../constants/colours';

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Input({ label, error, containerStyle, multiline, style, ...props }: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colours.muted}
        multiline={multiline}
        style={[styles.input, multiline ? styles.multiline : null, error ? styles.errorBorder : null, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 7,
  },
  label: {
    color: colours.text,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colours.border,
    backgroundColor: colours.input,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: colours.text,
    fontSize: 16,
  },
  multiline: {
    minHeight: 108,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  errorBorder: {
    borderColor: colours.danger,
  },
  error: {
    color: colours.danger,
    fontSize: 13,
    lineHeight: 18,
  },
});
