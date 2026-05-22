import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { Transaction, TransactionType } from '../types/money';
import { toNumber } from '../utils/money';

type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export type CreateTransactionInput = {
  user_id: string;
  title: string;
  amount: number;
  category: string;
  transaction_type: TransactionType;
  transaction_date: string;
  notes?: string | null;
};

function normaliseTransaction(row: TransactionRow): Transaction {
  return {
    ...row,
    amount: toNumber(row.amount),
    transaction_type: row.transaction_type as TransactionType,
  };
}

export async function listTransactionsForRange(userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load transactions', error);
    throw error;
  }

  return (data ?? []).map(normaliseTransaction);
}

export async function createTransaction(payload: CreateTransactionInput) {
  const { data, error } = await supabase.from('transactions').insert(payload).select('*').single();

  if (error) {
    console.error('Failed to create transaction', error);
    throw error;
  }

  return normaliseTransaction(data);
}

export async function updateTransaction(transactionId: string, payload: TransactionUpdate) {
  const { data, error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', transactionId)
    .select('*')
    .single();

  if (error) {
    console.error('Failed to update transaction', error);
    throw error;
  }

  return normaliseTransaction(data);
}

export async function deleteTransaction(transactionId: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', transactionId);

  if (error) {
    console.error('Failed to delete transaction', error);
    throw error;
  }
}

export const transactionService = {
  listTransactionsForRange,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
