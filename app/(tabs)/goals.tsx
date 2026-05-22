import { router, useFocusEffect } from 'expo-router';
import { Pause, Play, Plus, RefreshCw, Trash2 } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { Input } from '../../src/components/Input';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { MoneyAmount } from '../../src/components/MoneyAmount';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { colours } from '../../src/constants/colours';
import { getErrorMessage } from '../../src/lib/errors';
import { goalService } from '../../src/services/goalService';
import { useAuthStore } from '../../src/stores/authStore';
import type { Goal, GoalStatus } from '../../src/types/money';
import { formatMoney } from '../../src/utils/money';

export default function GoalsScreen() {
  const { user, profile } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [draftAmounts, setDraftAmounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGoals = useCallback(
    async (showRefresh = false) => {
      if (!user) {
        return;
      }

      setError(null);
      setRefreshing(showRefresh);
      setLoading(!showRefresh);

      try {
        const rows = await goalService.listGoals(user.id);
        setGoals(rows);
        setDraftAmounts(Object.fromEntries(rows.map((goal) => [goal.id, String(goal.current_amount)])));
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'Could not load goals.'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      void loadGoals();
    }, [loadGoals]),
  );

  const replaceGoal = (updatedGoal: Goal) => {
    setGoals((current) => current.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal)));
  };

  const updateCurrentAmount = async (goal: Goal) => {
    const amount = Number(draftAmounts[goal.id] ?? goal.current_amount);

    if (!Number.isFinite(amount) || amount < 0) {
      setError('Use zero or a positive number for current amount.');
      return;
    }

    try {
      const updatedGoal = await goalService.updateGoal(goal.id, {
        current_amount: amount,
        status: amount >= goal.target_amount ? 'completed' : goal.status,
      });
      replaceGoal(updatedGoal);
    } catch (updateError) {
      setError(getErrorMessage(updateError, 'Could not update the goal.'));
    }
  };

  const updateStatus = async (goal: Goal, status: GoalStatus) => {
    try {
      const updatedGoal = await goalService.updateGoal(goal.id, { status });
      replaceGoal(updatedGoal);
    } catch (updateError) {
      setError(getErrorMessage(updateError, 'Could not update the goal status.'));
    }
  };

  const deleteGoal = (goal: Goal) => {
    Alert.alert('Delete goal', `Delete "${goal.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await goalService.deleteGoal(goal.id);
            setGoals((current) => current.filter((item) => item.id !== goal.id));
          } catch (deleteError) {
            setError(getErrorMessage(deleteError, 'Could not delete the goal.'));
          }
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadGoals(true)} />}>
      <View style={styles.headerRow}>
        <SectionHeader title="Goals" subtitle="Track the saving goals you defined for yourself." />
        <Button
          title="Add"
          onPress={() => router.push('/goals/new')}
          icon={<Plus color="#fff" size={18} />}
          style={styles.addButton}
        />
      </View>

      {error ? (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Refresh"
            variant="secondary"
            onPress={() => void loadGoals(true)}
            icon={<RefreshCw color={colours.primaryDark} size={18} />}
          />
        </Card>
      ) : null}

      {goals.length === 0 ? (
        <EmptyState
          title="No goals yet"
          description="Create a goal with a target amount and a monthly contribution."
          action={<Button title="Add goal" onPress={() => router.push('/goals/new')} />}
        />
      ) : (
        goals.map((goal) => {
          const progress = goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0;
          const remaining = Math.max(0, goal.target_amount - goal.current_amount);
          const monthsRemaining =
            goal.monthly_contribution > 0 ? Math.ceil(remaining / goal.monthly_contribution) : null;

          return (
            <Card key={goal.id} style={styles.goalCard}>
              <View style={styles.goalTop}>
                <View style={styles.goalTitleBlock}>
                  <Text style={styles.goalName}>{goal.name}</Text>
                  <Text style={styles.goalMeta}>
                    {goal.priority} priority · {goal.status}
                  </Text>
                </View>
                <Pressable accessibilityRole="button" onPress={() => deleteGoal(goal)} style={styles.deleteButton}>
                  <Trash2 color={colours.danger} size={18} />
                </Pressable>
              </View>

              <View style={styles.progressShell}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <View style={styles.goalMoneyRow}>
                <MoneyAmount amount={goal.current_amount} currency={profile?.currency ?? 'EGP'} size="small" />
                <Text style={styles.goalTarget}>of {formatTarget(goal.target_amount, profile?.currency ?? 'EGP')}</Text>
              </View>
              <Text style={styles.goalEstimate}>
                {monthsRemaining === null
                  ? 'No monthly contribution set'
                  : monthsRemaining === 0
                    ? 'Target reached'
                    : `${monthsRemaining} month${monthsRemaining === 1 ? '' : 's'} remaining`}
              </Text>

              <View style={styles.updateRow}>
                <Input
                  label="Current amount"
                  keyboardType="decimal-pad"
                  value={draftAmounts[goal.id] ?? String(goal.current_amount)}
                  onChangeText={(value) => setDraftAmounts((current) => ({ ...current, [goal.id]: value }))}
                  containerStyle={styles.amountInput}
                />
                <Button title="Update" variant="secondary" onPress={() => void updateCurrentAmount(goal)} />
              </View>

              <View style={styles.actionRow}>
                {goal.status === 'paused' ? (
                  <Button
                    title="Resume"
                    variant="secondary"
                    onPress={() => void updateStatus(goal, 'active')}
                    icon={<Play color={colours.primaryDark} size={16} />}
                    style={styles.statusButton}
                  />
                ) : (
                  <Button
                    title="Pause"
                    variant="secondary"
                    onPress={() => void updateStatus(goal, 'paused')}
                    icon={<Pause color={colours.primaryDark} size={16} />}
                    style={styles.statusButton}
                  />
                )}
                <Button
                  title="Complete"
                  variant="success"
                  onPress={() => void updateStatus(goal, 'completed')}
                  style={styles.statusButton}
                />
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
}

function formatTarget(amount: number, currency: string) {
  return formatMoney(amount, currency);
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  addButton: {
    minWidth: 92,
  },
  errorCard: {
    gap: 12,
  },
  errorText: {
    color: colours.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  goalCard: {
    gap: 14,
  },
  goalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  goalTitleBlock: {
    flex: 1,
    gap: 4,
  },
  goalName: {
    color: colours.text,
    fontSize: 18,
    fontWeight: '900',
  },
  goalMeta: {
    color: colours.muted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.dangerSoft,
  },
  progressShell: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colours.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colours.primary,
  },
  goalMoneyRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  goalTarget: {
    color: colours.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  goalEstimate: {
    color: colours.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  amountInput: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusButton: {
    flex: 1,
  },
});
