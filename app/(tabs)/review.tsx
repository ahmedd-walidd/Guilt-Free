import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect } from 'expo-router';
import { Save } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { MoneyAmount } from '../../src/components/MoneyAmount';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { Input } from '../../src/components/Input';
import { colours } from '../../src/constants/colours';
import { getErrorMessage } from '../../src/lib/errors';
import { goalService } from '../../src/services/goalService';
import { reviewService } from '../../src/services/reviewService';
import { transactionService } from '../../src/services/transactionService';
import { useAuthStore } from '../../src/stores/authStore';
import type { Goal, MonthlyReview, Transaction } from '../../src/types/money';
import { calculateMoneyScore, calculateMonthlySummary } from '../../src/utils/calculations';
import { getCurrentMonthRange } from '../../src/utils/dates';

const reviewSchema = z.object({
  what_went_well: z.string().optional(),
  wasteful_spending_notes: z.string().optional(),
  next_month_focus: z.string().optional(),
});

type ReviewForm = z.infer<typeof reviewSchema>;

export default function MonthlyReviewScreen() {
  const { user, profile } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [review, setReview] = useState<MonthlyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const month = useMemo(() => getCurrentMonthRange(), []);
  const { control, handleSubmit, formState, reset } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      what_went_well: '',
      wasteful_spending_notes: '',
      next_month_focus: '',
    },
  });

  const loadReview = useCallback(
    async (showRefresh = false) => {
      if (!user) {
        return;
      }

      setError(null);
      setNotice(null);
      setRefreshing(showRefresh);
      setLoading(!showRefresh);

      try {
        const [monthTransactions, savedGoals, savedReview] = await Promise.all([
          transactionService.listTransactionsForRange(user.id, month.startDate, month.endDate),
          goalService.listGoals(user.id),
          reviewService.getMonthlyReview(user.id, month.monthKey),
        ]);
        setTransactions(monthTransactions);
        setGoals(savedGoals);
        setReview(savedReview);
        reset({
          what_went_well: savedReview?.what_went_well ?? '',
          wasteful_spending_notes: savedReview?.wasteful_spending_notes ?? '',
          next_month_focus: savedReview?.next_month_focus ?? '',
        });
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'Could not load the monthly review.'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [month.endDate, month.monthKey, month.startDate, reset, user],
  );

  useFocusEffect(
    useCallback(() => {
      void loadReview();
    }, [loadReview]),
  );

  if (!profile || loading) {
    return <LoadingScreen />;
  }

  const summary = calculateMonthlySummary(transactions);
  const score = calculateMoneyScore(profile, transactions, goals);

  const onSubmit = async (values: ReviewForm) => {
    if (!user) {
      return;
    }

    setError(null);
    setNotice(null);

    try {
      const savedReview = await reviewService.saveMonthlyReview({
        user_id: user.id,
        month: month.monthKey,
        what_went_well: values.what_went_well?.trim() || null,
        wasteful_spending_notes: values.wasteful_spending_notes?.trim() || null,
        next_month_focus: values.next_month_focus?.trim() || null,
        score,
      });
      setReview(savedReview);
      setNotice('Review saved.');
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Could not save the monthly review.'));
    }
  };

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadReview(true)} />}>
      <SectionHeader
        title="Monthly review"
        subtitle={`${month.label}${review ? ' review ready to edit' : ' review not saved yet'}`}
      />

      <Card style={styles.scoreCard}>
        <Text style={styles.kicker}>Current month score</Text>
        <Text style={styles.score}>{score}</Text>
      </Card>

      <Card style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Summary</Text>
        <SummaryRow title="Income" amount={profile.monthly_income} currency={profile.currency} />
        <SummaryRow title="Fixed costs spent" amount={summary.fixedCosts} currency={profile.currency} />
        <SummaryRow title="Invested" amount={summary.invested} currency={profile.currency} />
        <SummaryRow title="Saved" amount={summary.saved} currency={profile.currency} />
        <SummaryRow title="Guilt-free spent" amount={summary.guiltFreeSpent} currency={profile.currency} />
        <SummaryRow title="Waste spent" amount={summary.waste} currency={profile.currency} />
      </Card>

      <Card style={styles.formCard}>
        <Controller
          control={control}
          name="what_went_well"
          render={({ field: { onBlur, onChange, value } }) => (
            <Input label="What went well" multiline onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
        />

        <Controller
          control={control}
          name="wasteful_spending_notes"
          render={({ field: { onBlur, onChange, value } }) => (
            <Input label="Wasteful spending notes" multiline onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
        />

        <Controller
          control={control}
          name="next_month_focus"
          render={({ field: { onBlur, onChange, value } }) => (
            <Input label="Next month focus" multiline onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <Button
          title="Save review"
          loading={formState.isSubmitting}
          onPress={handleSubmit(onSubmit)}
          icon={<Save color="#fff" size={18} />}
        />
      </Card>
    </Screen>
  );
}

function SummaryRow({ title, amount, currency }: { title: string; amount: number; currency: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryTitle}>{title}</Text>
      <MoneyAmount amount={amount} currency={currency} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  scoreCard: {
    backgroundColor: colours.surfaceAlt,
    gap: 4,
  },
  kicker: {
    color: colours.muted,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  score: {
    color: colours.primaryDark,
    fontSize: 54,
    fontWeight: '900',
    lineHeight: 60,
  },
  summaryCard: {
    gap: 10,
  },
  cardTitle: {
    color: colours.text,
    fontSize: 18,
    fontWeight: '900',
  },
  summaryRow: {
    minHeight: 38,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colours.border,
    paddingTop: 10,
  },
  summaryTitle: {
    color: colours.text,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  formCard: {
    gap: 14,
  },
  error: {
    color: colours.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  notice: {
    color: colours.primaryDark,
    fontSize: 14,
    fontWeight: '800',
  },
});
