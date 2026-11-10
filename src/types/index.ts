export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Budget {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  totalBudget: number;
  alertThreshold: number; // e.g. 80, 90, 100 (%)
  createdAt: string;
  updatedAt?: string;
}

export type BillFrequency = 'once' | 'monthly' | 'weekly' | 'yearly';

export interface BillReminder {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category?: string;
  dueDate: string; // YYYY-MM-DD
  frequency: BillFrequency;
  isPaid: boolean;
  remindDaysBefore: number;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationType = 'budget_alert' | 'bill_reminder' | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}
