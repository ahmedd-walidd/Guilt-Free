import type { TransactionType } from '../types/money';

export const transactionTypeOptions: { label: string; value: TransactionType }[] = [
  { label: 'Income', value: 'income' },
  { label: 'Fixed cost', value: 'fixed_cost' },
  { label: 'Investment', value: 'investment' },
  { label: 'Saving', value: 'saving' },
  { label: 'Guilt-free', value: 'guilt_free' },
  { label: 'Waste', value: 'waste' },
];

export const categoriesByType: Record<TransactionType, string[]> = {
  income: ['Salary', 'Bonus', 'Side income', 'Other income'],
  fixed_cost: ['Rent', 'Bills', 'Transport', 'Groceries', 'Phone', 'Internet', 'Subscriptions'],
  investment: ['Brokerage', 'Index fund', 'Retirement', 'Other investment'],
  saving: ['Emergency fund', 'Travel', 'Laptop', 'Car', 'Moving abroad', 'Other saving'],
  guilt_free: ['Eating out', 'Coffee', 'Gaming', 'Clothes', 'Entertainment', 'Gifts'],
  waste: ['Regretted purchase', 'Unused subscription', 'Impulse spending', 'Fees', 'Other waste'],
};
