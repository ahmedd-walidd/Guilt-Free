import type {
  AffordDecisionResult,
  BudgetBreakdown,
  Goal,
  MonthlySummary,
  Profile,
  Transaction,
} from '../types/money';
import { toNumber } from './money';

export function calculateBudgetAmount(income: number, percentage: number) {
  return (toNumber(income) * toNumber(percentage)) / 100;
}

export function calculateBudgets(profile: Profile): BudgetBreakdown {
  return {
    fixedCosts: calculateBudgetAmount(profile.monthly_income, profile.fixed_costs_percentage),
    investments: calculateBudgetAmount(profile.monthly_income, profile.investments_percentage),
    savings: calculateBudgetAmount(profile.monthly_income, profile.savings_percentage),
    guiltFree: calculateBudgetAmount(profile.monthly_income, profile.guilt_free_percentage),
    buffer: calculateBudgetAmount(profile.monthly_income, profile.buffer_percentage),
  };
}

export function calculateMonthlySummary(transactions: Transaction[]): MonthlySummary {
  return transactions.reduce<MonthlySummary>(
    (summary, transaction) => {
      const amount = toNumber(transaction.amount);

      switch (transaction.transaction_type) {
        case 'income':
          summary.income += amount;
          break;
        case 'fixed_cost':
          summary.fixedCosts += amount;
          break;
        case 'investment':
          summary.invested += amount;
          break;
        case 'saving':
          summary.saved += amount;
          break;
        case 'guilt_free':
          summary.guiltFreeSpent += amount;
          break;
        case 'waste':
          summary.waste += amount;
          break;
      }

      return summary;
    },
    {
      income: 0,
      fixedCosts: 0,
      invested: 0,
      saved: 0,
      guiltFreeSpent: 0,
      waste: 0,
    },
  );
}

export function calculateMoneyScore(profile: Profile, transactions: Transaction[], goals: Goal[]) {
  const budgets = calculateBudgets(profile);
  const summary = calculateMonthlySummary(transactions);
  const investmentTransactions = transactions.filter((item) => item.transaction_type === 'investment');
  const savingTransactions = transactions.filter((item) => item.transaction_type === 'saving');
  const income = toNumber(profile.monthly_income);
  let score = 50;

  if (summary.invested >= budgets.investments) {
    score += 20;
  }

  if (summary.saved >= budgets.savings) {
    score += 20;
  }

  if (summary.guiltFreeSpent <= budgets.guiltFree) {
    score += 15;
  }

  if (income === 0 || summary.waste < income * 0.05) {
    score += 10;
  }

  if (goals.some((goal) => goal.status === 'active')) {
    score += 5;
  }

  if (summary.guiltFreeSpent > budgets.guiltFree) {
    score -= 20;
  }

  if (income > 0 && summary.waste > income * 0.1) {
    score -= 20;
  }

  if (savingTransactions.length === 0) {
    score -= 15;
  }

  if (investmentTransactions.length === 0) {
    score -= 15;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculateAffordDecision(
  profile: Profile,
  transactions: Transaction[],
  price: number,
): AffordDecisionResult {
  const budgets = calculateBudgets(profile);
  const summary = calculateMonthlySummary(transactions);
  const guiltFreeRemaining = Math.max(0, budgets.guiltFree - summary.guiltFreeSpent);
  const savingsShortfall = Math.max(0, budgets.savings - summary.saved);
  const investmentShortfall = Math.max(0, budgets.investments - summary.invested);
  const safePrice = toNumber(price);

  if (safePrice <= guiltFreeRemaining && savingsShortfall === 0 && investmentShortfall === 0) {
    return {
      decision: 'green',
      title: 'Safe',
      message: 'You can buy this guilt-free. It fits inside your current spending system.',
      guiltFreeRemaining,
      bufferBudget: budgets.buffer,
      savingsShortfall,
      investmentShortfall,
    };
  }

  if (safePrice <= guiltFreeRemaining + budgets.buffer) {
    return {
      decision: 'yellow',
      title: 'Wait / Be careful',
      message:
        'You can buy this, but it weakens your system. Consider waiting until savings and investments are handled.',
      guiltFreeRemaining,
      bufferBudget: budgets.buffer,
      savingsShortfall,
      investmentShortfall,
    };
  }

  return {
    decision: 'red',
    title: 'Bad idea',
    message: 'Do not buy this now. Save for it first or reduce other spending.',
    guiltFreeRemaining,
    bufferBudget: budgets.buffer,
    savingsShortfall,
    investmentShortfall,
  };
}
