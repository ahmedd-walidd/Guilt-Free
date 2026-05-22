import { router, useFocusEffect } from 'expo-router';
import { Plus, RefreshCw, Trash2 } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ChoiceChips } from '../../src/components/ChoiceChips';
import { EmptyState } from '../../src/components/EmptyState';
import { InfoTooltip } from '../../src/components/InfoTooltip';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { MoneyAmount } from '../../src/components/MoneyAmount';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { colours } from '../../src/constants/colours';
import { helpText } from '../../src/constants/helpText';
import { transactionTypeOptions } from '../../src/constants/categories';
import { getErrorMessage } from '../../src/lib/errors';
import { transactionService } from '../../src/services/transactionService';
import { useAuthStore } from '../../src/stores/authStore';
import type { Transaction, TransactionType } from '../../src/types/money';
import { formatDisplayDate, getCurrentMonthRange } from '../../src/utils/dates';

type TransactionFilter = 'all' | TransactionType;

const filterOptions: { label: string; value: TransactionFilter }[] = [
  { label: 'All', value: 'all' },
  ...transactionTypeOptions,
];

export default function TransactionsScreen() {
  const { user, profile } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const month = useMemo(() => getCurrentMonthRange(), []);

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
        setError(getErrorMessage(loadError, 'Could not load transactions.'));
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

  const visibleTransactions = transactions.filter((transaction) =>
    filter === 'all' ? true : transaction.transaction_type === filter,
  );

  const handleDelete = (transaction: Transaction) => {
    Alert.alert('Delete transaction', `Delete "${transaction.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await transactionService.deleteTransaction(transaction.id);
            setTransactions((current) => current.filter((item) => item.id !== transaction.id));
          } catch (deleteError) {
            setError(getErrorMessage(deleteError, 'Could not delete the transaction.'));
          }
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadTransactions(true)} />}>
      <View style={styles.headerRow}>
        <SectionHeader title="Transactions" subtitle={`${month.label} spending and allocations`} />
        <InfoTooltip title="Transaction types" body={helpText.transactionTypes} />
        <Button
          title="Add"
          onPress={() => router.push('/transactions/new')}
          icon={<Plus color="#fff" size={18} />}
          style={styles.addButton}
        />
      </View>

      <ChoiceChips options={filterOptions} value={filter} onChange={setFilter} />

      <Card style={styles.guideCard}>
        <HelpRow title="Guilt-free spending" body={helpText.guiltFree} />
        <HelpRow title="Waste spending" body={helpText.waste} />
      </Card>

      {error ? (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Refresh"
            variant="secondary"
            onPress={() => void loadTransactions(true)}
            icon={<RefreshCw color={colours.primaryDark} size={18} />}
          />
        </Card>
      ) : null}

      {visibleTransactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          description="Add this month’s income, fixed costs, savings, investments, guilt-free spending, or waste."
          action={<Button title="Add transaction" onPress={() => router.push('/transactions/new')} />}
        />
      ) : (
        visibleTransactions.map((transaction) => (
          <Card key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionTop}>
              <View style={styles.transactionText}>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text style={styles.transactionMeta}>
                  {transaction.category} · {formatDisplayDate(transaction.transaction_date)}
                </Text>
              </View>
              <MoneyAmount
                amount={transaction.amount}
                currency={profile?.currency ?? 'EGP'}
                size="small"
                tone={transaction.transaction_type === 'waste' ? 'danger' : 'default'}
              />
            </View>
            <View style={styles.transactionBottom}>
              <Text style={styles.typePill}>{transaction.transaction_type.replace('_', ' ')}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => handleDelete(transaction)}
                style={styles.deleteButton}
              >
                <Trash2 color={colours.danger} size={18} />
              </Pressable>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

function HelpRow({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.helpRow}>
      <Text style={styles.helpTitle}>{title}</Text>
      <InfoTooltip title={title} body={body} />
    </View>
  );
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
  guideCard: {
    gap: 8,
  },
  helpRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  helpTitle: {
    color: colours.text,
    fontSize: 15,
    fontWeight: '800',
  },
  errorCard: {
    gap: 12,
  },
  errorText: {
    color: colours.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  transactionCard: {
    gap: 12,
  },
  transactionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  transactionText: {
    flex: 1,
    gap: 4,
  },
  transactionTitle: {
    color: colours.text,
    fontSize: 17,
    fontWeight: '900',
  },
  transactionMeta: {
    color: colours.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  transactionBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typePill: {
    color: colours.primaryDark,
    backgroundColor: colours.surfaceAlt,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '800',
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
});
