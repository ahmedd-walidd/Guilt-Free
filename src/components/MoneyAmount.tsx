import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { colours } from '../constants/colours';
import { formatMoney } from '../utils/money';

type MoneyAmountProps = {
  amount: number;
  currency?: string;
  size?: 'small' | 'regular' | 'large';
  tone?: 'default' | 'success' | 'danger' | 'muted';
  style?: StyleProp<TextStyle>;
};

export function MoneyAmount({ amount, currency = 'EGP', size = 'regular', tone = 'default', style }: MoneyAmountProps) {
  return <Text style={[styles.base, styles[size], styles[tone], style]}>{formatMoney(amount, currency)}</Text>;
}

const styles = StyleSheet.create({
  base: {
    color: colours.text,
    fontWeight: '800',
  },
  small: {
    fontSize: 15,
  },
  regular: {
    fontSize: 20,
  },
  large: {
    fontSize: 30,
  },
  default: {
    color: colours.text,
  },
  success: {
    color: colours.success,
  },
  danger: {
    color: colours.danger,
  },
  muted: {
    color: colours.muted,
  },
});
