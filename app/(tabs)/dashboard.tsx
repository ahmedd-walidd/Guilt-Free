import { router, useFocusEffect } from 'expo-router';
import { BookOpen, LogOut, RefreshCw, WalletCards } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { InfoTooltip } from '../../src/components/InfoTooltip';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { MoneyAmount } from '../../src/components/MoneyAmount';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { colours } from '../../src/constants/colours';
import { helpText } from '../../src/constants/helpText';
import { getErrorMessage } from '../../src/lib/errors';
import { goalService } from '../../src/services/goalService';
import { transactionService } from '../../src/services/transactionService';
import { useAuthStore } from '../../src/stores/authStore';
import type { Goal, Transaction } from '../../src/types/money';
import { calculateBudgets, calculateMoneyScore, calculateMonthlySummary } from '../../src/utils/calculations';
import { getCurrentMonthRange } from '../../src/utils/dates';

export default function DashboardScreen() {
  const { user, profile, signOut } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const month = useMemo(() => getCurrentMonthRange(), []);

  const loadDashboard = useCallback(
    async (showRefresh = false) => {
      if (!user) {
        return;
      }

      setError(null);
      setRefreshing(showRefresh);
      setLoading(!showRefresh);

      try {
        const [monthTransactions, savedGoals] = await Promise.all([
          transactionService.listTransactionsForRange(user.id, month.startDate, month.endDate),
          goalService.listGoals(user.id),
        ]);
        setTransactions(monthTransactions);
        setGoals(savedGoals);
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'Could not load your dashboard.'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [month.endDate, month.startDate, user],
  );

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

  if (!profile || loading) {
    return <LoadingScreen />;
  }

  const budgets = calculateBudgets(profile);
  const summary = calculateMonthlySummary(transactions);
  const guiltFreeRemaining = Math.max(0, budgets.guiltFree - summary.guiltFreeSpent);
  const moneyScore = calculateMoneyScore(profile, transactions, goals);
  const activeGoalCount = goals.filter((goal) => goal.status === 'active').length;

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadDashboard(true)} />}
    >
      <View style={styles.headerRow}>
        <SectionHeader
          title="Dashboard"
          subtitle={`${month.label} health check${profile.full_name ? ` for ${profile.full_name}` : ''}`}
        />
        <Button
          title="Sign out"
          variant="ghost"
          onPress={() => void signOut()}
          icon={<LogOut color={colours.primaryDark} size={18} />}
          style={styles.headerButton}
        />
      </View>

      {error ? (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Refresh"
            variant="secondary"
            onPress={() => void loadDashboard(true)}
            icon={<RefreshCw color={colours.primaryDark} size={18} />}
          />
        </Card>
      ) : null}

      <Card style={styles.scoreCard}>
        <View style={styles.scoreTop}>
          <View>
            <View style={styles.inlineHelp}>
              <Text style={styles.kicker}>Money score</Text>
              <InfoTooltip title="Money score" body={helpText.moneyScore} />
            </View>
            <Text style={styles.score}>{moneyScore}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>{activeGoalCount} active goal{activeGoalCount === 1 ? '' : 's'}</Text>
          </View>
        </View>
        <Text style={styles.helper}>A practical score based on the plan you set, not investment advice.</Text>
      </Card>

      <Card style={styles.actionCard}>
        <Text style={styles.cardTitle}>Next actions</Text>
        <Text style={styles.helper}>Use these when you need guidance, not as everyday tabs.</Text>

        <View style={styles.actionGrid}>
          <View style={styles.actionItem}>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Can I Afford This?</Text>
              <Text style={styles.actionCopy}>Check a bigger purchase against your current spending system.</Text>
            </View>
            <Button
              title="Check"
              variant="secondary"
              onPress={() => router.push('/(tabs)/afford')}
              icon={<WalletCards color={colours.primaryDark} size={18} />}
            />
          </View>

          <View style={styles.actionItem}>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Rich Life Guide</Text>
              <Text style={styles.actionCopy}>Learn how the app connects to conscious spending principles.</Text>
            </View>
            <Button
              title="Open guide"
              variant="secondary"
              onPress={() => router.push('/(tabs)/guide')}
              icon={<BookOpen color={colours.primaryDark} size={18} />}
            />
          </View>
        </View>
      </Card>

      <View style={styles.grid}>
        <MetricCard title="Monthly income" amount={profile.monthly_income} currency={profile.currency} help={helpText.monthlyIncome} />
        <MetricCard title="Fixed costs budget" amount={budgets.fixedCosts} currency={profile.currency} help={helpText.fixedCosts} />
        <MetricCard title="Investment budget" amount={budgets.investments} currency={profile.currency} help={helpText.investments} />
        <MetricCard title="Savings budget" amount={budgets.savings} currency={profile.currency} help={helpText.savings} />
        <MetricCard title="Guilt-free budget" amount={budgets.guiltFree} currency={profile.currency} help={helpText.guiltFree} />
        <MetricCard title="Buffer budget" amount={budgets.buffer} currency={profile.currency} help={helpText.buffer} />
      </View>

      <Card style={styles.cardStack}>
        <Text style={styles.cardTitle}>This month</Text>
        <MetricRow title="Guilt-free used" amount={summary.guiltFreeSpent} currency={profile.currency} />
        <MetricRow
          title="Guilt-free remaining"
          amount={guiltFreeRemaining}
          currency={profile.currency}
          tone="success"
          help={helpText.guiltFree}
        />
        <MetricRow title="Total saved" amount={summary.saved} currency={profile.currency} />
        <MetricRow title="Total invested" amount={summary.invested} currency={profile.currency} />
        <MetricRow
          title="Waste spending"
          amount={summary.waste}
          currency={profile.currency}
          tone={summary.waste > 0 ? 'danger' : 'default'}
          help={helpText.waste}
        />
      </Card>
    </Screen>
  );
}

