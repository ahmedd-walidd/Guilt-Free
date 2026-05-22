import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { InfoTooltip } from '../../src/components/InfoTooltip';
import { Input } from '../../src/components/Input';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { MoneyAmount } from '../../src/components/MoneyAmount';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { colours } from '../../src/constants/colours';
import { helpText } from '../../src/constants/helpText';
import { getErrorMessage } from '../../src/lib/errors';
import { affordService } from '../../src/services/affordService';
import { transactionService } from '../../src/services/transactionService';
import { useAuthStore } from '../../src/stores/authStore';
import type { AffordDecisionResult, Transaction } from '../../src/types/money';
import { calculateAffordDecision } from '../../src/utils/calculations';
import { getCurrentMonthRange } from '../../src/utils/dates';

const affordSchema = z.object({
  itemName: z.string().trim().min(1, 'Enter the item name.'),
  price: z
    .string()
    .trim()
    .min(1, 'Enter a price.')
    .refine((value) => Number.isFinite(Number(value)), 'Enter a valid price.')
    .refine((value) => Number(value) > 0, 'Price must be greater than zero.'),
  reason: z.string().optional(),
});

type AffordForm = z.infer<typeof affordSchema>;

export default function AffordScreen() {
  const { user, profile } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [decisionResult, setDecisionResult] = useState<AffordDecisionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const month = useMemo(() => getCurrentMonthRange(), []);
  const { control, handleSubmit, formState } = useForm<AffordForm>({
    resolver: zodResolver(affordSchema),
    defaultValues: {
      itemName: '',
      price: '',
      reason: '',
    },
  });

  const loadTransactions = useCallback(
    async (showRefresh = false) => {
      if (!user) {
        return;
      }

      setError(null);
      setRefreshing(showRefresh);
      setLoading(!showRefresh);

      try {
        const rows = await transactionService.listTransactionsForRange(user.id, month.startDate, month.endDate);
        setTransactions(rows);
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'Could not load this month’s spending.'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [month.endDate, month.startDate, user],
  );

  useFocusEffect(
    useCallback(() => {
      void loadTransactions();
    }, [loadTransactions]),
  );

  if (!profile || loading) {
    return <LoadingScreen />;
  }

  const onSubmit = async (values: AffordForm) => {
    if (!user) {
      return;
    }

    setError(null);

    try {
      const result = calculateAffordDecision(profile, transactions, Number(values.price));
      await affordService.savePurchaseCheck({
        userId: user.id,
        itemName: values.itemName.trim(),
        price: Number(values.price),
        reason: values.reason?.trim() || null,
        result,
      });
      setDecisionResult(result);
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Could not save this purchase check.'));
    }
  };

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadTransactions(true)} />}>
      <View style={styles.headerWithHelp}>
        <SectionHeader title="Can I afford this?" subtitle={`Decision check for ${month.label}`} />
        <InfoTooltip title="Can I Afford This?" body={helpText.canIAffordThis} />
      </View>

      <Card style={styles.formCard}>
        <Controller
          control={control}
          name="itemName"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Item name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="price"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Price"
              keyboardType="decimal-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="reason"
          render={({ field: { onBlur, onChange, value } }) => (
            <Input label="Reason" multiline onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Check purchase" loading={formState.isSubmitting} onPress={handleSubmit(onSubmit)} />
      </Card>

      <Card style={styles.legendCard}>
        <Text style={styles.noteTitle}>Decision colours</Text>
        <DecisionLegend title="Green" body={helpText.greenDecision} colour={colours.success} />
        <DecisionLegend title="Yellow" body={helpText.yellowDecision} colour={colours.warning} />
        <DecisionLegend title="Red" body={helpText.redDecision} colour={colours.danger} />
      </Card>

      {decisionResult ? (
        <DecisionCard result={decisionResult} currency={profile.currency} />
      ) : (
        <Card style={styles.noteCard}>
          <Text style={styles.noteTitle}>How this works</Text>
          <Text style={styles.noteText}>
            The check uses your profile, current month transactions, guilt-free remaining, buffer, savings target, and
            investment target. It does not recommend assets or investment products.
          </Text>
          <View style={styles.inlineHelp}>
            <InfoTooltip title="Buffer" body={helpText.buffer} />
            <InfoTooltip title="Spending system" body={helpText.spendingSystem} />
          </View>
        </Card>
      )}
    </Screen>
  );
}

function DecisionCard({ result, currency }: { result: AffordDecisionResult; currency: string }) {
  const tone =
    result.decision === 'green'
      ? { backgroundColor: colours.successSoft, borderColor: colours.success, titleColor: colours.success }
      : result.decision === 'yellow'
        ? { backgroundColor: colours.warningSoft, borderColor: colours.warning, titleColor: colours.warning }
        : { backgroundColor: colours.dangerSoft, borderColor: colours.danger, titleColor: colours.danger };

  return (
    <Card style={[styles.decisionCard, { backgroundColor: tone.backgroundColor, borderColor: tone.borderColor }]}>
      <Text style={[styles.decisionTitle, { color: tone.titleColor }]}>{result.title}</Text>
      <Text style={styles.decisionMessage}>{result.message}</Text>

      <View style={styles.resultGrid}>
        <ResultMetric title="Guilt-free remaining" amount={result.guiltFreeRemaining} currency={currency} />
        <ResultMetric title="Buffer budget" amount={result.bufferBudget} currency={currency} help={helpText.buffer} />
        <ResultMetric title="Savings shortfall" amount={result.savingsShortfall} currency={currency} />
        <ResultMetric title="Investment shortfall" amount={result.investmentShortfall} currency={currency} />
      </View>
    </Card>
  );
}

function DecisionLegend({ title, body, colour }: { title: string; body: string; colour: string }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: colour }]} />
      <Text style={styles.legendTitle}>{title}</Text>
      <InfoTooltip title={`${title} decision`} body={body} />
    </View>
  );
}

function ResultMetric({ title, amount, currency, help }: { title: string; amount: number; currency: string; help?: string }) {
  return (
    <View style={styles.resultMetric}>
      <View style={styles.resultTitleRow}>
        <Text style={styles.resultTitle}>{title}</Text>
        {help ? <InfoTooltip title={title} body={help} /> : null}
      </View>
      <MoneyAmount amount={amount} currency={currency} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  headerWithHelp: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  formCard: {
    gap: 14,
  },
  error: {
    color: colours.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  noteCard: {
    gap: 8,
  },
  legendCard: {
    gap: 10,
  },
  legendRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendTitle: {
    flex: 1,
    color: colours.text,
    fontSize: 15,
    fontWeight: '800',
  },
  noteTitle: {
    color: colours.text,
    fontSize: 17,
    fontWeight: '900',
  },
  noteText: {
    color: colours.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  inlineHelp: {
    flexDirection: 'row',
    gap: 8,
  },
  decisionCard: {
    gap: 12,
  },
  decisionTitle: {
    fontSize: 28,
    fontWeight: '900',
  },
  decisionMessage: {
    color: colours.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  resultMetric: {
    width: '48%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colours.border,
    backgroundColor: colours.surface,
    padding: 12,
    gap: 8,
  },
  resultTitle: {
    color: colours.muted,
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  resultTitleRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
