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
  categoryId: string | null;
  startDate: string;
  endDate: string | null;
  alertThreshold: number;
  spent?: number;
  category?: Category;
}

export interface IncomeSource {
  id: string;
  name: string;
  type: 'salary' | 'freelancing' | 'investments' | 'rental' | 'other';
  isRecurring: boolean;
  recurringRule: string | null;
}

export interface FinancialAccount {
  id: string;
  name: string;
  type: 'bank' | 'credit_card' | 'cash' | 'wallet';
  institution: string | null;
  accountNumberLast4: string | null;
  balance: number;
  creditLimit: number | null;
  currency: string;
  isActive: boolean;
}

export interface Investment {
  id: string;
  name: string;
  type: 'stocks' | 'mutual_fund' | 'fd' | 'crypto' | 'gold' | 'other';
  symbol: string | null;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  currency: string;
  purchaseDate: string;
  currentValue?: number;
  gainLoss?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  sentAt: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
}

export interface FamilyMembership {
  id: string;
  groupId: string;
  userId: string;
  role: string;
  group?: FamilyGroup;
}

export interface AiInsight {
  insights: string[];
  summary: { current: number; previous: number; changePercent: number };
}

export interface AiAnomaly {
  id: string;
  amount: number;
  merchant: string | null;
  date: string;
  reason: string;
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AiChatResponse {
  conversationId: string;
  message: AiChatMessage;
  messages: AiChatMessage[];
}

export interface AiConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiConversation extends AiConversationSummary {
  messages: AiChatMessage[];
}

export interface ParsedTransactionPending {
  id: string;
  source: 'sms' | 'email';
  parsedAmount: number | null;
  parsedMerchant: string | null;
  confidence: number;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedTransactions extends PaginationMeta {
  transactions: Transaction[];
}

export type PaginatedList<K extends string, T> = PaginationMeta & Record<K, T[]>;

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