function MetricCard({ title, amount, currency, help }: { title: string; amount: number; currency: string; help?: string }) {
  return (
    <Card style={styles.metricCard}>
      <View style={styles.inlineHelp}>
        <Text style={styles.metricTitle}>{title}</Text>
        {help ? <InfoTooltip title={title} body={help} /> : null}
      </View>
      <MoneyAmount amount={amount} currency={currency} size="regular" />
    </Card>
  );
}

function MetricRow({
  title,
  amount,
  currency,
  tone = 'default',
  help,
}: {
  title: string;
  amount: number;
  currency: string;
  tone?: 'default' | 'success' | 'danger';
  help?: string;
}) {
  return (
    <View style={styles.metricRow}>
      <View style={styles.rowTitleWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        {help ? <InfoTooltip title={title} body={help} /> : null}
      </View>
      <MoneyAmount amount={amount} currency={currency} size="small" tone={tone} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerButton: {
    minWidth: 112,
  },
  errorCard: {
    gap: 12,
  },
  errorText: {
    color: colours.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  scoreCard: {
    gap: 12,
    backgroundColor: colours.surfaceAlt,
  },
  scoreTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
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
  scoreBadge: {
    backgroundColor: colours.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colours.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scoreBadgeText: {
    color: colours.text,
    fontSize: 13,
    fontWeight: '800',
  },
  helper: {
    color: colours.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  actionCard: {
    gap: 12,
  },
  actionGrid: {
    gap: 10,
  },
  actionItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colours.border,
    backgroundColor: colours.input,
    padding: 12,
    gap: 10,
  },
  actionText: {
    gap: 4,
  },
  actionTitle: {
    color: colours.text,
    fontSize: 16,
    fontWeight: '900',
  },
  actionCopy: {
    color: colours.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  inlineHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    minHeight: 106,
    justifyContent: 'space-between',
    gap: 10,
  },
  metricTitle: {
    color: colours.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  cardStack: {
    gap: 10,
  },
  cardTitle: {
    color: colours.text,
    fontSize: 18,
    fontWeight: '900',
  },
  metricRow: {
    minHeight: 38,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colours.border,
    paddingTop: 10,
  },
  rowTitle: {
    color: colours.text,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  rowTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
