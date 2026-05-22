import type { Database } from './database';

export type TransactionType =
  | 'income'
  | 'fixed_cost'
  | 'investment'
  | 'saving'
  | 'guilt_free'
  | 'waste';

export type GoalStatus = 'active' | 'completed' | 'paused';
export type GoalPriority = 'low' | 'medium' | 'high';
export type AffordDecision = 'green' | 'yellow' | 'red';

type Tables = Database['public']['Tables'];

export type Profile = Tables['profiles']['Row'];
export type Transaction = Omit<Tables['transactions']['Row'], 'transaction_type'> & {
  transaction_type: TransactionType;
};
export type Goal = Omit<Tables['goals']['Row'], 'priority' | 'status'> & {
  priority: GoalPriority;
  status: GoalStatus;
};
export type PurchaseCheck = Omit<Tables['purchase_checks']['Row'], 'decision'> & {
  decision: AffordDecision;
};
export type MonthlyReview = Tables['monthly_reviews']['Row'];

export type MonthlySummary = {
  income: number;
  fixedCosts: number;
  invested: number;
  saved: number;
  guiltFreeSpent: number;
  waste: number;
};

export type BudgetBreakdown = {
  fixedCosts: number;
  investments: number;
  savings: number;
  guiltFree: number;
  buffer: number;
};

export type AffordDecisionResult = {
  decision: AffordDecision;
  title: string;
  message: string;
  guiltFreeRemaining: number;
  bufferBudget: number;
  savingsShortfall: number;
  investmentShortfall: number;
};
