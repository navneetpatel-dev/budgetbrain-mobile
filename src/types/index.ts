export interface User {
  id: string;
  email: string;
  name: string | null;
  country: string | null;
  currency: string;
  role: 'free' | 'premium' | 'lifetime' | 'admin';
  onboardingCompleted: boolean;
  financialGoals: string[] | null;
  salaryRange: string | null;
  monthlySavingsTarget: number | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
  sortOrder: number;
}

export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  currency: string;
  categoryId: string | null;
  notes: string | null;
  merchant: string | null;
  date: string;
  paymentMethod: string | null;
  category?: Category;
}

export interface Budget {
  id: string;
  name: string;
  type: 'monthly' | 'weekly' | 'category';
  amount: number;
  currency: string;
  alertThreshold: number;
  category?: Category;
}

export interface Goal {
  id: string;
  name: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate: string | null;
}

export interface DashboardData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
    currency: string;
  };
  recentTransactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  categoryBreakdown: Array<{ categoryId: string; total: string; category?: Category }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { message: string; code?: string };
}
